# Quotations API

All endpoints require `Authorization: Bearer <token>` unless noted.

## Quotation object

```json
{
  "id": "q1",
  "client_id": "c1",
  "title": "Website redesign",
  "status": "Draft",
  "items": [
    {
      "id": "item1",
      "title": "Discovery",
      "description": "Workshop",
      "quantity": 1,
      "unit_price": 500.0,
      "estimated_hours": 8.0,
      "total": 500.0
    }
  ],
  "total": 500.0,
  "created_at": "2026-01-15T12:00:00Z"
}
```

**Status values:** `Draft`, `Sent`, `Approved`, `Rejected`

**Totals:** `total` = sum of `quantity * unit_price` (null price → 0).

---

## GET `/quotations`

List quotations with items (newest first).

---

## POST `/quotations`

Create quotation. **HTTP 201**

### Request body

```json
{
  "client_id": "c1",
  "title": "Website redesign",
  "status": "Draft",
  "items": [
    {
      "title": "Discovery",
      "description": "Workshop",
      "quantity": 1,
      "unit_price": 500,
      "estimated_hours": 8
    }
  ]
}
```

Cannot create with `status: "Approved"` - use approve endpoint.

### Errors

| Code        | HTTP | When                      |
| ----------- | ---- | ------------------------- |
| `not_found` | 404  | Invalid `client_id`       |
| `conflict`  | 409  | Status Approved on create |

---

## GET `/quotations/{quotation_id}`

Single quotation with items.

---

## PUT `/quotations/{quotation_id}`

Partial update. All fields optional:

```json
{
  "client_id": "c2",
  "title": "Updated title",
  "status": "Sent",
  "items": [
    {
      "id": "existing-item-id",
      "title": "Updated line",
      "description": "",
      "quantity": 2,
      "unit_price": 100,
      "estimated_hours": 4
    }
  ]
}
```

Replacing `items` clears and recreates lines. Include `id` on items to preserve identity.

---

## DELETE `/quotations/{quotation_id}`

Response `data`: `{}`

---

## POST `/quotations/{quotation_id}/items`

Add a single line item. **HTTP 201**

### Request body

Same fields as item in create (without `id`).

---

## POST `/quotations/{quotation_id}/approve`

Approve quotation and fire n8n webhook.

### Response `data`

```json
{
  "quotation": {},
  "webhook_delivered": true,
  "webhook_detail": "Webhook delivered successfully"
}
```

Idempotent for already-approved quotations.

### Errors

| Code        | HTTP |
| ----------- | ---- |
| `not_found` | 404  |

---

## POST `/quotations/ai-draft`

Generate AI-suggested line items from a client brief.

### Request body

```json
{
  "request": "Need a marketing landing page with contact form and blog",
  "locale": "en"
}
```

| Field     | Type   | Rules            |
| --------- | ------ | ---------------- |
| `request` | string | 1–4000 chars     |
| `locale`  | string | `"en"` or `"ar"` |

### Response `data`

```json
{
  "project_type": "website",
  "suggested_items": [
    {
      "title": "Discovery",
      "description": "Scope workshop",
      "quantity": 1,
      "unit_price": null,
      "estimated_hours": 6
    }
  ],
  "questions_to_ask_client": ["What is your timeline?"],
  "summary": "Initial draft for review.",
  "source": "ai"
}
```

`source` is `"ai"` or `"offline"` (no API key).

### Errors

| Code               | HTTP | When                           |
| ------------------ | ---- | ------------------------------ |
| `ai_rate_limited`  | 429  | Cooldown or quota exceeded     |
| `ai_draft_failed`  | 502  | Provider error or invalid JSON |
| `validation_error` | 422  | Invalid body                   |
