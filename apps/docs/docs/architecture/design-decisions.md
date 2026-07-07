# Design decisions & rationale

This page explains **why** QuoteFlow is structured the way it is. It is written for reviewers who want to understand trade-offs, not just the file layout.

## Summary

| Area          | Choice                                | One-line reason                                                |
| ------------- | ------------------------------------- | -------------------------------------------------------------- |
| Repo layout   | pnpm monorepo + Turbo                 | One install; shared types, UI, and API client stay in sync     |
| Web shell     | Next.js 16 (thin routes)              | Routing, SSR, and deployment without coupling screens to Next  |
| UI            | Gluestack UI v4 + NativeWind          | Token-based design system with a path to web **and** native    |
| Data fetching | TanStack Query in `@repo/api`         | Server state, cache, and mutations separated from presentation |
| Backend       | FastAPI + async SQLAlchemy + Postgres | Typed API, migrations, and testable service layers             |
| AI            | Backend-only OpenAI-compatible API    | Keys never in the browser; JSON validated before use           |
| Integration   | n8n webhook on approve                | Small, optional automation; approval is never blocked          |
| i18n          | `@repo/i18n` (EN/AR + RTL)            | Bonus requirement; locale-aware errors and AI drafts           |
| Docs          | Docsify in `apps/docs`                | Lightweight project docs without another build pipeline        |
| Deploy        | Docker Compose (dev + prod)           | Same stack locally and on Dokploy                              |

---

## Why a monorepo?

The technical test spans **web UI**, **shared types**, **HTTP client**, **i18n**, and **Python API**. A monorepo keeps those boundaries explicit while avoiding version drift.

**What we gain**

- `@repo/types` is the contract between FastAPI DTOs and the frontend.
- `@repo/ui` screens can be developed and unit-tested without running Next.js.
- `@repo/api` hooks are reused if we add a mobile app or admin tool later.
- Turbo runs `lint`, `typecheck`, and `build` only where files changed.

**What we accept**

- More folders than a single Next.js app.
- Discipline: UI must not live in `apps/web/components` (see [Monorepo map](monorepo.md)).

**Alternatives considered**

| Alternative                        | Why we did not default to it                                        |
| ---------------------------------- | ------------------------------------------------------------------- |
| Single Next.js app with API routes | Python/FastAPI was required; mixing stacks in one app adds friction |
| Separate repos                     | Harder to keep types and API client aligned during a 5-day test     |
| npm/yarn                           | pnpm workspaces are faster and match Turbo conventions              |

---

## Why thin Next.js routes?

`apps/web` only wires **routing**, **providers**, and **env config**. Every screen lives in `@repo/ui`.

**What we gain**

- Routes stay ~5 lines: import screen, export page.
- Screens are framework-agnostic aside from navigation hooks (`useNavigate`, `usePathname`) injected via providers.
- Easier to reason about the assessment: “where is the quotation form?” → always `packages/ui`.

**What we accept**

- A thin indirection layer (`apps/web/lib/providers.tsx`) to connect Next router to UI navigation.

---

## Why Gluestack UI?

Gluestack UI v4 is the component layer in `@repo/ui`. We did not pick it for novelty - we picked it because it matches how we want to **theme**, **ship forms**, and **keep a future native path open**.

### Requirements we optimized for

1. **Consistent design tokens** - semantic colors (`primary`, `destructive`, `muted`) for light/dark and RTL.
2. **Form-heavy product** - login, client CRUD, quotation line items, AI draft review.
3. **Tailwind on web** - NativeWind aligns with existing Tailwind mental model.
4. **Possible React Native later** - same component primitives with `index.tsx` (RN) and `index.web.tsx` (DOM).
5. **Fast scaffolding** - `pnpm ui:add <component>` drops primitives into `packages/ui`.

### What Gluestack gives us

| Capability        | How we use it                                                                          |
| ----------------- | -------------------------------------------------------------------------------------- |
| Themed primitives | Button, Input, Textarea, Card, etc. in `src/components/ui/`                            |
| Token config      | `gluestack-ui-provider/config.ts` + mirrored CSS vars in `globals.css` for SSR         |
| Web forks         | `index.web.tsx` renders real `<button>`, `<input>`, `<textarea>` - no RN bridge on web |
| Agent skill       | `gluestack-ui-v4` skill documents v4 patterns for consistent additions                 |

### Trade-offs we acknowledge (and how we handle them)

| Trade-off                                   | Mitigation                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Gluestack targets RN first; web needs forks | Every interactive primitive used on web has `index.web.tsx`; RN-only props stripped before spreading to DOM |
| `Box` defaults to `flex-col`                | Documented rule; explicit `flex-row` in toolbars and shells                                                 |
| Typecheck noise from RN-only components     | UI tsconfig scopes web builds; known gap tracked in `AUDIT.md`                                              |
| Next.js Turbopack + NativeWind conflict     | Dev and prod use **webpack** (`--webpack` flag) - stable, documented                                        |
| SSR flash without CSS vars                  | Duplicate theme tokens in `globals.css` `:root` / `.dark` alongside Gluestack config                        |

