# Database & migrations

PostgreSQL in production; SQLite supported for pytest.

## ORM models

| Table             | Model           | Notes                                     |
| ----------------- | --------------- | ----------------------------------------- |
| `users`           | `User`          | Admin login                               |
| `clients`         | `Client`        | Customer records                          |
| `quotations`      | `Quotation`     | Status enum: Draft/Sent/Approved/Rejected |
| `quotation_items` | `QuotationItem` | Normalized line items (not JSON blob)     |
| `ai_logs`         | `AiLog`         | AI usage audit trail                      |

## Migrations (Alembic)

```
apps/apis/database/migrations/versions/
  001_create_users_table.py
  002_create_clients_table.py
  003_create_quotations_table.py
  004_create_ai_logs_table.py
  005_create_quotation_items_table.py
  006_drop_quotations_items_json.py
  007_add_ai_log_user_id.py
```

### Commands

```bash
make migrate              # upgrade head (Docker)
make migrate:rollback     # downgrade -1
make migrate:reset      # downgrade base + upgrade head
make seed               # seed admin user
```

Inside api container or locally:

```bash
python -m alembic upgrade head
python -m database.seed
```

## Connection

`DATABASE_URL` - async driver required:

- Postgres: `postgresql+asyncpg://user:pass@host:5432/db`
- Test: `sqlite+aiosqlite:///:memory:`

## Timestamps

`TimestampMixin` adds `created_at` / `updated_at` (timezone-aware).

## Seeding

Idempotent - safe to run multiple times. Creates default admin if missing.
