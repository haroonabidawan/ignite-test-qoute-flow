# Packages

## `@repo/types`

Shared TypeScript domain and API types.

| Export                                 | Purpose                     |
| -------------------------------------- | --------------------------- |
| `Client`, `Quotation`, `QuotationItem` | Frontend domain (camelCase) |
| `ApiQuotationRead`, `ApiClientRead`    | Raw API shapes (snake_case) |
| `ApiEnvelope`, `ApiErrorBody`          | Response wrapper types      |
| `AiDraftResponse`                      | AI draft payload            |

## `@repo/api`

HTTP client + TanStack Query modules.

```
packages/api/src/
├── lib/
│   ├── http/request.ts      # fetch wrapper, ApiError
│   ├── client/create-client.ts
│   ├── mappers/             # API ↔ domain mapping
│   └── query/               # keys, provider, client
└── modules/
    ├── auth/                # login, session, token storage
    ├── clients/             # CRUD queries + mutations
    ├── quotations/          # CRUD, AI draft, approve
    ├── ai/                  # GET /ai/usage
    └── config/              # GET /config
```

**Usage:** wrap app in `ApiQueryProvider`, call hooks from `@repo/api/hooks`.

## `@repo/ui`

All user-facing UI.

| Area          | Path                        |
| ------------- | --------------------------- |
| Screens       | `src/screens/*-screen.tsx`  |
| Layout        | `src/components/layout/`    |
| Forms         | `src/components/forms/`     |
| Quotation PDF | `src/components/quotation/` |
| Gluestack     | `src/components/ui/`        |
| Calculations  | `src/lib/calculations.ts`   |

Exports are defined in `package.json` `"exports"` map.

## `@repo/i18n`

- Catalogs: `src/locales/en.ts`, `ar.ts`
- `I18nProvider` + `useTranslation()`
- Locale stored in `localStorage` (`quoteflow_locale`)
- RTL via `dir` on `<html>`
- `translateError()` maps API `code` → `errors.{code}` keys

## `apps/web`

Thin Next.js App Router:

- `app/(auth)/` - login, forgot/reset password
- `app/(workspace)/` - dashboard, clients, quotations
- `lib/providers.tsx` - `I18nProvider`, `ApiQueryProvider`, theme

No business logic in route files.

## `apps/apis`

FastAPI layered architecture:

| Layer        | Path                    |
| ------------ | ----------------------- |
| Routes       | `routes/api.py`         |
| Controllers  | `app/http/controllers/` |
| DTOs         | `app/http/dtos/`        |
| Services     | `app/services/`         |
| Repositories | `app/repositories/`     |
| Models       | `app/models/`           |
| Migrations   | `database/migrations/`  |
