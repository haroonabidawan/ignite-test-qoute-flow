# Formatting & git hooks

## Tools

| Stack             | Formatter           | Linter           |
| ----------------- | ------------------- | ---------------- |
| TS/JS/JSON/CSS/MD | Prettier            | ESLint (web, ui) |
| Python            | Black + Ruff format | Ruff check       |

Line width: **88** (matches Black and Prettier config).

## Commands

```bash
pnpm format          # format entire repo
pnpm format:check    # CI / pre-push check only
pnpm format:backend  # Black + Ruff on apps/apis
```

## Git hooks (Husky)

| Hook         | Script                                   |
| ------------ | ---------------------------------------- |
| `pre-commit` | `lint-staged` - format staged files only |
| `pre-push`   | `pnpm validate` - full health check      |

Install hooks: `pnpm install` (runs `prepare` → `husky`).

### lint-staged

- `*.{ts,tsx,js,jsx,mjs,cjs,json,css,md,yml,yaml}` → Prettier
- `apps/apis/**/*.py` → Black + Ruff fix + Ruff format

## Bypassing hooks

Avoid `--no-verify` unless intentional - pre-push catches type and test failures before remote CI.
