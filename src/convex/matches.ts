import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  FULL_TIME_MINUTE,
  goalAt,
  matchSeed,
} from "./engine";

// ---------------------------------------------------------------------------
// Seed: 8 fictional clubs, double round-robin (14 rounds x 4 matches) and a
// small news feed. Runs once, guarded by team count.
// ---------------------------------------------------------------------------

const CLUBS = [
  { name: "Riba D'Arena", short: "RIB", city: "Póvoa de Varzim", color: "#FF7A1A", rating: 88 },
  { name: "Águas Santas", short: "AGS", city: "Maia", color: "#38BDF8", rating: 84 },
  { name: "Marítimo And.", short: "MAR", city: "Funchal", color: "#34D399", rating: 80 },
  { name: "Belenenses HB", short: "BEL", city: "Lisboa", color: "#60A5FA", rating: 82 },
  { name: "Xico Andebol", short: "XIC", city: "Lisboa", color: "#F87171", rating: 74 },
  { name: "Juventude D. Carlos", short: "JUV", city: "Lisboa", color: "#A78BFA", rating: 76 },
  { name: "Boa Hora HC", short: "BOA", city: "Lisboa", color: "#FBBF24", rating: 70 },
  { name: "Pavilhão Norte", short: "PAV", city: "Famalicão", color: "#F472B6", rating: 72 },
];

const NEWS = [
  {
    title: "Época 2025/26 arranca com direto ao minuto",
    tag: "liga",
    summary:
      "Oito equipas, 14 jornadas e um novo formato de direto dentro do app.",
    body:
      "A nova época traz o formato de dupla volta entre os oito clubes fundadores. Todos os jogos estão disponíveis em direto no separador Jogos, com a classificação a atualizar em tempo real após cada golo.",
  },
  {
    title: "Riba D'Arena reforça o setor de extremos",
    tag: "mercado",
    summary:
      "O clube da Póvoa contratou dois extremos jovens para rodar mais o ataque.",
    body:
      "Depois de uma pré-época exigente, o treinador anunciou rotação alargada nos extremos. O objetivo: manter o ritmo acima dos 60 remates por jogo nos últimos 15 minutos.",
  },
  {
    title: "Guia: como treinar o contra-ataque",
    tag: "treinos",
    summary:
      "Três blocos de exercícios para transformar recuperação em golos rápidos.",
    body:
      "Bloco 1 — saída em superioridade 3v2 com passo de lançamento. Bloco 2 — primeiro passe longo antes do meio-campo. Bloco 3 — finalização com braço alto em suspensão. Regista os blocos no Diário para acompanhar a carga semanal.",
  },
  {
    title: "Boa Hora aposta na defesa 5-1",
    tag: "tática",
    summary:
      "O sistema misto aparece em 60% das situações nos treinos de terça.",
    body:
      "O avançado trava o central adversário e obriga ao passe cruzado. Os dados do app mostram menos 4 golos sofridos por jogo quando a defesa fecha antes do minuto 25.",
  },
];

const DAY_MS = 86_400_000;
const PAST_ROUNDS = 6; // fully simulated, finished
const LIVE_COUNT = 2; // matches of the current round that start live

function roundRobin(): [number, number][][] {
  const n = CLUBS.length;
  let ids = [...Array(n).keys()];
  const rounds: [number, number][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) pairs.push([ids[i], ids[n - 1 - i]]);
    rounds.push(pairs);
    ids = [ids[0], ids[n - 1], ...ids.slice(1, n - 1)];
  }
  const second = rounds.map((ps) => ps.map(([a, b]) => [b, a] as [number, number]));
  return [...rounds, ...second];
}

function simulate(ratingHome: number, ratingAway: number, seed: number) {
  let hs = 0;
  let as = 0;
  for (let minute = 1; minute <= FULL_TIME_MINUTE; minute++) {
    if (goalAt(seed, 0, ratingHome, minute)) hs++;
    if (goalAt(seed, 1, ratingAway, minute)) as++;
  }
  return { hs, as };
}

async function applyResult(
  ctx: any,
  home: any,
  away: any,
  hs: number,
  as: number,
) {
  const homePts = hs > as ? 2 : hs === as ? 1 : 0;
  const awayPts = as > hs ? 2 : hs === as ? 1 : 0;
  await ctx.db.patch(home._id, {
    played: home.played + 1,
    won: home.won + (hs > as ? 1 : 0),
    drawn: home.drawn + (hs === as ? 1 : 0),
    lost: home.lost + (hs < as ? 1 : 0),
    goalsFor: home.goalsFor + hs,
    goalsAgainst: home.goalsAgainst + as,
    points: home.points + homePts,
  });
  await ctx.db.patch(away._id, {
    played: away.played + 1,
    won: away.won + (as > hs ? 1 : 0),
    drawn: away.drawn + (as === hs ? 1 : 0),
    lost: away.lost + (as < hs ? 1 : 0),
    goalsFor: away.goalsFor + as,
    goalsAgainst: away.goalsAgainst + hs,
    points: away.points + awayPts,
  });
}

