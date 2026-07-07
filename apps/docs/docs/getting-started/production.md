# Production

Production uses **`compose.prod.yaml`**: baked images, no bind mounts, full stack (Postgres, API, web, n8n, Mailpit).

## Local production test

```bash
cp .env.prod.example .env   # set secrets
make prod-up-build
make prod-seed              # first run only
```

| Service    | Default host port | Container port |
| ---------- | ----------------- | -------------- |
| web        | 13000             | 3000           |
| docs       | 13100             | 80             |
| api        | 18000             | 8000           |
| n8n        | 15678             | 5678           |
| mailpit UI | 18025             | 8025           |

Postgres has **no host port** - internal Docker network only.

## Build args

The **web** image bakes `NEXT_PUBLIC_API_URL` at build time. Rebuild web after changing the public API URL.

## Secrets (required)

| Variable             | Purpose                   |
| -------------------- | ------------------------- |
| `POSTGRES_PASSWORD`  | Database                  |
| `SECRET_KEY`         | JWT signing (≥ 32 chars)  |
| `N8N_ENCRYPTION_KEY` | n8n credential encryption |

## Dokploy

See [Dokploy deployment](deployment/dokploy.md).

**Ignite reviewers:** [Production reviewer guide](getting-started/reviewer-guide.md) - what to test at each live URL.

## Health checks

- API: `GET /health` (used by Compose healthcheck)
- Migrations run automatically on API startup
