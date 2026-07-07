# UI package (`@repo/ui`)

Shared screens, layout, and Gluestack UI components for the web app.

## Screens

| Screen           | Route                                | File                           |
| ---------------- | ------------------------------------ | ------------------------------ |
| Login            | `/auth/login`                        | `login-screen.tsx`             |
| Dashboard        | `/dashboard`                         | `dashboard-screen.tsx`         |
| Clients list     | `/clients`                           | `clients-screen.tsx`           |
| Client form      | `/clients/new`, `/clients/[id]/edit` | `client-form-screen.tsx`       |
| Quotations       | `/quotations`                        | `quotations-screen.tsx`        |
| Create quotation | `/quotations/new`                    | `quotation-create-screen.tsx`  |
| Quotation detail | `/quotations/[id]`                   | `quotation-detail-screen.tsx`  |
| PDF preview      | `/quotations/[id]/preview`           | `quotation-preview-screen.tsx` |

## Layout

- `app-shell.tsx` - workspace nav, sign out
- `auth-shell.tsx` - marketing panel + language switcher
- `page-header.tsx`, `section-card.tsx`

## Styling rules

Gluestack UI v4 is the component foundation. **Why we chose it** (vs shadcn/MUI, web forks, trade-offs): [Design decisions - Gluestack](../../architecture/design-decisions.md#why-gluestack-ui).

- **Semantic tokens:** `text-foreground`, `bg-card`, `border-border`, `text-destructive`
- **`Box` is flex-col** - use `className="flex-row"` for horizontal layouts
- **Web forks:** interactive primitives use `index.web.tsx` (real HTML elements)
- Theme CSS variables in `src/styles/globals.css` - keep in sync with Gluestack `config.ts`

## PDF export

- `quotation-document.tsx` - single A4 layout (inline styles)
- `export-quotation-pdf.ts` - html2canvas + jspdf
- Preview and PDF share the same component for WYSIWYG output

## Adding Gluestack components

```bash
pnpm ui:add button   # from repo root
```

Reinstall agent skill after clone: `pnpm skills:install`

## Error display

Use `UiMessageState` + `useResolvedMessage()` from `src/lib/errors.ts` so errors re-translate when locale changes.