export const seedLeague = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("teams").first();
    if (existing !== null) return;

    const teamIds = [];
    for (const c of CLUBS) {
      teamIds.push(
        await ctx.db.insert("teams", {
          name: c.name,
          short: c.short,
          city: c.city,
          color: c.color,
          rating: c.rating,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        }),
      );
    }
    const teams = await ctx.db.query("teams").collect();
    const now = Date.now();
    const rounds = roundRobin();

    for (let r = 0; r < rounds.length; r++) {
      for (let i = 0; i < rounds[r].length; i++) {
        const [hi, ai] = rounds[r][i];
        const home = teams[hi];
        const away = teams[ai];
        const seed = matchSeed(r + 1, hi, ai);
        let kickoff: number;
        let status: "scheduled" | "live" | "finished";
        let minute = 0;
        let hs = 0;
        let as = 0;

        if (r < PAST_ROUNDS) {
          const sim = simulate(home.rating, away.rating, seed);
          hs = sim.hs;
          as = sim.as;
          status = "finished";
          minute = FULL_TIME_MINUTE;
          kickoff = now - (PAST_ROUNDS - r) * DAY_MS;
          await applyResult(ctx, home, away, hs, as);
        } else if (r === PAST_ROUNDS) {
          if (i < LIVE_COUNT) {
            status = "live";
            kickoff = now - 5 * 60_000;
          } else {
            status = "scheduled";
            kickoff = now + 20 * 60_000 + i * 5 * 60_000;
          }
        } else {
          status = "scheduled";
          // Rolling season: a new round kicks off every ~15 real minutes.
          kickoff = now + (r - PAST_ROUNDS) * 15 * 60_000 + i * 5 * 60_000;
        }

        await ctx.db.insert("matches", {
          round: r + 1,
          kickoff,
          status,
          minute,
          lastTickAt: now,
          homeIdx: hi,
          awayIdx: ai,
          homeTeamId: teamIds[hi],
          awayTeamId: teamIds[ai],
          homeScore: hs,
          awayScore: as,
        });
      }
    }

    for (let i = 0; i < NEWS.length; i++) {
      const n = NEWS[i];
      await ctx.db.insert("news", {
        title: n.title,
        summary: n.summary,
        body: n.body,
        tag: n.tag,
        publishedAt: now - (i + 1) * 36 * 3_600_000,
      });
    }
  },
});

// Public bootstrap: idempotent, safe to call on every app load.
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("teams").first();
    if (existing === null) {
      await ctx.runMutation(internal.matches.seedLeague);
    }
  },
});

// ---------------------------------------------------------------------------
// Live engine: promote scheduled matches whose kickoff has passed, advance
// live matches based on elapsed real time, apply results on full time.
// ---------------------------------------------------------------------------

export const tick = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const teams = await ctx.db.query("teams").collect();
    const byId = new Map(teams.map((t) => [t._id, t]));

    // Promote scheduled → live.
    const scheduled = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();
    for (const m of scheduled) {
      if (m.kickoff <= now) {
        await ctx.db.patch(m._id, {
          status: "live",
          minute: 0,
          lastTickAt: now,
          homeScore: 0,
          awayScore: 0,
        });
      }
    }

    // Advance live matches.
    const live = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();

    for (const m of live) {
      const elapsed = Math.floor((now - m.lastTickAt) / 5000);
      if (elapsed <= 0) continue;
      const target = Math.min(FULL_TIME_MINUTE, m.minute + elapsed);

      const home = byId.get(m.homeTeamId)!;
      const away = byId.get(m.awayTeamId)!;
      const seed = matchSeed(m.round, m.homeIdx, m.awayIdx);

      let hs = m.homeScore;
      let as = m.awayScore;
      for (let minute = m.minute + 1; minute <= target; minute++) {
        if (goalAt(seed, 0, home.rating, minute)) hs++;
        if (goalAt(seed, 1, away.rating, minute)) as++;
      }

      const finished = target >= FULL_TIME_MINUTE;
      await ctx.db.patch(m._id, {
        minute: target,
        homeScore: hs,
        awayScore: as,
        status: finished ? "finished" : "live",
        lastTickAt: now,
      });

      if (finished) await applyResult(ctx, home, away, hs, as);
    }
  },
});
