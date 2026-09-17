import { useEffect, useState } from "react";
import { FormEvent } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { useConvexAuth } from "convex/react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Auth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") ?? "/app";

  const { signIn } = useAuthActions();
  const currentPlayer = useQuery(api.users.current);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, returnTo]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  async function handleSubmit(e: FormEvent, flow: "signIn" | "signUp") {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn("password", {
        flow,
        email,
        password,
        ...(flow === "signUp" ? { name } : {}),
      });
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Algo falhou. Verifica os dados e tenta de novo.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen court-bg">
      {/* Left panel — brand */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-border/70 p-10 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[110px]" />
        <Logo />
        <div className="relative">
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight">
            Do aquecimento
            <br />
            ao <span className="text-primary text-glow">apito final.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Direto ao minuto, classificação viva e o teu diário de treinos —
            tudo num só app.
          </p>
          <div className="mt-8 flex gap-3">
            {["Direto", "Classificação", "Treinos", "Notícias"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Resina © 2026 — feito com resina e paixão pelo andebol.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <Tabs defaultValue="signIn">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signIn">Entrar</TabsTrigger>
              <TabsTrigger value="signUp">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signIn">
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "signIn")}>
                <AuthFields
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                />
                {error && <ErrorNote msg={error} />}
                <Button type="submit" className="w-full" disabled={pending}>
                  <LogIn /> {pending ? "A entrar…" : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signUp">
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "signUp")}>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="O teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <AuthFields
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                />
                {error && <ErrorNote msg={error} />}
                <Button type="submit" className="w-full" disabled={pending}>
                  <UserPlus /> {pending ? "A criar conta…" : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {currentPlayer
              ? `Sessão ativa: ${currentPlayer.email ?? "jogador"}`
              : "Ao continuar aceitas as regras da casa. Jogo limpo."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthFields({
  email,
  setEmail,
  password,
  setPassword,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@exemplo.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Palavra-passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
        />
        <p className="text-[11px] text-muted-foreground">Mínimo 8 caracteres.</p>
      </div>
    </>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {msg}
    </div>
  );
}
