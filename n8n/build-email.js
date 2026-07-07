// Source for the n8n Code node - kept in repo for readability; copied into quotation-approved.json
const raw = $input.first().json;
const root = raw.body ?? raw;

const quotation = root.quotation ?? root;
const client = root.client ?? {};
const currency = root.currency_code ?? "USD";

const fmt = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);

const fmtDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const items = Array.isArray(quotation.items) ? quotation.items : [];
const itemRows = items.length
  ? items
      .map(
        (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <strong style="color:#0f172a;display:block;">${esc(item.title)}</strong>
          ${
            item.description
              ? `<span style="color:#64748b;font-size:13px;">${esc(item.description)}</span>`
              : ""
          }
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:center;color:#334155;">${esc(item.quantity)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;color:#334155;">${
          item.unit_price == null ? "TBD" : fmt(item.unit_price)
        }</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a;">${fmt(item.total)}</td>
      </tr>`
      )
      .join("")
  : `<tr><td colspan="4" style="padding:16px;color:#64748b;text-align:center;">No line items</td></tr>`;

const estimatedHours = items.reduce(
  (sum, item) => sum + (Number(item.estimated_hours) || 0),
  0
);

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f766e,#059669);padding:28px 32px;">
            <p style="margin:0 0 8px;color:#ccfbf1;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">QuoteFlow</p>
            <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;">Quotation Approved</h1>
            <p style="margin:12px 0 0;color:#d1fae5;font-size:15px;">${esc(quotation.title)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
              <tr>
                <td style="width:50%;padding-right:8px;vertical-align:top;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Client</p>
                    <p style="margin:0;color:#0f172a;font-size:16px;font-weight:600;">${esc(client.name || "Unknown client")}</p>
                    ${client.company ? `<p style="margin:4px 0 0;color:#475569;font-size:14px;">${esc(client.company)}</p>` : ""}
                    ${client.email ? `<p style="margin:8px 0 0;color:#059669;font-size:14px;">${esc(client.email)}</p>` : ""}
                    ${client.phone ? `<p style="margin:4px 0 0;color:#475569;font-size:14px;">${esc(client.phone)}</p>` : ""}
                  </div>
                </td>
                <td style="width:50%;padding-left:8px;vertical-align:top;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Details</p>
                    <p style="margin:0;color:#0f172a;font-size:14px;"><strong>Quote ID:</strong> ${esc(quotation.id)}</p>
                    <p style="margin:8px 0 0;color:#0f172a;font-size:14px;"><strong>Status:</strong> ${esc(quotation.status)}</p>
                    <p style="margin:8px 0 0;color:#0f172a;font-size:14px;"><strong>Created:</strong> ${fmtDate(quotation.created_at)}</p>
                    <p style="margin:8px 0 0;color:#0f172a;font-size:14px;"><strong>Approved:</strong> ${fmtDate(new Date().toISOString())}</p>
                  </div>
                </td>
              </tr>
            </table>

            <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px;">Line items (${items.length})</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th align="left" style="padding:12px 16px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
                  <th align="center" style="padding:12px 16px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
                  <th align="right" style="padding:12px 16px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Rate</th>
                  <th align="right" style="padding:12px 16px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding:20px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="color:#065f46;font-size:14px;">Grand total (${esc(currency)})</td>
                      <td align="right" style="color:#065f46;font-size:28px;font-weight:700;">${fmt(quotation.total)}</td>
                    </tr>
                    ${
                      estimatedHours
                        ? `<tr><td style="padding-top:8px;color:#047857;font-size:13px;">Estimated hours</td><td align="right" style="padding-top:8px;color:#047857;font-size:13px;font-weight:600;">${estimatedHours}h</td></tr>`
                        : ""
                    }
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;text-align:center;">
            Automated notification from QuoteFlow
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const text = [
  `Quotation approved: ${quotation.title}`,
  `Client: ${client.name || "Unknown"}${client.company ? ` (${client.company})` : ""}`,
  client.email ? `Email: ${client.email}` : null,
  `Total: ${fmt(quotation.total)}`,
  `Items: ${items.length}`,
  ...items.map(
    (item) =>
      `- ${item.title} x${item.quantity} @ ${item.unit_price == null ? "TBD" : fmt(item.unit_price)} = ${fmt(item.total)}`
  ),
]
  .filter(Boolean)
  .join("\n");

return [
  {
    json: {
      subject: `Quotation approved: ${quotation.title}`,
      html,
      text,
    },
  },
];
