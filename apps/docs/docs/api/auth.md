# Auth API

## POST `/auth/login`

Authenticate with email and password.

**Auth required:** No

### Request body

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

| Field      | Type   | Rules        |
| ---------- | ------ | ------------ |
| `email`    | string | Valid email  |
| `password` | string | Min length 1 |

### Response `data`

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User"
  },
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Errors

| Code                  | HTTP | When                 |
| --------------------- | ---- | -------------------- |
| `invalid_credentials` | 401  | Wrong email/password |
| `validation_error`    | 422  | Invalid body         |

---

## GET `/auth/me`

Return the authenticated user profile.

**Auth required:** Yes

### Response `data`

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "name": "Admin User"
}
```

### Errors

| Code           | HTTP | When                     |
| -------------- | ---- | ------------------------ |
| `unauthorized` | 401  | Missing or invalid token |
