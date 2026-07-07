---
name: quoteflow
description: QuoteFlow monorepo architecture, routing, store, and known web pitfalls. Read before structural changes, new screens, or cross-package work in ignite-test.
---

# QuoteFlow project skill

## Architecture

- **`apps/web`** - Next.js App Router. Routes are thin: import a screen from `@repo/ui`, render it.
- **`packages/ui`** - All product UI, Gluestack components, navigation abstraction.
- **`packages/api`** - HTTP client, mappers, TanStack Query hooks (`@repo/api/hooks`).
- **`@repo/ui` exports** - Use package exports (`@repo/ui/screens/login`, `@repo/ui/button`), not deep relative imports from `apps/web`.

## Routing

```
app/(auth)/auth/login|forgot-password|reset-password
app/(workspace)/dashboard|clients|quotations
app/login → redirects to /auth/login
/ → /dashboard
```

- `(auth)/layout.tsx` - redirects logged-in users to dashboard
- `(workspace)/layout.tsx` - `AuthGuard` + `AppShell`

## Navigation

Screens use `useNavigate()` / `usePathname()` from `@repo/ui/navigation`, wired in `apps/web/lib/providers.tsx` with Next.js router.

## API data layer

Screens import TanStack Query hooks from `@repo/api/hooks` (`useClients`, `useLogin`, …). `ApiQueryProvider` is mounted in `apps/web/lib/providers.tsx`; env config in `apps/web/lib/api-config.ts`.

## Web platform forks (`index.web.tsx`)

Gluestack RN components conflict with Next.js on web. Pattern:

- `index.tsx` - React Native (Gluestack creator)
- `index.web.tsx` - HTML elements (`button`, `input`, `textarea`, `div`)
- `package.json` exports point web builds to `.web.tsx`

**Before spreading props to DOM elements**, destructure and drop RN-only props:

- `onPress` → map to `onClick`
- `multiline`, `numberOfLines`, `secureTextEntry`, `keyboardType`, `autoCapitalize`
- `textAlignVertical`, etc.

Example: `packages/ui/src/components/ui/textarea/index.web.tsx`, `input/index.web.tsx`.

## Layout gotchas

1. **`Box` adds `flex flex-col`** - use `flex-row` or `lg:flex-row` for horizontal layouts (`app-shell`, footers, toolbars).
2. **Auth shell** - `lg:grid lg:grid-cols-2` + `min-h-dvh`; left panel `hidden lg:flex`.
3. **Destructive buttons** - global CSS targets `bg-destructive` but not `bg-destructive/10`; use ghost + icon for subtle actions.

## Styling / SSR

- Theme tokens live in `gluestack-ui-provider/config.ts` **and** `globals.css` `:root` / `.dark` (must stay in sync).
- GluestackUIProvider injects vars client-side; without `globals.css` vars, first paint shows unstyled buttons/sidebar.
- Use semantic tokens only. Tailwind config: `packages/ui/tailwind.config.cjs`, extended by `apps/web/tailwind.config.cjs`.

## Adding UI

```bash
pnpm ui:add <component>    # from repo root
```

Config: `gluestack-ui.config.json` → components land in `packages/ui/src/components/ui/`.

After adding RN components used on web, create or extend `index.web.tsx` and update `@repo/ui` exports.

## Files to gitignore (local only)

- `apps/web/next-env.d.ts`
- `apps/web/nativewind-env.d.ts`
- `packages/ui/nativewind-env.d.ts`

## Verification checklist

After UI changes:

```bash
pnpm dev:web
pnpm build
pnpm lint
pnpm typecheck
```

Hard-refresh login page - button and sidebar should render styled immediately (no FOUC).
