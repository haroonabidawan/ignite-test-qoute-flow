# Environment variables

## Web (`apps/web`)

| Variable              | Required   | Description         |
| --------------------- | ---------- | ------------------- |
| `NEXT_PUBLIC_API_URL` | Yes (prod) | Public API base URL |

## API (`apps/apis`)

Loaded from `.env` via pydantic-settings.

### Application

| Variable      | Example       | Description                                  |
| ------------- | ------------- | -------------------------------------------- |
| `APP_NAME`    | QuoteFlow API | OpenAPI title                                |
| `APP_VERSION` | 1.0.0         | Version string                               |
| `ENVIRONMENT` | development   | development \| staging \| production \| test |
| `DEBUG`       | true          | SQL echo, verbose errors                     |

### Database

| Variable       | Example                                          |
| -------------- | ------------------------------------------------ |
| `DATABASE_URL` | postgresql+asyncpg://user:pass@db:5432/quoteflow |

### Auth

| Variable                      | Description              |
| ----------------------------- | ------------------------ |
| `SECRET_KEY`                  | JWT signing (≥ 32 chars) |
| `JWT_ALGORITHM`               | Default HS256            |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL                |

### CORS

| Variable          | Example                                             |
| ----------------- | --------------------------------------------------- |
| `ALLOWED_ORIGINS` | http://localhost:3010,https://quoteflow.example.com |

Comma-separated list of allowed browser origins.

### Business

| Variable        | Default |
| --------------- | ------- |
| `CURRENCY_CODE` | USD     |

### AI provider

| Variable                | Default                        |
| ----------------------- | ------------------------------ |
| `AI_API_KEY`            | _(empty = offline)_            |
| `AI_BASE_URL`           | https://api.groq.com/openai/v1 |
| `AI_MODEL`              | llama-3.1-8b-instant           |
| `AI_TIMEOUT_SECONDS`    | 30                             |
| `AI_MAX_REQUEST_CHARS`  | 4000                           |
| `AI_COOLDOWN_SECONDS`   | 15                             |
| `AI_USER_HOURLY_LIMIT`  | 10                             |
| `AI_USER_DAILY_LIMIT`   | 30                             |
| `AI_GLOBAL_DAILY_LIMIT` | 0                              |

### n8n

| Variable              | Example                                    |
| --------------------- | ------------------------------------------ |
| `N8N_WEBHOOK_URL`     | http://n8n:5678/webhook/quotation-approved |
| `N8N_TIMEOUT_SECONDS` | 10                                         |

## Docker Compose host ports

| Variable                       | Dev default | Prod default |
| ------------------------------ | ----------- | ------------ |
| `WEB_PORT` / `WEB_HOST_PORT`   | 3010        | 13000        |
| `API_PORT` / `API_HOST_PORT`   | 8000        | 18000        |
| `N8N_PORT` / `N8N_HOST_PORT`   | 5678        | 15678        |
| `DOCS_HOST_PORT` / `DOCS_PORT` | 3100        | 13100        |

For Dokploy, paste the same variables into the compose project environment panel in the Dokploy UI.
