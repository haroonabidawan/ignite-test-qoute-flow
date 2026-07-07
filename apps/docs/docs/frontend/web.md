# Web app (`apps/web`)

Next.js 16 App Router - **thin route wrappers only**.

## Structure

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout, fonts, providers
│   ├── (auth)/                 # Login, forgot/reset password
│   └── (workspace)/            # Authenticated shell
│       ├── dashboard/
│       ├── clients/
│       └── quotations/
├── lib/
│   ├── providers.tsx           # I18n + API + theme
│   └── api-config.ts           # NEXT_PUBLIC_API_URL
└── next.config.ts              # webpack, transpile packages
```

## Route pattern

```tsx
// apps/web/app/(workspace)/quotations/page.tsx
import { QuotationsScreen } from "@repo/ui/screens/quotations";

export default function Page() {
  return <QuotationsScreen />;
}
```

No data fetching or mutations in route files - screens use `@repo/api/hooks`.

## Configuration

| Env                   | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (baked at build in prod) |

## Dev server

```bash
pnpm dev:web   # next dev --webpack (required for NativeWind + next/font)
```

## Docker

- Dev: `apps/web/Dockerfile` - bind mount, `pnpm dev:web`
- Prod: `apps/web/Dockerfile.prod` - multi-stage build, standalone output
