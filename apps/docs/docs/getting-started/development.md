# Development

## Monorepo scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm dev:web`     | Next.js dev server (webpack) |
| `pnpm dev:backend` | FastAPI with hot reload      |
| `pnpm dev:docs`    | Docsify on port 3100         |
| `pnpm build`       | Production build (turbo)     |
| `pnpm lint`        | ESLint across packages       |
| `pnpm typecheck`   | TypeScript check             |
| `pnpm format`      | Prettier + Black/Ruff        |

## Docker dev stack (`compose.yaml`)

Bind-mounts source for hot reload on **api** and **web**.

| Variable          | Default | Notes                        |
| ----------------- | ------- | ---------------------------- |
| `WEB_PORT`        | `3010`  | Host port → container `3000` |
| `API_PORT`        | `8000`  | FastAPI                      |
| `POSTGRES_PORT`   | `5432`  | Postgres                     |
| `N8N_PORT`        | `5678`  | Workflow editor              |
| `MAILPIT_UI_PORT` | `8025`  | Dev email inbox              |

```bash
make up-build    # start
make down        # stop
make down-v      # stop + wipe DB volumes
make migrate     # run Alembic in api container
make seed        # admin user + demo data
```

## Where to add code

| Change       | Location                                         |
| ------------ | ------------------------------------------------ |
| New screen   | `packages/ui/src/screens/*-screen.tsx`           |
| New route    | `apps/web/app/**/page.tsx` (import screen only)  |
| API hook     | `packages/api/src/modules/*`                     |
| Translation  | `packages/i18n/src/locales/en.ts`, `ar.ts`       |
| API endpoint | `apps/apis/routes/api.py` + controller + service |
| Migration    | `apps/apis/database/migrations/versions/`        |

## Cursor / agent setup

- Read `AGENTS.md` first.
- Gluestack skill: `pnpm skills:install`
- Rules in `.cursor/rules/` (UI, backend, security, etc.)

## Git hooks

| Hook           | Action                                                          |
| -------------- | --------------------------------------------------------------- |
| **pre-commit** | Prettier (TS/JSON/CSS/MD) + Black/Ruff (Python) on staged files |
| **pre-push**   | `pnpm validate` - format check, lint, typecheck, tests          |

Never use `--no-verify` unless you intend to skip checks.
