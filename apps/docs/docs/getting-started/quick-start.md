# Quick start

## Prerequisites

- **Node.js** ≥ 20, **pnpm** ≥ 9
- **Docker** + Docker Compose (recommended full stack)
- **Python** 3.12 + [uv](https://github.com/astral-sh/uv) (optional, for local API without Docker)

## Option A - Docker (recommended)

```bash
git clone <repo-url> ignite-test && cd ignite-test
cp .env.example .env    # optional
make setup
make up-build
```

| Service      | URL                                     |
| ------------ | --------------------------------------- |
| Web          | http://localhost:3010                   |
| API docs     | http://localhost:8000/docs              |
| Project docs | `pnpm dev:docs` → http://localhost:3100 |
| Mailpit      | http://localhost:8025                   |

Login: `admin@example.com` / `password123` (run `make seed` if login fails).

## Option B - pnpm only (web + local API)

```bash
pnpm install
pnpm dev:backend    # terminal 1 - API on :8000
pnpm dev:web        # terminal 2 - web on :3000
pnpm dev:docs       # terminal 3 - docs on :3100
```

Ensure PostgreSQL is reachable via `DATABASE_URL` in `apps/apis/.env`, or use Docker for `db` only.

## First workflow

1. Log in at the web app.
2. **Clients** → create a client.
3. **Quotations** → **New** → AI or manual mode.
4. Add line items, save, open **Preview & PDF**.
5. **Approve & notify** → check Mailpit for the email.

## Common commands

```bash
make help           # all Make targets
pnpm validate       # format + lint + typecheck + tests (pre-push)
pnpm test:backend   # pytest
pnpm test:ui        # vitest
```
