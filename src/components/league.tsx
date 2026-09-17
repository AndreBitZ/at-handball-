import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { cn } from "../lib/utils";

export type Team = Doc<"teams">;
export type Match = Doc<"matches">;
export type NewsItem = Doc<"news">;
export type Training = Doc<"trainings">;

export function useLiveClock(tickMs = 4000) {
  const [now, setNow] = useState(() => Date.now());
  const tick = useMutation(api.matches.tick);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      void tick();
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, tick]);

  return now;
}

export function useLeague() {
  const now = useLiveClock();
  useConvexBootstrap();
  const matches = useQuery(api.matchesQueries.list) ?? [];
  const teams = useQuery(api.teams.all) ?? [];
  const teamById = new Map(teams.map((t) => [t._id, t]));

  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.kickoff - b.kickoff);
  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => b.kickoff - a.kickoff);

  const standings = [...teams].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name),
  );

  return { now, matches, teams, teamById, live, upcoming, finished, standings };
}

function useConvexBootstrap() {
  const ensure = useMutation(api.matches.ensureSeeded);
  useEffect(() => {
    void ensure();
  }, [ensure]);
}

export function teamColorStyle(color: string) {
  return { backgroundColor: color };
}

export function formatKickoff(ts: number, now: number) {
  const diff = ts - now;
  if (diff <= 0) return "agora";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `em ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `em ${hours}h ${mins % 60}m`;
  const d = new Date(ts);
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

export function MatchCard({
  match,
  teamById,
  now,
  featured = false,
}: {
  match: Match;
  teamById: Map<string, Team>;
  now: number;
  featured?: boolean;
}) {
  const home = teamById.get(match.homeTeamId);
  const away = teamById.get(match.awayTeamId);
  if (!home || !away) return null;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const halfBreak = isLive && match.minute > 30 && match.minute < 33;

  return (
    <div
      className={cn(
        "card-hover rounded-lg border bg-card p-4",
        featured && "md:p-5",
        isLive && "border-live/50",
      )}
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          Jornada {match.round}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 font-bold text-live">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-live" />
            {halfBreak ? "INTERVALO" : `${match.minute}'`}
          </span>
        ) : isFinished ? (
          <span className="text-muted-foreground">Terminado</span>
        ) : (
          <span className="text-accent font-semibold">
            {formatKickoff(match.kickoff, now)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={home} align="right" />
        <div className="flex flex-col items-center">
          {isLive || isFinished ? (
            <div className="flex items-center gap-2 font-display text-3xl font-black tabular-nums">
              <span className={cn(isLive && "text-glow")}>{match.homeScore}</span>
              <span className="text-muted-foreground text-lg">–</span>
              <span className={cn(isLive && "text-glow")}>{match.awayScore}</span>
            </div>
          ) : (
            <div className="font-display text-xl font-bold text-muted-foreground">vs</div>
          )}
        </div>
        <TeamSide team={away} align="left" />
      </div>
    </div>
  );
}

function TeamSide({
  team,
  align,
}: {
  team: Team;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <span
        className="h-8 w-2.5 shrink-0 rounded-full"
        style={teamColorStyle(team.color)}
      />
      <div className="min-w-0">
        <div className="truncate font-display text-sm font-bold leading-tight">
          {team.name}
        </div>
        <div className="truncate text-xs text-muted-foreground">{team.city}</div>
      </div>
    </div>
  );
}

export function StandingsTable({ standings }: { standings: Team[] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2.5 font-medium">#</th>
            <th className="px-3 py-2.5 font-medium">Equipa</th>
            <th className="px-2 py-2.5 text-center font-medium">J</th>
            <th className="px-2 py-2.5 text-center font-medium">V</th>
            <th className="px-2 py-2.5 text-center font-medium">E</th>
            <th className="px-2 py-2.5 text-center font-medium">D</th>
            <th className="px-2 py-2.5 text-center font-medium">GM</th>
            <th className="px-2 py-2.5 text-center font-medium">GS</th>
            <th className="px-2 py-2.5 text-center font-medium">DG</th>
            <th className="px-3 py-2.5 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((t, i) => (
            <tr
              key={t._id}
              className="border-t border-border/60 transition-colors hover:bg-muted/40"
            >
              <td className="px-3 py-2.5">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-md font-display text-xs font-bold",
                    i === 0 && "bg-primary text-primary-foreground",
                    i > 0 && i < 3 && "bg-secondary text-secondary-foreground",
                    i >= 3 && "text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={teamColorStyle(t.color)}
                  />
                  <span className="font-semibold">{t.name}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {t.city}
                  </span>
                </div>
              </td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{t.played}</td>
              <td className="px-2 py-2.5 text-center tabular-nums">{t.won}</td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{t.drawn}</td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{t.lost}</td>
              <td className="px-2 py-2.5 text-center tabular-nums">{t.goalsFor}</td>
              <td className="px-2 py-2.5 text-center tabular-nums text-muted-foreground">{t.goalsAgainst}</td>
              <td className="px-2 py-2.5 text-center tabular-nums">
                {t.goalsFor - t.goalsAgainst > 0 ? "+" : ""}
                {t.goalsFor - t.goalsAgainst}
              </td>
              <td className="px-3 py-2.5 text-center font-display text-base font-black tabular-nums">
                {t.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
