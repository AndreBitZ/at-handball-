# Resina — Andebol num só app

App completo de andebol: jogos em direto (simulação ao minuto), classificação em tempo real, diário de treinos pessoal e notícias da liga.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend/DB:** Convex (queries reativas, auth com password provider)
- **Auth:** Convex Auth (`@convex-dev/auth`) com fluxo signIn/signUp

## Funcionalidades

- 🏟️ **Liga simulada** — 8 clubes, 14 jornadas, motor determinístico que avança os jogos ao minuto (1 minuto de jogo ≈ 5s reais)
- 🔴 **Direto** — placard ao vivo, promoção automática de agendados para "em jogo", resultado final aplica-se à classificação
- 🏆 **Classificação** — pontos, golos marcados/sofridos, diferença; atualiza em tempo real
- 📋 **Diário de treinos** — registos privados por utilizador (foco, duração, intensidade, notas) com carga semanal
- 📰 **Notícias** — liga, mercado, tática e treinos
- 🔐 **Rotas protegidas** — `/app` exige sessão; `/auth?returnTo=…` preserva o destino

## Comandos

```bash
bun install          # dependências
bun run dev          # dev server (Vite)
bun run build        # build de produção (dist/)
bun run typecheck    # tsc -b --noEmit
bun run convex:push  # convex dev --once (codegen + push)
bun run convex:dev   # backend Convex em modo dev (local: porta 3210)
```

## Como testar

1. **Terminal 1 — backend:** `bun run convex:dev` (deixa correr)
2. **Terminal 2 — frontend:** `bun run dev` → abre o URL do Vite (ex.: `http://localhost:5173`)
3. No app: **Criar conta** → entra → o dashboard carrega a liga simulada
4. O que verificar:
   - A landing mostra jogos **em direto** (placar muda a cada ~5s)
   - A classificação atualiza quando um jogo termina
   - O diário de treinos guarda registos ligados à tua conta

Variáveis de ambiente: ver `env.example.md` (`VITE_CONVEX_URL`).

## Deploy na Vercel

Sim, é compatível — o `vercel.json` já está configurado (SPA com fallback de rotas).

1. `vercel` (na raiz do projeto) ou liga o repo em vercel.com
2. Define a env var `VITE_CONVEX_URL` (Settings → Environment Variables) apontando para o teu deployment Convex **cloud**
3. Faz push do código Convex para o mesmo projeto: `bun run convex:push`
4. Deploy → a build é `vite build`, output estático em `dist/`

> Nota: o Convex Auth usa cookies; funciona sem configuração extra porque o frontend e o backend ficam no mesmo domínio de deployment (vercel) → convex cloud via HTTPS.

## Estrutura

```
src/
  convex/          # schema, auth, motor de jogos, queries/mutations
  components/      # UI (shadcn/ui), liga compartilhada, logo
  pages/           # Landing, Auth, Dashboard
  lib/             # utilitários
```
