# Docker Compose

## Dev stack (`compose.yaml`)

```bash
make up-build    # build + start
make down        # stop
make logs        # docker compose logs -f (if added)
```

| Service   | Image / build          | Host port   |
| --------- | ---------------------- | ----------- |
| `db`      | postgres:16-alpine     | 5432        |
| `api`     | `apps/apis` Dockerfile | 8000        |
| `web`     | `apps/web` Dockerfile  | 3010 → 3000 |
| `docs`    | `apps/docs` Dockerfile | 3100        |
| `n8n`     | n8nio/n8n              | 5678        |
| `mailpit` | axllent/mailpit        | 8025, 1025  |

Volumes persist Postgres and n8n data.

## Prod stack (`compose.prod.yaml`)

```bash
make prod-up-build
make prod-seed
```

| Service   | Host port (default) | Container port |
| --------- | ------------------- | -------------- |
| `web`     | 13000               | 3000           |
| `docs`    | 13100               | 80             |
| `api`     | 18000               | 8000           |
| `n8n`     | 15678               | 5678           |
| `mailpit` | 18025               | 8025           |
| `db`      | _(internal only)_   | 5432           |

Override host ports with `WEB_HOST_PORT`, `API_HOST_PORT`, etc. when sharing a server with other apps.

## Make targets

```bash
make help              # list all commands
make migrate           # Alembic upgrade
make seed              # admin user
make prod-down-v       # wipe prod volumes
```

## Environment files

| File                | Use                  |
| ------------------- | -------------------- |
| `.env.example`      | Dev Docker           |
| `.env.prod.example` | Local prod / Dokploy |
