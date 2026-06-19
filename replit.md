# Sync-It-Better

AI-powered developer platform (Replit/v0 clone) that lets users chat with Groq's Llama 3.3 70B model, organize conversations into projects, and build software faster. Copyright 2026 Princeton Taylor.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/platform run dev` — run the React frontend (port 3000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (always run after editing openapi.yaml)
- Required env: `DATABASE_URL` — Postgres connection string, `GROQ_API_KEY` — Groq API key, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter router, TailwindCSS v4, shadcn/ui, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Groq SDK (llama-3.3-70b-versatile), Server-Sent Events streaming
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do NOT edit manually)
- `lib/api-zod/src/generated/api.ts` — generated Zod validators (do NOT edit manually)
- `lib/db/src/schema.ts` — Drizzle ORM DB schema
- `artifacts/api-server/src/routes/` — Express route handlers (conversations, messages, projects)
- `artifacts/platform/src/pages/` — all React pages
- `artifacts/platform/src/components/` — shared UI components (sidebar, layout, shadcn/ui)

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives both React Query hooks (`@workspace/api-client-react`) and Zod validators (`@workspace/api-zod`) via Orval codegen. Never write hooks or validators manually.
- **SSE streaming**: AI responses stream via Server-Sent Events on `POST /api/conversations/:id/messages`. The frontend reads chunks incrementally to render partial responses.
- **Orval zod mode: single**: The zod codegen must use `mode: "single"` (not `"split"`) and must NOT include the `schemas` option — otherwise TypeScript type definitions and Zod schema exports get the same names and cause TS2308 duplicate-export errors.
- **api-zod index.ts**: Only exports `./generated/api`. Do NOT re-add `./generated/types` — that path no longer exists in single mode and caused duplicate exports in split mode.
- **Path-based routing**: Platform at `/platform/`, API at `/api/`. All client-side routes are relative to `BASE_PATH=/platform/`.

## Product

- Chat interface powered by Groq Llama 3.3 70B with streaming responses and markdown rendering
- Projects to group related conversations
- Sidebar with recent chats and project navigation
- Pages: Home (chat), Projects, Project Detail, Docs, Pricing, Settings, About, Terms, Privacy

## User preferences

- Owner: Princeton Taylor, Copyright 2026
- App name: Sync-It-Better

## Gotchas

- After editing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen`. It runs typecheck:libs automatically. If it fails, check `lib/api-zod/src/index.ts` — codegen may rewrite it with a stale `./generated/types` re-export that must be removed.
- Do not run `pnpm dev` at workspace root — use the workflow runner or `--filter` flag.
- The api-server runs on port 8080 (not 5000). The platform workflow sets `PORT=3000` and `BASE_PATH=/platform/` via `[services.env]` in its `artifact.toml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
