# Variáveis de ambiente (exemplo)

Copia este ficheiro para `.env` (local) ou usa-o como referência na Vercel.

## Frontend (Vite → browser)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_CONVEX_URL` | ✅ | URL do deployment Convex (ex.: `https://acme-123.convex.cloud`). O frontend liga-se por aqui. |

## Backend (funções Convex)

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `CONVEX_DEPLOYMENT` | automática | Nome do deployment; o CLI do Convex gere-a — normalmente não precisas de a definir à mão. |

## Notas

- Em dev, `bun run convex:dev` inicia o backend local (porta 3210) e o CLI mostra o `VITE_CONVEX_URL` a usar.
- Na Vercel, define `VITE_CONVEX_URL` em Settings → Environment Variables (Production e Preview).
