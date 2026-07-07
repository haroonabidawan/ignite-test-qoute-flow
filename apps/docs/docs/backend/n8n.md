# n8n & approvals

Approving a quotation triggers an external automation workflow.

## Endpoint

`POST /quotations/{id}/approve` - see [API: Quotations](api/quotations.md#approve-quotation).

## Flow

1. Quotation must not already be `Approved`.
2. Status set to `Approved` in database.
3. `N8nService` POSTs JSON payload to `N8N_WEBHOOK_URL`.
4. Response includes whether webhook succeeded (`webhook_delivered`, `webhook_detail`).
5. Approval **succeeds even if webhook fails** - UI shows delivery status.

## n8n in Docker

- Image: `n8nio/n8n`
- On start: `n8n/docker-entrypoint.sh` imports workflow + credentials
- Workflow file: `n8n/quotation-approved.json`
- Dev Mailpit SMTP: workflow sends approval email to captured inbox

## Configuration

| Env                   | Example                                      |
| --------------------- | -------------------------------------------- |
| `N8N_WEBHOOK_URL`     | `http://n8n:5678/webhook/quotation-approved` |
| `N8N_TIMEOUT_SECONDS` | `10`                                         |
| `N8N_ENCRYPTION_KEY`  | Required in prod                             |
| `N8N_PUBLIC_URL`      | Public n8n URL (Dokploy)                     |

**Important:** Keep internal webhook URL (`http://n8n:5678/...`) for API → n8n calls inside Docker network.

## Webhook payload

Includes quotation summary, client info, line items, totals, and `currency_code` from settings.

## Testing

1. `make up-build`
2. Create quotation → **Approve & notify**
3. Open Mailpit UI (http://localhost:8025) for the email
