# Backend overview

FastAPI application in `apps/apis` with async SQLAlchemy and PostgreSQL.

## Entry points

| File               | Role                                    |
| ------------------ | --------------------------------------- |
| `main.py`          | Uvicorn entry                           |
| `bootstrap/app.py` | `create_app()` - CORS, lifespan, routes |
| `routes/api.py`    | Router registration                     |

## Lifespan

On startup: `run_migrations()` (Alembic `upgrade head`).  
On shutdown: dispose SQLAlchemy engine.

## Layers

```
HTTP Request
  → Controller (thin)
  → Service (business logic)
  → Repository (SQLAlchemy queries)
  → Model (ORM)
```

## Response format

All endpoints return [API envelope](api/envelope.md). Errors use the same shape with `success: false`.

## Interactive docs

When the API is running:

- **Swagger UI:** `/docs`
- **OpenAPI JSON:** `/openapi.json`

## Local run

```bash
cd apps/apis
uv sync --extra dev --extra lint
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or: `pnpm dev:backend` from repo root.

## Tests

```bash
pnpm test:backend   # 22 pytest tests, sqlite in-memory
```
