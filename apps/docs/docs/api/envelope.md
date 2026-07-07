# Response envelope

All API responses share one JSON shape.

## Success

```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": {}
}
```

The `data` field type depends on the endpoint (object, array, or empty `{}` on delete).

## Error

```json
{
  "success": false,
  "message": "Error summary",
  "data": {
    "code": "validation_error",
    "errors": []
  }
}
```

| Field         | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| `success`     | boolean | `true` or `false`                      |
| `message`     | string  | Summary for UI or logs                 |
| `data`        | object  | Payload or error details               |
| `data.code`   | string  | Machine-readable error code for i18n   |
| `data.errors` | array   | Pydantic validation details (422 only) |

## Frontend handling

`@repo/api` throws `ApiError` when `success === false` or HTTP status is not OK.

`@repo/i18n` maps `error.code` → `errors.{code}` translation keys.

## TypeScript types

```ts
import type { ApiEnvelope, ApiErrorBody } from "@repo/types";
```