### Alternatives considered

| Library                         | Why Gluestack fit better for this repo                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| **shadcn/ui**                   | Excellent for web-only; no first-class RN story; copy-paste components vs shared package exports |
| **MUI / Chakra**                | Heavier runtime; different styling model from Tailwind/NativeWind used elsewhere                 |
| **Headless UI + Tailwind only** | Faster for a single web app; more manual work for forms, tokens, and future native               |
| **Plain HTML + CSS**            | Too slow for a form-heavy CRUD app in the test window                                            |

**Bottom line:** Gluestack costs extra setup (web forks, theme sync) in exchange for a **unified design system** that works on web today and does not block a native client tomorrow.

---

## Why `@repo/api` + TanStack Query?

Screens should not call `fetch` directly. `@repo/api` owns HTTP, mappers (snake_case ↔ camelCase), and query keys.

**What we gain**

- Auth token and base URL configured once.
- List screens get caching, refetch, and loading/error states for free.
- Mutations invalidate the right queries after create/update/delete/approve.
- API envelope `{ success, message, data }` parsed in one place.

**What we accept**

- Learning curve vs a simple `useEffect` + `fetch` demo.

---

## Why FastAPI + PostgreSQL?

The brief asks for a real backend, AI calls, and persistence. FastAPI fits a short timeline with strong typing and auto-generated OpenAPI.

**What we gain**

- **Pydantic** validates request/response bodies and AI JSON before it touches the DB.
- **Alembic** migrations version the schema; same flow in Docker and Dokploy.
- **async SQLAlchemy** keeps I/O efficient under concurrent requests.
- **OpenAPI** at `/docs` doubles as API reference (also embedded in this docs site).

**Layering**

```
routes → controllers → services → repositories → models
```

Controllers stay thin; business rules (approve-only webhook, AI rate limits) live in services.

**What we accept**

- Python + TypeScript means two runtimes (mitigated by Docker Compose and clear package boundaries).

---

## Why backend-only AI?

AI draft generation runs in `apps/apis`, not the browser.

**What we gain**

- API keys never ship to the client.
- Rate limits (`AI_USER_HOURLY_LIMIT`, cooldowns) enforced server-side.
- Usage logged to `ai_logs` for monitoring.
- Invalid model output rejected by Pydantic before suggesting items to the user.
- Offline fallback when no key is configured (demo still works).

---

## Why n8n only on approve?

The test marks n8n as **small and optional**. We scoped integration to a single event: quotation **Approved**.

**What we gain**

- Clear story for reviewers: create quote → approve → webhook → email.
- Approval succeeds even if n8n is down (`webhook_delivered` flag in response).
- Workflow JSON committed under `n8n/`; dev Compose imports it on first boot.

**What we accept**

- No general-purpose automation platform inside the app - by design.

---

## Why EN/AR i18n in a separate package?

Bonus requirement: Arabic UI with RTL.

**What we gain**

- Catalogs in `@repo/i18n`; UI strings not scattered across screens.
- `translateError()` maps API error codes to locale keys.
- `UiMessageState` + `useResolvedMessage()` re-translate errors when the user switches language mid-flow.
- Locale sent to AI draft endpoint so suggestions match the active language.

---

## Why Docsify for this site?

Project documentation is not the product, but reviewers need architecture and API context.

**What we gain**

- Markdown-only - no second React build.
- Served locally (`pnpm dev:docs`) and in Docker (`docs` service on `:3100` / `:13100`).
- Sidebar and search without maintaining a CMS.

---

## Why Docker for dev and prod?

**What we gain**

- New contributors: `make up-build` gets Postgres, API, web, n8n, Mailpit, and docs.
- Prod parity via `compose.prod.yaml` and Dokploy env template.
- Host ports default high (`13000`, `18000`, …) to avoid clashes with other projects on the same server.

---

## Security & production posture (honest scope)

This is a **technical test**, not a hardened production release. We still made deliberate choices:

| Topic   | Test implementation              | Production follow-up                                  |
| ------- | -------------------------------- | ----------------------------------------------------- |
| Auth    | JWT in `sessionStorage`          | `httpOnly` cookies, refresh tokens, login rate limits |
| Secrets | `.env` / Dokploy env             | Vault rotation, never commit keys                     |
| AI cost | Per-user limits + logging        | Dashboards, budgets, model routing                    |
| Webhook | Fire-and-forget with status flag | Retries, dead-letter queue                            |

See also `APPROACH.md` at the repo root for a short reviewer summary and production improvement table.

---

## How to read this alongside other docs

| Doc                             | Focus                                       |
| ------------------------------- | ------------------------------------------- |
| [Monorepo map](monorepo.md)     | **Where** code lives                        |
| [Data flow](data-flow.md)       | **How** requests move through the system    |
| [Packages](packages.md)         | **What** each package exports               |
| [UI package](../frontend/ui.md) | Gluestack usage rules in practice           |
| `APPROACH.md` (repo root)       | Short summary for reviewers + demo commands |

If a decision is not listed here, check `AUDIT.md` for known gaps and `Technical-Test.md` for requirements we were solving against.
