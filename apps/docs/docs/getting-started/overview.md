# Overview

QuoteFlow helps sales and ops teams build client quotations quickly:

1. **Clients** - contact records (name, company, email, phone, notes).
2. **Quotations** - titled quotes with line items (quantity, unit price, estimated hours).
3. **AI assist** - paste a client brief; the API suggests line items (editable before save).
4. **PDF export** - preview and download a print-ready quotation document.
5. **Approve & notify** - approving a quote triggers an n8n workflow → Mailpit email (dev) or SMTP (prod).

The project is a **pnpm monorepo**: UI and business logic live in `packages/`, `apps/web` only wires routes, and `apps/apis` is the single source of truth for data and AI.

## Design principles

| Principle         | Implementation                                               |
| ----------------- | ------------------------------------------------------------ |
| Thin routes       | `apps/web/app/**/page.tsx` imports screens from `@repo/ui`   |
| Typed API         | `@repo/types` mirrors backend DTOs                           |
| Uniform API shape | Every endpoint returns `{ success, message, data }`          |
| Semantic styling  | Tailwind tokens: `text-foreground`, `bg-primary`, etc.       |
| AI safety         | Rate limits, usage logging, offline fallback without API key |
| Bilingual UI      | EN/AR via `@repo/i18n`; locale in `localStorage`, not URL    |

## Assessment context

Built for the Ignite technical test. Requirements live in `Technical-Test.md`; gap analysis in `AUDIT.md`.

**Production testers:** [Production reviewer guide](reviewer-guide.md) - live URLs, login, and what to verify at each service.

**Why these choices?** See [Design decisions & rationale](../architecture/design-decisions.md) - monorepo layout, Gluestack UI, FastAPI, n8n, i18n, and trade-offs we accept.
