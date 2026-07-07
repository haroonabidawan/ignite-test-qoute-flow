# QuoteFlow - Reviewer quick start (production)

**Live demo:** https://quoteflow.haroonabidawan.com

**For Ignite team testers** evaluating the live deployment.

## URLs

| Service              | URL                                           |
| -------------------- | --------------------------------------------- |
| **App (start here)** | https://quoteflow.haroonabidawan.com          |
| API / Swagger        | https://api.quoteflow.haroonabidawan.com/docs |
| Documentation        | https://docs.quoteflow.haroonabidawan.com     |
| Approval emails      | https://mail.quoteflow.haroonabidawan.com     |
| n8n workflows        | https://n8n.quoteflow.haroonabidawan.com      |

## Login

```
admin@example.com / password123
```

## 5-minute smoke test

1. **Login** at quoteflow URL → dashboard
2. **Clients** → create one client
3. **Quotations** → new quote → add line items → check total
4. **AI draft** → paste a client brief → review suggestions
5. **Approve & notify** → open **mail.** URL → see approval email

## Full guide

Step-by-step with screenshots expectations and feature checklist:

- **Docs:** https://docs.quoteflow.haroonabidawan.com/#/getting-started/reviewer-guide
- **Repo:** `apps/docs/docs/getting-started/reviewer-guide.md`

## Why we built it this way

- `APPROACH.md` - short architecture summary
- Docs → **Architecture → Design decisions** - Gluestack, monorepo, FastAPI rationale

## Repo checklist

| Item                 | Location                               |
| -------------------- | -------------------------------------- |
| Technical test brief | `Technical-Test.md`                    |
| n8n workflow export  | `n8n/quotation-approved.json`          |
| AI prompt            | `apps/apis/prompts/quotation-draft.md` |
| Backend tests        | `pnpm test:backend`                    |
