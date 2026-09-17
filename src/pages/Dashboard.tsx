import { useMemo, useState } from "react";
import { FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Radio,
  Trash2,
  Trophy,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  MatchCard,
  StandingsTable,
  formatKickoff,
  teamColorStyle,
  useLeague,
  type NewsItem,
  type Team,
  type Training,
} from "../components/league";

const FOCUS_OPTIONS = [
  "Físico",
  "Técnico",
  "Tático",
  "Defesa",
  "Contra-ataque",
  "Recuperação",
];

export default function Dashboard() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.current);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center court-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth?returnTo=%2Fapp", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen court-bg">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/app" aria-label="Resina">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.email ?? "jogador"}
            </span>
            <Button variant="outline" size="sm" onClick={() => void signOut().then(() => navigate("/", { replace: true }))}>
              <LogOut /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex w-full justify-start overflow-x-auto scrollbar-thin sm:w-auto">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4" /> Resumo
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Radio className="h-4 w-4" /> Jogos
            </TabsTrigger>
            <TabsTrigger value="standings">
              <Trophy className="h-4 w-4" /> Classificação
            </TabsTrigger>
            <TabsTrigger value="trainings">
              <ClipboardList className="h-4 w-4" /> Treinos
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4" /> Notícias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="matches">
            <MatchesTab />
          </TabsContent>
          <TabsContent value="standings">
            <StandingsTab />
          </TabsContent>
          <TabsContent value="trainings">
            <TrainingsTab />
          </TabsContent>
          <TabsContent value="news">
            <NewsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewTab() {
  const { now, teamById, live, upcoming, standings, teams } = useLeague();
  const trainings = useQuery(api.trainings.listMine) ?? [];

  const totals = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    const recent = trainings.filter((t) => t.date >= toISO(weekAgo));
    const minutes = recent.reduce((acc, t) => acc + t.durationMin, 0);
    const load = recent.reduce((acc, t) => acc + t.durationMin * t.intensity, 0);
    return { count: recent.length, minutes, load };
  }, [trainings]);

  const leader = standings[0];
  const totalGoals = teams.reduce((acc, t) => acc + t.goalsFor, 0) / 2;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Bem-vindo ao pavilhão 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          A liga em tempo real e a tua semana, num só ecrã.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Radio} label="Em jogo agora" value={String(live.length)} accent={live.length > 0} />
        <StatCard icon={CalendarDays} label="Próximos jogos" value={String(upcoming.length)} />
        <StatCard
          icon={Activity}
          label="Golos na liga"
          value={Math.round(totalGoals).toString()}
        />
        <StatCard
          icon={ClipboardList}
          label="Carga 7 dias"
          value={`${totals.load}`}
          hint={`${totals.count} treinos · ${totals.minutes} min`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Agora em direto
          </h2>
          {live.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {live.map((m) => (
                <MatchCard key={m._id} match={m} teamById={teamById} now={now} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center gap-3 p-5 text-muted-foreground">
                <Radio className="h-5 w-5 opacity-50" />
                Sem jogos ao vivo neste momento — há {upcoming.length} agendados.
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Próximos apitos
          </h2>
          <Card>
            <CardContent className="divide-y divide-border/60 p-2">
              {upcoming.slice(0, 5).map((m) => {
                const home = teamById.get(m.homeTeamId);
                const away = teamById.get(m.awayTeamId);
                return (
                  <div key={m._id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate">
                      {home?.short} <span className="text-muted-foreground">vs</span> {away?.short}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-accent">
                      {formatKickoff(m.kickoff, now)}
                    </span>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  Calendário a ser definido…
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {leader && (
        <Card className="border-primary/30">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Líder da liga</div>
                <div className="font-display text-lg font-black">{leader.name}</div>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <MiniStat label="Pontos" value={String(leader.points)} />
              <MiniStat label="Vitórias" value={String(leader.won)} />
              <MiniStat label="Golos" value={String(leader.goalsFor)} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MatchesTab() {
  const { now, teamById, live, upcoming, finished } = useLeague();
  const [filter, setFilter] = useState<"all" | "live" | "scheduled" | "finished">("all");

  const filtered = matchesFilter({ live, upcoming, finished }, filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-black tracking-tight">Jogos</h1>
        <div className="flex gap-1.5 rounded-lg bg-muted p-1">
          {(
            [
              ["all", "Todos"],
              ["live", "Direto"],
              ["scheduled", "Agendados"],
              ["finished", "Terminados"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {key === "live" && live.length > 0 && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live align-middle" />
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Sem jogos nesta categoria.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard key={m._id} match={m} teamById={teamById} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function matchesFilter(
  {
    live,
    upcoming,
    finished,
  }: { live: ReturnType<typeof useLeague>["live"]; upcoming: ReturnType<typeof useLeague>["upcoming"]; finished: ReturnType<typeof useLeague>["finished"] },
  filter: "all" | "live" | "scheduled" | "finished",
) {
  const all = [...live, ...upcoming, ...finished].sort((a, b) => a.kickoff - b.kickoff);
  if (filter === "all") return all;
  if (filter === "live") return live;
  if (filter === "scheduled") return upcoming;
  return finished;
}

function StandingsTab() {
  const { standings } = useLeague();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Classificação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          2 pontos por vitória · 1 por empate · atualiza em tempo real com cada jogo terminado.
        </p>
      </div>
      <Card>
        <CardContent className="p-2 sm:p-4">
          <StandingsTable standings={standings} />
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingsTab() {
  const trainings = useQuery(api.trainings.listMine) ?? [];
  const add = useMutation(api.trainings.add);
  const remove = useMutation(api.trainings.remove);

  const [date, setDate] = useState(toISO(Date.now()));
  const [title, setTitle] = useState("");
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);
  const [duration, setDuration] = useState("60");
  const [intensity, setIntensity] = useState("3");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = [...trainings].sort((a, b) => (a.date < b.date ? 1 : -1));
  const totals = useMemo(() => {
    const weekAgo = toISO(Date.now() - 7 * 86_400_000);
    const recent = trainings.filter((t) => t.date >= weekAgo);
    return {
      count: recent.length,
      minutes: recent.reduce((acc, t) => acc + t.durationMin, 0),
      load: recent.reduce((acc, t) => acc + t.durationMin * t.intensity, 0),
    };
  }, [trainings]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await add({
        date,
        title,
        focus,
        durationMin: Number(duration) || 0,
        intensity: Number(intensity) || 1,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      setTitle("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Diário de treinos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regista as sessões e acompanha a tua carga semanal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="Treinos (7d)" value={String(totals.count)} />
        <StatCard icon={Activity} label="Minutos (7d)" value={String(totals.minutes)} />
        <StatCard icon={CalendarDays} label="Carga (7d)" value={String(totals.load)} hint="min × intensidade" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Novo treino</CardTitle>
            <CardDescription>Os registos são privados, só teus.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="t-date">Data</Label>
                <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-title">Título</Label>
                <Input
                  id="t-title"
                  placeholder="Ex.: Bloco de contra-ataque"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Foco</Label>
                  <Select value={focus} onValueChange={setFocus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FOCUS_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="t-dur">Duração (min)</Label>
                  <Input id="t-dur" type="number" min={10} max={300} value={duration} onChange={(e) => setDuration(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Intensidade: {intensity}/5</Label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full accent-[hsl(var(--primary))]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-notes">Notas</Label>
                <Textarea
                  id="t-notes"
                  placeholder="Exercícios, sensações, lesões…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "A guardar…" : "Guardar treino"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-3">
          {sorted.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Ainda sem treinos registados. O primeiro passo para a subida.
              </CardContent>
            </Card>
          ) : (
            sorted.map((t) => (
              <Card key={t._id} className="card-hover">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold">{t.title}</span>
                      <Badge variant="secondary">{t.focus}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(t.date + "T00:00:00").toLocaleDateString("pt-PT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      · {t.durationMin} min · intensidade {t.intensity}/5
                    </div>
                    {t.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{t.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover treino"
                    onClick={() => void remove({ id: t._id })}
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NewsTab() {
  const news = useQuery(api.news.latest) ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Notícias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O pulso da liga — resultado, mercado e treino.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {news.map((n) => (
          <NewsCard key={n._id} item={n} />
        ))}
        {news.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Sem notícias por agora.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const tagColor: Record<string, string> = {
    liga: "bg-primary/15 text-primary border-primary/30",
    mercado: "bg-accent/15 text-accent border-accent/30",
    treinos: "bg-secondary text-secondary-foreground border-border",
    tática: "bg-live/10 text-live border-live/30",
  };
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tagColor[item.tag] ?? "border-border bg-secondary text-secondary-foreground"}`}>
            {item.tag}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
          </span>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug">{item.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{item.summary}</p>
        <p className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-foreground/85">
          {item.body}
        </p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-live/50" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Icon className={`h-4 w-4 ${accent ? "text-live" : "text-primary"}`} />
        </div>
        <div className="mt-2 font-display text-3xl font-black tabular-nums">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-xl font-black tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function toISO(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
