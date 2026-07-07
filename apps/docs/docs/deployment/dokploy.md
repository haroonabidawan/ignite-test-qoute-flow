# Dokploy deployment

Deploy the production stack on [Dokploy](https://dokploy.com) using Docker Compose.

## Steps

1. **New project** → Docker Compose → connect Git repo
2. **Compose file:** `compose.prod.yaml`
3. **Environment:** set variables in Dokploy (see [Environment variables](../guides/environment.md); copy from `.env.prod.example` for local prod)
4. **Deploy** - first build takes several minutes
5. **Domains** - map hostnames to **container** ports:

| Service   | Container port | Example domain                      |
| --------- | -------------- | ----------------------------------- |
| `web`     | 3000           | `quoteflow.haroonabidawan.com`      |
| `api`     | 8000           | `api.quoteflow.haroonabidawan.com`  |
| `docs`    | 80             | `docs.quoteflow.haroonabidawan.com` |
| `n8n`     | 5678           | `n8n.quoteflow.haroonabidawan.com`  |
| `mailpit` | 8025           | `mail.quoteflow.haroonabidawan.com` |

6. **Rebuild web** after setting `NEXT_PUBLIC_API_URL`
7. **Seed (if needed):** `python -m database.seed` in api container terminal - also runs on API startup

## For Ignite reviewers

See **[Production reviewer guide](../getting-started/reviewer-guide.md)** - live URLs, login, step-by-step test flow, and what to expect at each service.

Short link from repo root: `REVIEWER.md`.

## Required secrets

- `POSTGRES_PASSWORD`
- `SECRET_KEY` (≥ 32 characters)
- `N8N_ENCRYPTION_KEY`

## Host port conflicts

On shared servers, defaults avoid `:3000` / `:8000`:

```
WEB_HOST_PORT=13000
API_HOST_PORT=18000
DOCS_HOST_PORT=13100
```

Dokploy reverse proxy uses **container** ports - host ports only matter for direct IP access.

## DNS example (haroonabidawan.com)

| Host name        | Type | Value     |
| ---------------- | ---- | --------- |
| `quoteflow`      | A    | server IP |
| `api.quoteflow`  | A    | server IP |
| `docs.quoteflow` | A    | server IP |
| `n8n.quoteflow`  | A    | server IP |
| `mail.quoteflow` | A    | server IP |

> Use the full host label (e.g. `api.quoteflow`, not `api` alone) in Cloudflare/registrar.

## Docs service

The `docs` container serves the Docsify site (`apps/docs/Dockerfile.prod` → nginx on port **80**). No extra build step - markdown is baked into the image on deploy.

## Full guide

See also:

- `REVIEWER.md` - tester quick start
- [Environment variables](../guides/environment.md) - variable reference
