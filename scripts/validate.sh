#!/usr/bin/env bash
# Full repo health check (pre-push).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Checking formatting (Prettier)…"
pnpm format:check

echo "→ Building web (production)…"
rm -rf apps/web/.next
pnpm --filter web build

echo "→ Linting frontend (web)…"
pnpm --filter web lint

echo "→ Typechecking…"
pnpm typecheck

echo "→ Linting backend (Ruff)…"
pnpm lint:backend

echo "→ Running UI tests…"
pnpm test:ui

echo "→ Running backend tests…"
pnpm test:backend

echo "✓ All checks passed."
