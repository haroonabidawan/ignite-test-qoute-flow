# API client (`@repo/api`)

Type-safe HTTP layer and TanStack Query hooks for the FastAPI backend.

## Setup

```tsx
// apps/web/lib/providers.tsx
import { ApiQueryProvider } from "@repo/api";
import { createWebTokenStorage } from "@repo/api";
import { createApiClient } from "@repo/api";

const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  tokenStorage: createWebTokenStorage(),
});

<ApiQueryProvider client={api}>{children}</ApiQueryProvider>;
```

## Request flow

1. `createRequestClient()` adds `Authorization: Bearer` when token exists.
2. Parses `{ success, message, data }` envelope.
3. On failure throws `ApiError` with `status`, `message`, optional `code`.

## Hooks (from `@repo/api/hooks`)

| Module     | Hooks                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| auth       | `useLogin`, `useLogout`, `useSession`                                                                                       |
| clients    | `useClients`, `useClient`, `useCreateClient`, `useUpdateClient`, `useDeleteClient`                                          |
| quotations | `useQuotations`, `useQuotation`, `useCreateQuotation`, `useUpdateQuotation`, `useApproveQuotation`, `useGenerateAiDraft`, … |
| ai         | `useAiUsage`                                                                                                                |
| config     | `useAppConfig`                                                                                                              |

## Mappers

`lib/mappers/` converts snake_case API responses to camelCase domain types and back for payloads.

## Query keys

Centralized in `lib/query/keys.ts` - use for cache invalidation in mutations.
