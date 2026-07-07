# System API

## GET `/`

API root - service metadata and documentation links.

### Response `data`

```json
{
  "name": "QuoteFlow API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc",
  "openapi": "/openapi.json",
  "health": "/health"
}
```

---

## GET `/config`

Public application configuration (no auth).

### Response `data`

```json
{
  "currency_code": "USD"
}
```

Used by frontend `useAppConfig()` for currency formatting.

---

## GET `/health`

Health check (excluded from OpenAPI schema).

### Response `data`

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

Used by Docker Compose healthcheck in `compose.prod.yaml`.
