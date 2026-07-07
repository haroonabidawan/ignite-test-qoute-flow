# Technical Test: AI-Assisted Quotation Builder

_Candidate Brief - 5 Days_

> **Goal: Build a small full-stack web app where a user can create client quotations faster using AI. The main focus is development and AI use. n8n is only small integration and its optional.**

# 1. What You Need to Build

Build a simple quotation management app. A user should be able to create a quotation manually or use AI to generate a first draft from a short client request.

- Example client request: "Client needs a company website with 8 pages, contact form, blog, SEO setup, and hosting recommendation."
- The AI should suggest quotation items, estimated hours or pricing placeholders, and questions to ask the client.
- The user must be able to review and edit everything before saving.

# 2. Required Features

## A. Login

- Simple login is enough. You can seed one test user, for example admin@example.com / password123.

## B. Clients

- Create, edit, delete, and list clients.
- Client fields: name, company, email, phone, notes.

## C. Quotations

- Create, edit, delete, and list quotations.
- Quotation fields: client, title, status, total amount, created date.
- Quotation statuses: Draft, Sent, Approved, Rejected.
- Quotation detail page should show all quotation items.

## D. Quotation Items

- Add items manually inside a quotation.
- Item fields: title, description, quantity, unit price, total.
- The app should calculate quotation total automatically.

## E. AI Draft Generator

- Add a text box where the user pastes a client request.
- Backend calls an AI model and returns structured JSON.
- Show the suggested items on screen so the user can review/edit before adding them to the quotation.

## F. n8n Integration

- When a quotation status becomes Approved, call an n8n webhook URL.
- The n8n workflow can be very simple: receive webhook, send email/Slack/Discord notification, return success.
- Submit the exported n8n workflow JSON with your repo.

# 3. AI Expected Output

The AI should return JSON similar to this:

```json
{
  "project_type": "website development",
  "suggested_items": [
    {
      "title": "Website design and development",
      "description": "8-page corporate website",
      "quantity": 1,
      "unit_price": null,
      "estimated_hours": 60
    },
    {
      "title": "SEO setup",
      "description": "Basic on-page SEO and metadata",
      "quantity": 1,
      "unit_price": null,
      "estimated_hours": 8
    }
  ],
  "questions_to_ask_client": [
    "Do you need Arabic support?",
    "Do you have hosting and domain?"
  ],
  "summary": "The client needs a corporate website with basic SEO and hosting guidance."
}
```

# 4. Technology

- Frontend: React, Next.js, Vue, or any framework you are comfortable with.
- Backend: Node.js/Express, Laravel, or similar you are comfortable with.
- Database: SQLite, MySQL, or PostgreSQL. SQLite is acceptable for this test.
- AI Provider: OpenAI, Groq, Together, Gemini, Ollama, or any compatible provider. You can use any free API provider like Groq for this project
- n8n: Use a webhook integration only. No complex n8n workflow is required. You can use the free trial of n8n and send us the final exported JSON separately

# 5. Backend API Suggestions

You can design your own API, but these endpoints are recommended:

- POST /auth/login
- GET /clients
- POST /clients
- PUT /clients/:id
- DELETE /clients/:id
- GET /quotations
- POST /quotations
- GET /quotations/:id
- PUT /quotations/:id
- POST /quotations/:id/items
- POST /quotations/ai-draft
- POST /quotations/:id/approve

# 6. Minimum Database Tables

- users
- clients
- quotations
- quotation_items
- ai_logs (optional)

# 7. Important Requirements

- AI must be called from the backend, not directly from the frontend.
- Do not expose API keys in the frontend.
- AI response must be validated before saving.
- If the AI does not know a price, it should return null. Do not invent prices.
- Store your AI prompt in /prompts/quotation-draft.md.
- Add basic error handling for AI failure and n8n webhook failure.

# 8. What to Submit

- GitHub/GitLab repo link.
- README with setup steps and test login details.
- live demo link preferred, if you can’t then you cans send short demo video.
- Exported n8n workflow JSON.
- AI prompt file used in the project.
- Short note explaining your approach and what you would improve in production.

# 9. Timeframe

You have 5 days to complete the test. If you cannot finish everything, submit what you completed and mention what is pending.

# 10. Scoring

| Area                               | Points |
| ---------------------------------- | ------ |
| Full-stack app functionality       | 40     |
| Backend API and database design    | 20     |
| Frontend usability and clean UI    | 15     |
| AI integration and JSON validation | 15     |
| n8n webhook integration            | 5      |
| README, demo, and code clarity     | 5      |

# 11. Bonus

- Quotation preview or PDF export.
- Bilingual quotation support (English/Arabic).
- Search and filters on the quotation list.
- Basic tests for total calculation or AI validation.

# 12. AI Usage Policy

- You may use AI tools for help, but you must understand and explain your code.
- If you used AI during development, add a short /ai-notes.md file explaining what tools you used and what you changed.
