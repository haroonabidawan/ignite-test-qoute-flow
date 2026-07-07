# Cursor rules

Project-specific AI rules for QuoteFlow. See `AGENTS.md` for the full guide.

| Rule                     | Scope                                         |
| ------------------------ | --------------------------------------------- |
| `project-core.mdc`       | Always on - monorepo basics                   |
| `ai-behaviour.mdc`       | Always on - code-gen do's/don'ts              |
| `security.mdc`           | Always on - secrets, AI keys, input           |
| `code-quality.mdc`       | Always on - file size, no legacy, clean diffs |
| `technical-test.mdc`     | Assessment requirements                       |
| `turbo-monorepo.mdc`     | pnpm / Turbo / package.json                   |
| `typescript.mdc`         | `*.ts`, `*.tsx`                               |
| `packages-ui.mdc`        | `packages/ui/**`                              |
| `nextjs-web.mdc`         | `apps/web/**`                                 |
| `gluestack-ui.mdc`       | UI + Gluestack v4                             |
| `web-platform-forks.mdc` | `index.web.tsx`                               |
| `styling-ssr.mdc`        | Theme / FOUC                                  |
| `git-workflow.mdc`       | Commits / branches                            |
| `backend-python.mdc`     | `backend/**`                                  |

Skills live in `.agents/skills/` - run `pnpm skills:install` after clone.
