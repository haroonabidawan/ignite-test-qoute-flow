# AI development notes

This project was built with assistance from **Cursor** (Claude-based agent) during the technical test.

## Tools used

- **Cursor Agent** - implementation, refactors, audits, test authoring
- **Gluestack UI v4 skills** - component patterns (`.agents/skills/gluestack-ui-v4`)
- **Local quoteflow skill** - monorepo conventions (`.agents/skills/quoteflow`)

## What the agent helped with

- FastAPI backend structure (controllers, services, repositories, migrations)
- TanStack Query hooks and API client in `@repo/api`
- Screen implementations in `@repo/ui` (login, clients, quotations, AI draft, preview/PDF)
- n8n workflow JSON and Docker import scripts
- EN/AR i18n package and RTL layout
- Pytest and Vitest suites for totals and AI validation
- Documentation (`APPROACH.md`, `AUDIT.md`, README, Docsify site)

## What was reviewed manually

- Technical-Test.md requirements mapping (`AUDIT.md`)
- Approve → n8n → Mailpit end-to-end flow
- AI prompt rules (null prices, JSON-only output) in `apps/apis/prompts/quotation-draft.md`
- Security: API keys server-side only; rate limits on AI draft endpoint

## Human decisions retained

- PostgreSQL over SQLite for production parity
- JSON column → normalized `quotation_items` migration
- Approve-only path for `Approved` status (webhook integrity)
- Semantic design tokens (no raw Tailwind grays) per project rules
