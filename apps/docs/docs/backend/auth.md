# Authentication

JWT bearer tokens - stateless API auth.

## Endpoints

See [API: Auth](api/auth.md).

## Flow

1. `POST /auth/login` with email + password.
2. Backend verifies hash (bcrypt via passlib), returns `access_token`.
3. Frontend stores token in `localStorage` via `createWebTokenStorage()`.
4. Subsequent requests send `Authorization: Bearer <token>`.
5. `GET /auth/me` returns current user from JWT `sub` claim.

## Configuration

| Env                           | Default | Purpose                  |
| ----------------------------- | ------- | ------------------------ |
| `SECRET_KEY`                  | -       | JWT signing (≥ 32 chars) |
| `JWT_ALGORITHM`               | `HS256` | Algorithm                |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `720`   | Token TTL                |

## Protected routes

Use `CurrentUser` dependency from `config/dependencies.py` - returns 401 if token missing/invalid.

## Demo user

Seeded by `database/seed.py`:

- `admin@example.com` / `password123`

## Security notes

- Passwords hashed with bcrypt (pinned compatible version for passlib).
- AI keys and secrets only in backend env - never in `NEXT_PUBLIC_*`.
- Login failure returns `invalid_credentials` (no user enumeration).
