import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

// Friendly setup screen: shown only when the app is built without a Convex
// URL (e.g. first Vercel deploy before the backend deploy key is added).
function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070C17] p-6 text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7A1A] text-2xl">
          🤾
        </div>
        <h1 className="font-display text-2xl font-black">Falta 1 passo para a liga arrancar</h1>
        <p className="mt-3 text-sm text-white/70">
          O site já está no ar, mas ainda não está ligado à base de dados
          (Convex). É só colar uma chave na Vercel:
        </p>
        <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm text-white/80">
          <li>
            Cria uma conta grátis em{" "}
            <a className="text-[#FF7A1A] underline" href="https://dashboard.convex.dev" target="_blank" rel="noreferrer">
              dashboard.convex.dev
            </a>{" "}e clica <em>Create project</em>.
          </li>
          <li>
            No projeto Convex: <em>Settings → Deploy key</em> → clica em{" "}
            <em>Generate Production Deploy Key</em> e copia.
          </li>
          <li>
            Na Vercel: <em>Settings → Environment Variables</em> → nome{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">CONVEX_DEPLOY_KEY</code>, cola a chave e guarda.
          </li>
          <li>
            Ainda na Vercel: <em>Deployments</em> → ⋯ no deploy mais recente →{" "}
            <em>Redeploy</em>. O backend e o site passam a atualizar-se sozinhos a cada mudança.
          </li>
        </ol>
        <p className="mt-4 text-xs text-white/50">
          Depois deste passo, esta página dá lugar à Resina Liga completa.
        </p>
      </div>
    </div>
  );
}

if (!convexUrl) {
  ReactDOM.createRoot(document.getElementById("root")!).render(<SetupRequired />);
} else {
  const convex = new ConvexReactClient(convexUrl);
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <ConvexAuthProvider client={convex}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConvexAuthProvider>
      </ConvexProvider>
    </React.StrictMode>,
  );
}
