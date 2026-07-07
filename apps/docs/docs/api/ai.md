# AI usage API

## GET `/ai/usage`

Returns current user's AI draft usage and configured limits.

**Auth required:** Yes

### Response `data`

```json
{
  "hourly_used": 2,
  "hourly_limit": 10,
  "hourly_remaining": 8,
  "daily_used": 5,
  "daily_limit": 30,
  "daily_remaining": 25,
  "global_daily_used": 42,
  "global_daily_limit": 200,
  "cooldown_seconds": 15,
  "seconds_until_next_request": 0,
  "max_request_chars": 4000
}
```

| Field                        | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `hourly_*`                   | Rolling 1-hour window per user                         |
| `daily_*`                    | Rolling 24-hour window per user                        |
| `global_daily_*`             | All users combined (`global_daily_limit` 0 = disabled) |
| `seconds_until_next_request` | Cooldown wait time; 0 = ready                          |
| `max_request_chars`          | Max length for `ai-draft` request text                 |

### Usage

Frontend `useAiUsage()` polls this endpoint; quotation create screen shows remaining quota and disables generate when limited.

See also [Backend: AI](backend/ai.md).
