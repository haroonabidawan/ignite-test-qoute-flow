# QuoteFlow - Approach & Production Notes

## What we built

QuoteFlow is an AI-assisted quotation builder: users manage clients, compose quotations with line items, generate AI drafts from client briefs, and approve quotes to trigger n8n notifications.

## Architecture choices

| Layer      | Choice                                  | Why                                                                       |
| ---------- | --------------------------------------- | ------------------------------------------------------------------------- |
| Monorepo   | pnpm + Turbo                            | Shared types, UI, and API client; one install for web + backend consumers |
| Web        | Next.js 16 (thin routes) + `@repo/ui`   | Routes stay minimal; screens are reusable and testable outside Next       |
| UI         | Gluestack UI v4 + NativeWind            | Token-based design system; web forks today, RN path later - see below     |
| API client | TanStack Query in `@repo/api`           | Cache, optimistic updates, auth-gated queries                             |
| Backend    | FastAPI + async SQLAlchemy + PostgreSQL | Typed DTOs, Alembic migrations, clear service/repository layers           |
| AI         | OpenAI-compatible API (Groq default)    | Backend-only calls; JSON validated with Pydantic before use               |
| n8n        | Webhook on approve only                 | Keeps integration small; approval never blocked by webhook failure        |
| i18n       | `@repo/i18n` (EN/AR + RTL)              | Bonus requirement; locale passed to AI for draft language                 |
| Docs       | Docsify (`apps/docs`)                   | Markdown docs in Docker without a second frontend build                   |

**Full rationale (Gluestack, alternatives, trade-offs):** [`apps/docs/docs/architecture/design-decisions.md`](apps/docs/docs/architecture/design-decisions.md) - also in the docs site under **Architecture → Design decisions** (`pnpm dev:docs`).

## Why Gluestack UI (short)

We needed a **form-heavy**, **themed** UI with Tailwind on web and a credible path to React Native. Gluestack v4 provides primitives + design tokens; we use `index.web.tsx` forks so Next.js renders real HTML elements. Costs: web fork maintenance, webpack instead of Turbopack (NativeWind), theme vars duplicated in `globals.css` for SSR. We judged that cheaper than bolting a web-only kit onto a stack that may grow beyond the browser.

## Key flows

1. **Login** - httpOnly `quoteflow_token` cookie; `credentials: include` on API calls; `POST /auth/logout` clears session.
2. **AI draft** - `POST /quotations/ai-draft` enforces per-user rate limits, validates JSON, logs to `ai_logs`.
3. **Approve** - `Approved` cannot be set via PUT; only `POST /quotations/:id/approve` fires n8n.
4. **Items** - Normalized `quotation_items` table; `POST /quotations/:id/items` for incremental adds.
5. **Lists** - `GET /clients` and `GET /quotations` support `page`, `page_size`, `search`, and `status` filters.

## What we would improve for production

| Area          | Improvement                                                               |
| ------------- | ------------------------------------------------------------------------- |
| Auth          | Refresh tokens; optional MFA                                              |
| Security      | WAF; rotate secrets via vault                                             |
| AI            | Retry with backoff; structured output schema enforcement; cost dashboards |
| Data          | Soft-delete; audit trail on quotations                                    |
| Observability | OpenTelemetry traces, structured JSON logs                                |
| Testing       | E2E (Playwright); contract tests                                          |
| Deploy        | Blue/green releases                                                       |
| PDF           | Server-side PDF (e.g. WeasyPrint) instead of client rasterization         |

**Already implemented:** httpOnly cookies, login rate limiting (`login_attempts` table), paginated list APIs, Docker prod stack with live demo.

## Demo

```bash
make setup && make up-build
# Login: admin@example.com / password123 (seeded on API startup)
```

**Production (Ignite reviewers):** see `REVIEWER.md` or https://docs.quoteflow.haroonabidawan.com/#/getting-started/reviewer-guide

| URL                                           | Purpose         |
| --------------------------------------------- | --------------- |
| https://quoteflow.haroonabidawan.com          | Main app        |
| https://api.quoteflow.haroonabidawan.com/docs | Swagger         |
| https://docs.quoteflow.haroonabidawan.com     | Documentation   |
| https://mail.quoteflow.haroonabidawan.com     | Approval emails |
| https://n8n.quoteflow.haroonabidawan.com      | Workflow UI     |

Approve flow: create quotation → **Approve & notify** → check Mailpit at http://localhost:8025 (local) or mail. subdomain (production).

Docs: http://localhost:3100 (dev Docker) or `pnpm dev:docs`.
