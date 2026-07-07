# Testing

## Backend (pytest)

Location: `apps/apis/tests/`

```bash
pnpm test:backend
# or
cd apps/apis && uv run pytest -v
```

| Suite                       | Coverage                              |
| --------------------------- | ------------------------------------- |
| `test_api_auth.py`          | Login, me, 401                        |
| `test_api_clients.py`       | Client CRUD                           |
| `test_api_quotations.py`    | Quotation CRUD, AI draft, rate limits |
| `test_ai_service.py`        | JSON parse, offline draft             |
| `test_ai_usage.py`          | Rate limit enforcement                |
| `test_helpers_quotation.py` | Totals, serialization                 |

Uses sqlite in-memory (`ENVIRONMENT=test`), migrations skipped in test.

## Frontend (vitest)

Location: `packages/ui/src/lib/__tests__/`

```bash
pnpm test:ui
```

Tests: `calculations.ts`, `buildQuotationPdfFilename`.

## Full validation (pre-push)

```bash
pnpm validate
```

Runs: Prettier check → typecheck → web lint → Ruff → vitest → pytest.

## CI suggestion

```yaml
- run: pnpm install
- run: pnpm validate
```

Ensure `uv` is available for backend tests or use Docker api image.
