# n8n - Quotation Approved workflow

Imported automatically on first `n8n` container start via `docker-entrypoint.sh`.

## Files

| File                      | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `quotation-approved.json` | Exported workflow (webhook → build HTML → email)                           |
| `build-email.js`          | Source for the **Build Email** Code node (edit here, then regenerate JSON) |
| `credentials.json`        | Mailpit SMTP credentials for the email node                                |
| `docker-entrypoint.sh`    | Import credentials once; re-import workflow on every start                 |

## Webhook

- **Path:** `quotation-approved`
- **Method:** POST
- **URL (from API container):** `http://n8n:5678/webhook/quotation-approved`
- **URL (from host):** `http://localhost:5678/webhook/quotation-approved`

Set `N8N_WEBHOOK_URL` in `.env` if you change the path or run n8n elsewhere.

## Email

The workflow sends a styled HTML notification to `admin@example.com` through Mailpit SMTP (`mailpit:1025`). The email includes client details, line items, totals, and currency. View messages at http://localhost:8025.

Regenerate the workflow JSON after editing `build-email.js`:

```bash
node -e "const fs=require('fs'); const js=fs.readFileSync('n8n/build-email.js','utf8'); const w=JSON.parse(fs.readFileSync('n8n/quotation-approved.json','utf8')); w.nodes.find(n=>n.name==='Build Email').parameters.jsCode=js; fs.writeFileSync('n8n/quotation-approved.json', JSON.stringify(w,null,2)+'\n');"
docker compose restart n8n
```

## Reset import

```bash
docker compose stop n8n
docker volume rm quoteflow_n8n-data
docker compose up -d n8n
```
