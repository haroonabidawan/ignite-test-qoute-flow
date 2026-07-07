# API errors

Errors return `success: false` with a machine-readable `data.code`.

## Error codes

| Code                    | HTTP   | Message (EN)                 | When                      |
| ----------------------- | ------ | ---------------------------- | ------------------------- |
| `invalid_credentials`   | 401    | Invalid email or password    | Login failure             |
| `unauthorized`          | 401    | -                            | Missing/invalid JWT       |
| `not_found`             | 404    | Resource not found           | Unknown ID                |
| `conflict`              | 409    | Conflicts with existing data | Invalid status transition |
| `validation_error`      | 422    | Check your input             | Pydantic validation       |
| `ai_rate_limited`       | 429    | AI usage limit reached       | Rate limits               |
| `ai_draft_failed`       | 502    | AI draft failed              | Provider/parse error      |
| `http_error`            | varies | Request failed               | Starlette HTTP errors     |
| `internal_server_error` | 500    | Unexpected server error      | Unhandled exception       |
| `app_error`             | 400    | Generic app error            | Base `AppError`           |

## Validation errors (422)

`data.errors` contains Pydantic error objects:

```json
{
  "success": false,
  "message": "body.email: value is not a valid email",
  "data": {
    "code": "validation_error",
    "errors": [
      {
        "type": "value_error",
        "loc": ["body", "email"],
        "msg": "value is not a valid email address",
        "input": "not-an-email"
      }
    ]
  }
}
```

## Frontend i18n

Translations in `packages/i18n/src/locales/{en,ar}.ts` under `errors.*`.

Store errors as `UiMessageState` (not pre-translated strings) so locale switches update the message - see `@repo/ui` `src/lib/errors.ts`.

## CORS

If the browser blocks requests, ensure the web origin is listed in `ALLOWED_ORIGINS` (comma-separated env on API).
