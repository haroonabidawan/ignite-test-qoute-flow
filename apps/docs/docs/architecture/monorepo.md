# Monorepo map

```
ignite-test/
├── apps/
│   ├── web/                 @repo/web - Next.js 16 App Router
│   ├── apis/                FastAPI + Alembic + pytest
│   └── docs/                Docsify documentation (this site)
├── packages/
│   ├── ui/                  @repo/ui - screens, Gluestack, PDF
│   ├── api/                 @repo/api - HTTP + TanStack Query
│   ├── i18n/                @repo/i18n - EN/AR
│   └── types/               @repo/types - shared TS types
├── n8n/                     Workflow JSON + entrypoint import
├── compose.yaml             Dev stack
├── compose.prod.yaml        Production stack
├── turbo.json               Task pipeline
└── pnpm-workspace.yaml
```

## Package manager

**pnpm only** - workspace deps use `"@repo/ui": "workspace:*"`. Do not use npm or yarn.

## Turbo tasks

| Task        | Packages                                     |
| ----------- | -------------------------------------------- |
| `dev`       | web, docs (persistent)                       |
| `build`     | web                                          |
| `lint`      | web, ui                                      |
| `typecheck` | web, ui, api, i18n, types                    |
| `test`      | ui (vitest); backend via `pnpm test:backend` |

## Dependency graph (simplified)

```
apps/web
  └── @repo/ui, @repo/api, @repo/i18n, @repo/types

packages/ui
  └── @repo/api, @repo/i18n, @repo/types

packages/api
  └── @repo/types

packages/i18n
  └── @repo/api (ApiError for translateError), @repo/types
```

## Non-negotiables

1. UI in `@repo/ui`, not `apps/web/components`.
2. Semantic color tokens only (`text-foreground`, not `gray-500`).
3. Web forks: `index.web.tsx` for DOM primitives.
4. `Box` defaults to `flex-col` - add `flex-row` explicitly.
5. Next.js uses **webpack** (`--webpack` flag), not Turbopack.
