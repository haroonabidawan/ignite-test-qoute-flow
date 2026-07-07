# Production reviewer guide

Guide for **Ignite team testers** evaluating the deployed QuoteFlow instance on **haroonabidawan.com**.

## Live URLs

All services use **HTTPS** (Let's Encrypt via Dokploy). Map each hostname to the **container** port shown in Dokploy → Domains.

| Service     | URL                                       | Container port | What it is                                               |
| ----------- | ----------------------------------------- | -------------- | -------------------------------------------------------- |
| **Web app** | https://quoteflow.haroonabidawan.com      | `3000`         | Main product - login, clients, quotations, AI draft, PDF |
| **API**     | https://api.quoteflow.haroonabidawan.com  | `8000`         | FastAPI backend - JSON API + Swagger                     |
| **Docs**    | https://docs.quoteflow.haroonabidawan.com | `80`           | This documentation site (architecture, API reference)    |
| **n8n**     | https://n8n.quoteflow.haroonabidawan.com  | `5678`         | Workflow editor - approve → webhook → email              |
| **Mailpit** | https://mail.quoteflow.haroonabidawan.com | `8025`         | Dev-style mail catcher - approval notification emails    |

> **Note:** Postgres (`db`) has no public URL. It is internal to the Docker network only.

## Demo login

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@example.com` |
| Password | `password123`       |

The admin user is **seeded automatically** on API startup. If login fails after a fresh deploy, ask the deployer to run `python -m database.seed` in the API container (see [Troubleshooting](#troubleshooting)).

---

## Recommended test flow (~15 minutes)

Follow this order to hit every required feature and integration.

### 1. Web app - login & dashboard

**URL:** https://quoteflow.haroonabidawan.com

| Step | Action                       | What you should see                                                               |
| ---- | ---------------------------- | --------------------------------------------------------------------------------- |
| 1    | Open the URL                 | Login page with QuoteFlow branding; language switcher (**EN** / **AR**) top-right |
| 2    | Log in with demo credentials | Redirect to **Dashboard** with workspace sidebar (Clients, Quotations)            |
| 3    | Switch language to **AR**    | UI flips to RTL; labels in Arabic; any error messages also in Arabic              |

### 2. Clients - CRUD

**URL:** https://quoteflow.haroonabidawan.com/clients

| Step | Action                       | What you should see                        |
| ---- | ---------------------------- | ------------------------------------------ |
| 1    | Click **Clients** in sidebar | List of clients (may be empty on fresh DB) |
| 2    | **Add client**               | Form: name, company, email, phone, notes   |
| 3    | Save                         | Client appears in list                     |
| 4    | Edit / delete                | Changes persist after refresh              |

### 3. Quotations - create, items, total

**URL:** https://quoteflow.haroonabidawan.com/quotations

| Step | Action                | What you should see                                                  |
| ---- | --------------------- | -------------------------------------------------------------------- |
| 1    | **New quotation**     | Pick client, enter title; status starts as **Draft**                 |
| 2    | Open quotation detail | Line items table; **Add item** (title, description, qty, unit price) |
| 3    | Add 2–3 items         | **Total amount** updates automatically                               |
| 4    | **PDF preview**       | Print-ready A4 layout; download works                                |

### 4. AI draft generator

On the **create quotation** or detail screen (AI section).

**Example client brief to paste:**

```text
Client needs a company website with 8 pages, contact form, blog, SEO setup, and hosting recommendation.
```

| Step | Action                        | What you should see                                                 |
| ---- | ----------------------------- | ------------------------------------------------------------------- |
| 1    | Paste brief, run **AI draft** | Loading state, then suggested line items + questions for the client |
| 2    | Review suggestions            | Items are editable before adding to the quotation                   |
| 3    | Add to quotation              | Items merge into the line-item table                                |

> **If AI is disabled:** deploy may have no `AI_API_KEY`. The API still returns a **sensible offline fallback** draft so the flow is testable. Check https://api.quoteflow.haroonabidawan.com/docs → `POST /quotations/ai-draft`.

### 5. Approve → n8n → email (integration test)

This is the main **n8n** requirement from the technical test.

| Step | Action                                          | What you should see                                                                                                            |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1    | On quotation detail, click **Approve & notify** | Status becomes **Approved**; success toast (may mention webhook delivery)                                                      |
| 2    | Open **Mailpit**                                | https://mail.quoteflow.haroonabidawan.com                                                                                      |
| 3    | Inbox                                           | Email about the approved quotation (recipient from workflow config)                                                            |
| 4    | Optional: open **n8n**                          | https://n8n.quoteflow.haroonabidawan.com - workflow `quotation-approved` (imported from `n8n/quotation-approved.json` in repo) |

Approval **succeeds even if n8n is down** - the API does not block on webhook failure.

### 6. API - Swagger & health

**URLs:**

| Endpoint                                        | Purpose                                      |
| ----------------------------------------------- | -------------------------------------------- |
| https://api.quoteflow.haroonabidawan.com/       | API info + links                             |
| https://api.quoteflow.haroonabidawan.com/docs   | **Swagger UI** - try endpoints interactively |
| https://api.quoteflow.haroonabidawan.com/health | `{"status":"ok"}` or similar                 |

| Step | Action                                   | What you should see                                    |
| ---- | ---------------------------------------- | ------------------------------------------------------ |
| 1    | Open `/docs`                             | OpenAPI UI with Auth, Clients, Quotations, AI sections |
| 2    | `POST /auth/login` with demo credentials | `{ success, data: { access_token } }`                  |
| 3    | Authorize with Bearer token              | Other endpoints return data (not 401)                  |

All JSON responses use the envelope: `{ "success", "message", "data" }`.

### 7. Documentation site

**URL:** https://docs.quoteflow.haroonabidawan.com

| Section                             | Why it matters for review                 |
| ----------------------------------- | ----------------------------------------- |
| **Getting started → Overview**      | Product summary                           |
| **Architecture → Design decisions** | Why monorepo, Gluestack, FastAPI, etc.    |
| **API reference**                   | Endpoint docs + embedded OpenAPI          |
| **Deployment → Dokploy**            | How this production instance was deployed |

---

## Quick reference - what lives where

```
quoteflow.haroonabidawan.com     →  Use the app (login here)
api.quoteflow.haroonabidawan.com →  Swagger + REST API
docs.quoteflow.haroonabidawan.com→  Project documentation (you are here)
n8n.quoteflow.haroonabidawan.com →  Inspect approve webhook workflow
mail.quoteflow.haroonabidawan.com→  See approval notification emails
```

## Feature checklist (technical test)

| Requirement                     | Where to verify                             |
| ------------------------------- | ------------------------------------------- |
| A. Login                        | Web → login page                            |
| B. Clients CRUD                 | Web → `/clients`                            |
| C. Quotations CRUD + statuses   | Web → `/quotations`                         |
| D. Quotation items + auto total | Quotation detail page                       |
| E. AI draft from client brief   | Create/detail → AI section                  |
| F. n8n on **Approved**          | Approve → Mailpit email; optional n8n UI    |
| Bonus: EN/AR + RTL              | Language switcher on login and workspace    |
| Bonus: PDF export               | Quotation → Preview / download              |
| Backend tests                   | Repo: `pnpm test:backend` (22 pytest tests) |
| n8n workflow JSON               | Repo: `n8n/quotation-approved.json`         |

## Repo artifacts (not on production URLs)

| File                                   | Purpose                              |
| -------------------------------------- | ------------------------------------ |
| `Technical-Test.md`                    | Original brief                       |
| `APPROACH.md`                          | Architecture summary + demo commands |
| `AUDIT.md`                             | Self-assessment vs requirements      |
| `n8n/quotation-approved.json`          | Exported workflow for requirement F  |
| `apps/apis/prompts/quotation-draft.md` | AI system prompt                     |

## Troubleshooting

| Problem                                     | Likely cause                                     | Fix                                                                                       |
| ------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Login: "Invalid email or password"          | DB not seeded                                    | API container: `python -m database.seed`                                                  |
| Web loads but API calls fail (CORS/network) | Wrong `NEXT_PUBLIC_API_URL`                      | Rebuild **web** image with `NEXT_PUBLIC_API_URL=https://api.quoteflow.haroonabidawan.com` |
| API root 404                                | Old API image                                    | Redeploy latest; `GET /` should return API info                                           |
| No approval email in Mailpit                | n8n workflow inactive or SMTP node misconfigured | Check n8n UI → executions; workflow in `n8n/` folder                                      |
| AI always shows fallback draft              | No `AI_API_KEY` in env                           | Expected for cost-safe demo; flow still works                                             |
| Arabic layout broken                        | Browser cache                                    | Hard refresh; check `dir="rtl"` on `<html>` after switching                               |

## Local reproduction

If you prefer running locally instead of production:

```bash
git clone <repo>
make setup && make up-build
# Web: http://localhost:3010
# API: http://localhost:8000/docs
# Docs: http://localhost:3100
# Mailpit: http://localhost:8025
```

See [Quick start](quick-start.md) and [Production](production.md) for details.

## Contact / deploy notes

- **Compose file:** `compose.prod.yaml`
- **Design rationale:** [Design decisions](../architecture/design-decisions.md)
