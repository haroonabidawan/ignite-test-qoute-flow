# AI drafts & rate limits

AI turns a free-text client brief into suggested quotation line items.

## Endpoint

`POST /quotations/ai-draft` - see [API: Quotations](api/quotations.md#generate-ai-draft).

## Provider

OpenAI-compatible chat completions (`AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`).

Default dev: **Groq** (`llama-3.1-8b-instant`).  
Prompt file: `apps/apis/prompts/quotation-draft.md`.

## Offline fallback

When `AI_API_KEY` is empty, `AiService._offline_draft()` returns a deterministic heuristic draft with `source: "offline"`. The app runs without any provider.

## Validation

Model output must parse as JSON matching `AiDraftResponse`:

- `project_type`, `suggested_items[]`, `questions_to_ask_client[]`, `summary`
- Invalid JSON/shape → `502` with `ai_draft_failed`

## Rate limits (`AiUsageService`)

Enforced **before** every AI call; attempts logged to `ai_logs`.

| Setting                 | Default | Purpose                           |
| ----------------------- | ------- | --------------------------------- |
| `AI_MAX_REQUEST_CHARS`  | 4000    | Max brief length                  |
| `AI_COOLDOWN_SECONDS`   | 15      | Min gap between requests per user |
| `AI_USER_HOURLY_LIMIT`  | 10      | Per-user hourly cap               |
| `AI_USER_DAILY_LIMIT`   | 30      | Per-user daily cap                |
| `AI_GLOBAL_DAILY_LIMIT` | 0       | Org-wide daily cap (0 = off)      |

Exceeded → `429` with code `ai_rate_limited`.

## Usage monitoring

`GET /ai/usage` - returns hourly/daily counts, limits, cooldown remaining.  
Frontend shows quota on quotation create screen via `useAiUsage()`.

## Locale

Pass `locale: "en" | "ar"` - system prompt instructs output language for text fields.
