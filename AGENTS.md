# QuoteFlow - Agent Guide

Monorepo for the **AI-assisted quotation builder** technical test. Read this first, then apply scoped rules from `.cursor/rules/` and skills from `.agents/skills/`.

## Quick start

```bash
pnpm install
pnpm dev:web          # http://localhost:3000
pnpm dev:docs         # http://localhost:3100 - project docs (Docsify)
pnpm build            # verify production build
pnpm lint && pnpm typecheck
pnpm test              # vitest (@repo/ui) + pytest when wired per package
pnpm test:backend      # pytest (apps/apis)
pnpm test:ui           # vitest (@repo/ui)
pnpm format            # Prettier + Black/Ruff
pnpm validate          # format check, lint, typecheck, tests (pre-push)
make prod-up-build     # production Docker stack (compose.prod.yaml)
```

**Demo login:** `admin@example.com` / `password123`

**AI usage limits** (backend env): `AI_COOLDOWN_SECONDS`, `AI_USER_HOURLY_LIMIT`, `AI_USER_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT`, `AI_MAX_REQUEST_CHARS`. Usage shown on quotation create screen; `GET /ai/usage` for monitoring.

## Monorepo map

| Path                | Package       | Purpose                                                    |
| ------------------- | ------------- | ---------------------------------------------------------- |
| `apps/web`          | `web`         | Next.js 16 - **thin route wrappers only**                  |
| `apps/docs`         | `docs`        | Docsify documentation (Docker :3100 / :13100)              |
| `apps/apis`         | _(python)_    | FastAPI - auth, clients, quotations, AI draft, n8n webhook |
| `packages/ui`       | `@repo/ui`    | Screens, layout, forms, Gluestack components               |
| `packages/i18n`     | `@repo/i18n`  | EN/AR catalogs, provider, hooks (no locale in routes)      |
| `packages/types`    | `@repo/types` | Shared domain + API types                                  |
| `packages/api`      | `@repo/api`   | `lib/` infra + `modules/` domains + TanStack Query         |
| `Technical-Test.md` | -             | Assessment requirements (source of truth)                  |
| `AUDIT.md`          | -             | Gap analysis vs Technical-Test + enterprise audit          |

**Package manager:** pnpm only (`workspace:*` for internal deps). **Never** use npm or yarn.

## Where code goes

| Task                              | Location                                                                    |
| --------------------------------- | --------------------------------------------------------------------------- |
| New screen / page UI              | `packages/ui/src/screens/*-screen.tsx`                                      |
| Shared layout / shell             | `packages/ui/src/components/layout/`                                        |
| Gluestack primitives              | `packages/ui/src/components/ui/`                                            |
| Data hooks (TanStack Query)       | `@repo/api/hooks` - `modules/auth`, `modules/clients`, `modules/quotations` |
| i18n (EN/AR, cookie/localStorage) | `@repo/i18n` - `useTranslation()`, `LanguageSwitcher`                       |
| Query provider                    | `packages/api/src/lib/query/provider.tsx`                                   |
| Web env config                    | `apps/web/lib/api-config.ts`                                                |
| Next.js route                     | `apps/web/app/**/page.tsx` - import screen, no business logic               |
| Theme / tokens                    | `packages/ui/src/styles/globals.css` + `gluestack-ui-provider/config.ts`    |
| Types / models                    | `packages/types/src/`                                                       |

## Cursor setup

### Rules (`.cursor/rules/`)

| Rule                     | When                                             |
| ------------------------ | ------------------------------------------------ |
| `project-core.mdc`       | Always - monorepo conventions                    |
| `ai-behaviour.mdc`       | Always - how the agent generates code            |
| `security.mdc`           | Always - secrets, AI keys, input validation      |
| `code-quality.mdc`       | Always - file size, no legacy shims, clean diffs |
| `technical-test.mdc`     | Feature work - assessment scope                  |
| `turbo-monorepo.mdc`     | `package.json`, turbo/pnpm config                |
| `typescript.mdc`         | `.ts` / `.tsx` files                             |
| `packages-ui.mdc`        | `packages/ui/**`                                 |
| `nextjs-web.mdc`         | `apps/web/**`                                    |
| `gluestack-ui.mdc`       | UI / styling work                                |
| `web-platform-forks.mdc` | `index.web.tsx` files                            |
| `styling-ssr.mdc`        | Theme CSS, loading/FOUC fixes                    |
| `git-workflow.mdc`       | Commits / branches                               |
| `backend-python.mdc`     | `apps/apis/**`                                   |

### Skills (`.agents/skills/`)

| Skill             | Install               | Use for                             |
| ----------------- | --------------------- | ----------------------------------- |
| `gluestack-ui-v4` | `pnpm skills:install` | Components, theming, Gluestack v4   |
| `quoteflow`       | _(local, committed)_  | This repo’s architecture & pitfalls |

Reinstall Gluestack skills after clone: `pnpm skills:install`

## Non-negotiables

1. **UI lives in `@repo/ui`** - not in `apps/web/components` (except Next-specific wiring).
2. **Semantic tokens only** - `text-foreground`, `bg-primary`, `border-border`. No `gray-500`, `red-600`.
3. **Web forks** - interactive primitives use `index.web.tsx` (HTML elements). Strip RN-only props before spreading to DOM.
4. **`Box` is `flex-col`** - add `flex-row` explicitly for horizontal layouts.
5. **Next.js uses webpack** - `next dev --webpack` / `next build --webpack` (NativeWind + `next/font` conflict with Turbopack).
6. **Theme CSS vars in `globals.css`** - keep `:root` / `.dark` in sync with `config.ts` for SSR (no FOUC).
7. **TypeScript** - avoid `any` and `unknown` unless truly unavoidable.
8. **Minimal diffs** - match existing patterns; don’t refactor unrelated code.
9. **No commits/PRs** unless the user explicitly asks.

## Common commands

```bash
pnpm ui:add button          # Add Gluestack component to packages/ui
pnpm dev:web                # Start web app
pnpm dev:docs               # Start Docsify docs (:3100)
pnpm dev:backend            # Start FastAPI (apps/apis)
pnpm skills:install         # Install .agents Gluestack skills
```

## Assessment status

See `Technical-Test.md` for requirements and **`AUDIT.md`** for the full gap analysis (**100% complete**).

**Live demo:** https://quoteflow.haroonabidawan.com

**Done:**

- FastAPI backend (`apps/apis`) + PostgreSQL - auth, clients, quotations, normalized `quotation_items`
- Web app wired to FastAPI via `@repo/api` + TanStack Query
- `POST /quotations/{id}/items`, approve idempotency, `Approved` status guards + tests
- AI draft endpoint with JSON validation, offline fallback, locale, **rate limits** + `GET /ai/usage`
- Failed `ai_logs` persisted on AI errors
- n8n webhook on approve + `n8n/quotation-approved.json` + Mailpit in Docker
- PDF preview/export, EN/AR i18n (`packages/i18n`)
- Manual create inline item editor, `QueryBoundary` loading/error UX
- Prompt file at `apps/apis/prompts/quotation-draft.md`
- Submission docs: `APPROACH.md`, `ai-notes.md`
- **CI** (`.github/workflows/ci.yml`) + **`pnpm typecheck`** + **`pnpm validate`**
- **httpOnly cookie auth**, login rate limiting, paginated list APIs
- **28 passing tests** - backend pytest + frontend vitest
- **Live production demo** at https://quoteflow.haroonabidawan.com

**Optional:** E2E tests, demo video.
