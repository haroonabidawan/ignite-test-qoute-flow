# Clients API

All endpoints require `Authorization: Bearer <token>`.

## GET `/clients`

List all clients (newest first).

### Response `data`

Array of client objects:

```json
[
  {
    "id": "abc123",
    "name": "Jane Doe",
    "company": "Acme Inc",
    "email": "jane@acme.com",
    "phone": "+1 555 0100",
    "notes": "",
    "created_at": "2026-01-15T12:00:00Z"
  }
]
```

---

## POST `/clients`

Create a client. **HTTP 201**

### Request body

```json
{
  "name": "Jane Doe",
  "company": "Acme Inc",
  "email": "jane@acme.com",
  "phone": "",
  "notes": ""
}
```

| Field     | Required | Max length  |
| --------- | -------- | ----------- |
| `name`    | Yes      | 255         |
| `company` | No       | 255         |
| `email`   | Yes      | valid email |
| `phone`   | No       | 50          |
| `notes`   | No       | 2000        |

### Response `data`

Single client object (same shape as list item).

---

## GET `/clients/{client_id}`

### Errors

| Code        | HTTP |
| ----------- | ---- |
| `not_found` | 404  |

---

## PUT `/clients/{client_id}`

Full update - send all fields (same shape as create).

---

## DELETE `/clients/{client_id}`

### Response `data`

Empty object `{}`.
