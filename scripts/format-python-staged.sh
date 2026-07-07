#!/usr/bin/env bash
# Format staged Python files (pre-commit via lint-staged).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/apps/apis"

if [ "$#" -eq 0 ]; then
  exit 0
fi

cd "$API_DIR"
uv sync --extra lint --quiet

rel_paths=()
for file in "$@"; do
  case "$file" in
    apps/apis/*)
      rel_paths+=("${file#apps/apis/}")
      ;;
    "$API_DIR"/*)
      rel_paths+=("${file#"$API_DIR"/}")
      ;;
    *)
      rel_paths+=("$file")
      ;;
  esac
done

uv run --extra lint black "${rel_paths[@]}"
uv run --extra lint ruff check --fix "${rel_paths[@]}"
uv run --extra lint ruff format "${rel_paths[@]}"
