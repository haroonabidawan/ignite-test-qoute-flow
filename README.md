# QuoteFlow

Monorepo for the AI-assisted quotation builder technical test.

## For Ignite reviewers (production)

**Live demo:** https://quoteflow.haroonabidawan.com

| Service         | URL                                           |
| --------------- | --------------------------------------------- |
| **App**         | https://quoteflow.haroonabidawan.com          |
| API / Swagger   | https://api.quoteflow.haroonabidawan.com/docs |
| Docs            | https://docs.quoteflow.haroonabidawan.com     |
| Approval emails | https://mail.quoteflow.haroonabidawan.com     |
| n8n             | https://n8n.quoteflow.haroonabidawan.com      |

Login: `admin@example.com` / `password123`

**Full test walkthrough:** [`REVIEWER.md`](REVIEWER.md) or [Production reviewer guide](apps/docs/docs/getting-started/reviewer-guide.md) (also on the docs site).

## Stack

- **Web:** Next.js 16 (`apps/web`) + shared UI (`packages/ui`, Gluestack UI + Tailwind)
- **Package manager:** pnpm

## Development

From the repo root:

```bash
make setup
make up-build
```

Open [http://localhost:3010](http://localhost:3010).

Run `make help` for all available commands.

## Development with Docker

A full dev stack (Postgres + FastAPI + Next.js) is defined in `compose.yaml`.
Source is bind-mounted, so both the API and web app hot-reload on file changes.

```bash
cp .env.example .env   # optional
make up-build
make seed              # idempotent; also runs automatically on API startup
```

Open [http://localhost:3010](http://localhost:3010) and sign in with the demo account below.

**Demo login:** `admin@example.com` / `password123` (seeded on first API start)

| Service   | URL                        | Notes                                         |
| --------- | -------------------------- | --------------------------------------------- |
| `web`     | http://localhost:3010      | Next.js dev server (`WEB_PORT`, default 3010) |
| `api`     | http://localhost:8000/docs | FastAPI + Alembic migrations                  |
| `docs`    | http://localhost:3100      | Docsify project documentation                 |
| `db`      | `localhost:5432`           | Postgres 16 (`quoteflow`/`quoteflow`)         |
| `n8n`     | http://localhost:5678      | Workflow editor (dev import on first boot)    |
| `mailpit` | http://localhost:8025      | Catches approval notification emails          |

Data persists in Docker volumes; run `docker compose down -v` to reset.

### Test the approve → n8n → email flow

1. `make up-build` (starts db, api, web, docs, n8n, mailpit)
2. Log in at http://localhost:3010 (`admin@example.com` / `password123`)
3. Create a client and quotation, add line items, click **Approve & notify**
4. Open http://localhost:8025 - you should see the approval email
5. Optional: open http://localhost:5678 to inspect the imported workflow (`n8n/quotation-approved.json`)

The API posts to `N8N_WEBHOOK_URL` (default `http://n8n:5678/webhook/quotation-approved`). Approval still succeeds if the webhook fails; check the UI message for `webhook_delivered`.

## Production with Docker

Production uses the **same full stack** (Postgres, API, web, n8n, Mailpit) with baked images - no bind mounts or hot reload.

```bash
cp .env.prod.example .env   # set POSTGRES_PASSWORD, SECRET_KEY, N8N_ENCRYPTION_KEY
make prod-up-build
make prod-seed              # first run - creates admin@example.com
```

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `make prod-up-build` | Build prod images and start all services |
| `make prod-up`       | Start without rebuilding                 |
| `make prod-down`     | Stop (keep volumes)                      |
| `make prod-down-v`   | Stop and reset volumes                   |
| `make prod-seed`     | Seed admin user                          |

| Service   | URL                         |
| --------- | --------------------------- |
| `web`     | http://localhost:13000      |
| `api`     | http://localhost:18000/docs |
| `docs`    | http://localhost:13100      |
| `mailpit` | http://localhost:18025      |
| `n8n`     | http://localhost:15678      |

Host ports default high (`13000`/`18000`/…) so they do not clash with other apps on `:3000`/`:8000`. Override with `WEB_HOST_PORT`, `API_HOST_PORT`, `DOCS_HOST_PORT`, etc. Dokploy **domain** mappings still use container ports `3000` / `8000` / `80` (docs).

Files: `compose.prod.yaml`, `apps/web/Dockerfile.prod`, `apps/apis/Dockerfile.prod`, `apps/docs/Dockerfile.prod`, `.env.prod.example`.

### Dokploy

See [Dokploy deployment](apps/docs/docs/deployment/dokploy.md) in the docs site (`pnpm dev:docs`).

## Demo login

- Email: `admin@example.com`
- Password: `password123`

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `pnpm dev:web`      | Start the web app            |
| `pnpm dev:docs`     | Project docs (Docsify :3100) |
| `pnpm build`        | Production build             |
| `pnpm lint`         | Lint all packages            |
| `pnpm typecheck`    | Typecheck all packages       |
| `pnpm test:backend` | Run API pytest suite         |
| `pnpm test:ui`      | Run UI vitest suite          |
| `pnpm validate`     | Full pre-push health check   |

## Structure

```
apps/web/          Next.js routes (thin wrappers)
apps/apis/         FastAPI backend + tests
packages/ui/       Screens, layout, Gluestack components
packages/api/      TanStack Query client
packages/i18n/     EN/AR translations
Technical-Test.md  Assessment brief
APPROACH.md        Architecture rationale & production notes
ai-notes.md        AI tooling disclosure
AUDIT.md           Gap analysis vs Technical-Test
```

Full documentation: `pnpm dev:docs` → http://localhost:3100

## Cursor / AI setup

This repo includes agent guidance for Cursor:

| Path              | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `AGENTS.md`       | Start here - monorepo map, commands, conventions               |
| `.cursor/rules/`  | Scoped rules (TypeScript, Next.js, Gluestack, turbo, …)        |
| `.agents/skills/` | Agent skills (`quoteflow` local + `gluestack-ui-v4` installed) |

After clone:

```bash
pnpm install
pnpm skills:install    # installs Gluestack v4 skills into .agents/skills/
pnpm dev:web
```
