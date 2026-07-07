# API overview

Base URL: `http://localhost:8000` (dev) or your deployed API origin.

## Authentication

Most endpoints require:

```
Authorization: Bearer <access_token>
```

Obtain a token via `POST /auth/login`.

## Content type

```
Content-Type: application/json
```

## Response envelope

Every response uses `{ success, message, data }`. See [Response envelope](envelope.md).

## Endpoint index

| Method   | Path                       | Auth | Description              |
| -------- | -------------------------- | ---- | ------------------------ |
| `POST`   | `/auth/login`              | No   | Login                    |
| `GET`    | `/auth/me`                 | Yes  | Current user             |
| `GET`    | `/`                        | No   | API root (links to docs) |
| `GET`    | `/config`                  | No   | Public config            |
| `GET`    | `/health`                  | No   | Health check             |
| `GET`    | `/ai/usage`                | Yes  | AI usage & limits        |
| `GET`    | `/clients`                 | Yes  | List clients             |
| `POST`   | `/clients`                 | Yes  | Create client            |
| `GET`    | `/clients/{id}`            | Yes  | Get client               |
| `PUT`    | `/clients/{id}`            | Yes  | Update client            |
| `DELETE` | `/clients/{id}`            | Yes  | Delete client            |
| `GET`    | `/quotations`              | Yes  | List quotations          |
| `POST`   | `/quotations`              | Yes  | Create quotation         |
| `GET`    | `/quotations/{id}`         | Yes  | Get quotation            |
| `PUT`    | `/quotations/{id}`         | Yes  | Update quotation         |
| `DELETE` | `/quotations/{id}`         | Yes  | Delete quotation         |
| `POST`   | `/quotations/{id}/items`   | Yes  | Add line item            |
| `POST`   | `/quotations/{id}/approve` | Yes  | Approve + webhook        |
| `POST`   | `/quotations/ai-draft`     | Yes  | Generate AI draft        |

## Interactive documentation

- **Swagger UI:** [`/docs`](/docs) on running API
- **OpenAPI spec:** `/openapi.json`
- **Embedded explorer:** [OpenAPI / Swagger](openapi.md) in this docs site

## Status codes

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 200  | Success                                   |
| 201  | Created                                   |
| 401  | Unauthorized / invalid token              |
| 404  | Resource not found                        |
| 409  | Conflict (e.g. invalid status transition) |
| 422  | Validation error                          |
| 429  | AI rate limit                             |
| 502  | AI provider failure                       |

Error body shape: [Errors](errors.md).
