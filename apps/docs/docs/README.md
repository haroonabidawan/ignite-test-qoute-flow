# QuoteFlow Documentation

**QuoteFlow** is an AI-assisted quotation builder: manage clients, compose quotations with manual or AI-generated line items, preview/export PDFs, and approve quotes with n8n email notifications.

## Stack at a glance

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| Web          | Next.js 16, React 19, NativeWind / Gluestack UI             |
| API          | FastAPI, SQLAlchemy async, PostgreSQL                       |
| Client state | TanStack Query via `@repo/api`                              |
| i18n         | English + Arabic (`@repo/i18n`, no locale in URL)           |
| Automation   | n8n webhook on quotation approve                            |
| AI           | OpenAI-compatible endpoint (Groq default), offline fallback |

## Demo credentials

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@example.com` |
| Password | `password123`       |

Seed with `make seed` or `python -m database.seed` in the API container.

## Production URLs (Ignite review)

| Service            | URL                                           |
| ------------------ | --------------------------------------------- |
| **Web app**        | https://quoteflow.haroonabidawan.com          |
| API / Swagger      | https://api.quoteflow.haroonabidawan.com/docs |
| **This docs site** | https://docs.quoteflow.haroonabidawan.com     |
| Approval emails    | https://mail.quoteflow.haroonabidawan.com     |
| n8n                | https://n8n.quoteflow.haroonabidawan.com      |

→ **[Production reviewer guide](getting-started/reviewer-guide.md)** - step-by-step: what to click, what to expect at each URL.

## Local URLs

| Service          | Dev (Docker)               | Dev (pnpm)            |
| ---------------- | -------------------------- | --------------------- |
| Web              | http://localhost:3010      | http://localhost:3000 |
| API              | http://localhost:8000      | http://localhost:8000 |
| API Swagger      | http://localhost:8000/docs | same                  |
| Docs (this site) | http://localhost:3100      | http://localhost:3100 |
| Mailpit          | http://localhost:8025      | -                     |
| n8n              | http://localhost:5678      | -                     |

## Where to go next

- **Ignite reviewer?** → [Production reviewer guide](getting-started/reviewer-guide.md)
- **New developer?** → [Quick start](getting-started/quick-start.md)
- **API integration?** → [API overview](api/overview.md) or [OpenAPI / Swagger](api/openapi.md)
- **Deploying?** → [Docker](deployment/docker.md) or [Dokploy](deployment/dokploy.md)

## Repository layout

```
ignite-test/
├── apps/
│   ├── web/          # Next.js routes (thin wrappers)
│   ├── apis/         # FastAPI backend
│   └── docs/         # This Docsify site
├── packages/
│   ├── ui/           # Screens, layout, Gluestack components
│   ├── api/          # HTTP client + TanStack Query hooks
│   ├── i18n/         # EN/AR translations
│   └── types/        # Shared TypeScript types
├── compose.yaml      # Dev Docker stack
├── compose.prod.yaml # Production stack
└── n8n/              # Workflow import on container start
```
