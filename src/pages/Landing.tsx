import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Newspaper,
  Radio,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { MatchCard, StandingsTable, useLeague } from "../components/league";

const FEATURES = [
  {
    icon: Radio,
    title: "Direto ao minuto",
    desc: "Placard ao vivo, ritmo de jogo real e resultado a atualizar após cada golo.",
  },
  {
    icon: Trophy,
    title: "Classificação viva",
    desc: "Pontos, diferença de golos e forma — recalculada em tempo real, sem refresh.",
  },
  {
    icon: ClipboardList,
    title: "Diário de treinos",
    desc: "Regista sessões, foco, duração e intensidade. A tua carga semanal sempre à mão.",
  },
  {
    icon: Activity,
    title: "Estatísticas da época",
    desc: "Ataque, defesa e tendências de cada clube da liga, atualizadas a cada jornada.",
  },
  {
    icon: Newspaper,
    title: "Notícias e tática",
    desc: "Liga, mercado e blocos de treino — contexto para quem vive o pavilhão.",
  },
  {
    icon: Shield,
    title: "Conta e dados teus",
    desc: "O diário é teu e privado. Entra em segundos e retoma onde ficaste.",
  },
];

export default function Landing() {
  const { isAuthenticated } = useConvexAuth();
  const { now, teamById, live, upcoming, standings } = useLeague();

  const featured = live[0] ?? upcoming[0];

  const appHref = isAuthenticated ? "/app" : "/auth?returnTo=%2Fapp";

  return (
    <div className="min-h-screen court-bg">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Resina">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#direto" className="transition-colors hover:text-foreground">Direto</a>
            <a href="#features" className="transition-colors hover:text-foreground">Funcionalidades</a>
            <a href="#classificacao" className="transition-colors hover:text-foreground">Classificação</a>
          </nav>
          <Button asChild>
            <Link to={appHref}>
              {isAuthenticated ? "Abrir app" : "Entrar"}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-5 border-primary/40 bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" />
              Época 2025/26 · Jornada a decorrer
            </Badge>
            <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              O andebol inteiro,
              <br />
              <span className="text-primary text-glow">num só app.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Jogos em direto, classificação que se atualiza golo a golo, diário de
              treinos e o pulso da liga. Do aquecimento ao apito final.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild className="glow-primary">
                <Link to={appHref}>
                  Começar agora
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#direto">Ver jogos em direto</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" /> 8 clubes · 14 jornadas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" /> Temporada a rolar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-live" /> {live.length} em jogo
              </span>
            </div>
          </motion.div>

          {/* Featured live match */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-x-6 -bottom-4 h-24 rounded-full bg-primary/10 blur-3xl" />
            {featured ? (
              <Card className="relative border-primary/30 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    {featured.status === "live" ? (
                      <>
                        <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-live" />
                        <span className="text-live">Em direto</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" /> Próximo jogo
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">Resina Liga</span>
                </div>
                <CardContent className="p-5">
                  <MatchCard match={featured} teamById={teamById} now={now} featured />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Remates", value: "24" },
                      { label: "Exclusões", value: "3" },
                      { label: "7 metros", value: "2/3" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border/70 bg-muted/30 px-2 py-2.5">
                        <div className="font-display text-lg font-black">{s.value}</div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                A liga está a aquecer — o primeiro jogo começa em breve.
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* Live strip */}
      <section id="direto" className="border-y border-border/70 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Badge variant="live" className="mb-3">
                <Radio className="h-3.5 w-3.5" /> Direto
              </Badge>
              <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                Agora nos pavilhões
              </h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to={appHref}>
                Toda a liga <ArrowRight />
              </Link>
            </Button>
          </div>
          {live.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {live.slice(0, 4).map((m) => (
                <MatchCard key={m._id} match={m} teamById={teamById} now={now} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Sem jogos neste momento. A próxima jornada arranca em breve — vê o calendário abaixo.
            </p>
          )}

          {upcoming.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Próximos jogos
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.slice(0, 3).map((m) => (
                  <MatchCard key={m._id} match={m} teamById={teamById} now={now} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
            Tudo o que precisas, sem sair do app
          </h2>
          <p className="mt-3 text-muted-foreground">
            Feito para quem joga, treina e segue a liga — joga e acompanha no mesmo sítio.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="card-hover h-full">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <f.icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-display text-base font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Standings preview */}
      <section id="classificacao" className="border-t border-border/70 bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Badge variant="accent" className="mb-3">
                <Trophy className="h-3.5 w-3.5" /> Classificação
              </Badge>
              <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                A liga, golo a golo
              </h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to={appHref}>Tabela completa <ArrowRight /></Link>
            </Button>
          </div>
          <Card>
            <CardContent className="p-2 sm:p-4">
              <StandingsTable standings={standings} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
            O próximo apito inicial é teu.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Cria a tua conta, segue cada jornada e regista os teus treinos — tudo
            num só lugar.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild className="glow-primary">
              <Link to={appHref}>
                Criar conta grátis <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo className="opacity-80" />
          <span>Feito com resina e paixão pelo andebol.</span>
        </div>
      </footer>
    </div>
  );
}
