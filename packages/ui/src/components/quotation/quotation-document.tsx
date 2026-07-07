"use client";

import { forwardRef, type CSSProperties } from "react";
import type { Client, Quotation, QuotationItem, QuotationStatus } from "@repo/types";
import { calculateItemTotal, calculateQuotationTotal } from "../../lib/calculations";

export interface QuotationDocumentLabels {
  appName: string;
  quotation: string;
  quoteNumber: string;
  quoteDate: string;
  status: string;
  billTo: string;
  item: string;
  description: string;
  qty: string;
  rate: string;
  hours: string;
  amount: string;
  subtotal: string;
  total: string;
  estimatedHours: string;
  preparedBy: string;
  tbd: string;
  statusLabels: Record<QuotationStatus, string>;
}

export interface QuotationDocumentProps {
  quotation: Quotation;
  client: Client | null;
  preparedBy?: string;
  formatCurrency: (amount: number) => string;
  formatDate: (iso: string) => string;
  labels: QuotationDocumentLabels;
  dir?: "ltr" | "rtl";
}

const pageStyle: CSSProperties = {
  width: "794px",
  minHeight: "1123px",
  margin: "0 auto",
  padding: "48px",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontFamily:
    'var(--font-geist-sans, ui-sans-serif), "Noto Sans Arabic", system-ui, sans-serif',
  fontSize: "14px",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

const thStyle: CSSProperties = {
  padding: "10px 12px",
  textAlign: "start",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#64748b",
  borderBottom: "2px solid #e2e8f0",
  backgroundColor: "#f8fafc",
};

const tdStyle: CSSProperties = {
  padding: "12px",
  verticalAlign: "top",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
};

function formatRate(
  unitPrice: number | null,
  formatCurrency: (amount: number) => string,
  tbd: string
): string {
  if (unitPrice === null || Number.isNaN(unitPrice)) {
    return tbd;
  }
  return formatCurrency(unitPrice);
}

function formatHours(hours: number | null): string {
  if (hours === null || Number.isNaN(hours)) {
    return "-";
  }
  return String(hours);
}

function LineRow({
  item,
  index,
  formatCurrency,
  labels,
  dir,
}: {
  item: QuotationItem;
  index: number;
  formatCurrency: (amount: number) => string;
  labels: QuotationDocumentLabels;
  dir: "ltr" | "rtl";
}) {
  const amount = calculateItemTotal(item.quantity, item.unitPrice);

  return (
    <tr>
      <td style={{ ...tdStyle, width: "36px", color: "#64748b" }}>{index + 1}</td>
      <td style={{ ...tdStyle, minWidth: "200px" }}>
        <div style={{ fontWeight: 600, marginBottom: item.description ? 4 : 0 }}>
          {item.title || "-"}
        </div>
        {item.description ? (
          <div style={{ fontSize: "12px", color: "#64748b" }}>{item.description}</div>
        ) : null}
      </td>
      <td style={{ ...tdStyle, width: "56px", textAlign: "center" }}>
        {item.quantity}
      </td>
      <td
        style={{
          ...tdStyle,
          width: "96px",
          textAlign: dir === "rtl" ? "left" : "right",
        }}
      >
        {formatRate(item.unitPrice, formatCurrency, labels.tbd)}
      </td>
      <td style={{ ...tdStyle, width: "64px", textAlign: "center" }}>
        {formatHours(item.estimatedHours)}
      </td>
      <td
        style={{
          ...tdStyle,
          width: "104px",
          textAlign: dir === "rtl" ? "left" : "right",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}

export const QuotationDocument = forwardRef<HTMLDivElement, QuotationDocumentProps>(
  function QuotationDocument(
    { quotation, client, preparedBy, formatCurrency, formatDate, labels, dir = "ltr" },
    ref
  ) {
    const total = calculateQuotationTotal(quotation.items);
    const estimatedHours = quotation.items.reduce(
      (sum, item) => sum + (item.estimatedHours ?? 0),
      0
    );
    const shortId = quotation.id.replace(/-/g, "").slice(-8).toUpperCase();

    return (
      <div ref={ref} dir={dir} style={pageStyle} data-quotation-document>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "32px",
            paddingBottom: "24px",
            borderBottom: "3px solid #059669",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f766e",
                letterSpacing: "-0.02em",
              }}
            >
              {labels.appName}
            </div>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "#64748b" }}>
              {labels.quotation}
            </div>
          </div>
          <div style={{ textAlign: dir === "rtl" ? "start" : "end" }}>
            <div
              style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em" }}
            >
              {quotation.title}
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
              {labels.quoteNumber} {shortId}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#64748b",
                marginBottom: "8px",
              }}
            >
              {labels.billTo}
            </div>
            {client ? (
              <>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>{client.name}</div>
                {client.company ? (
                  <div style={{ color: "#475569", marginTop: "2px" }}>
                    {client.company}
                  </div>
                ) : null}
                {client.email ? (
                  <div style={{ color: "#64748b", marginTop: "6px", fontSize: "13px" }}>
                    {client.email}
                  </div>
                ) : null}
                {client.phone ? (
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    {client.phone}
                  </div>
                ) : null}
              </>
            ) : (
              <div style={{ color: "#94a3b8" }}>-</div>
            )}
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "grid", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  {labels.quoteDate}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {formatDate(quotation.createdAt)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  {labels.status}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      quotation.status === "Approved"
                        ? "#059669"
                        : quotation.status === "Rejected"
                          ? "#dc2626"
                          : "#0f766e",
                  }}
                >
                  {labels.statusLabels[quotation.status]}
                </span>
              </div>
              {preparedBy ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    {labels.preparedBy}
                  </span>
                  <span style={{ fontWeight: 600 }}>{preparedBy}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "36px" }}>#</th>
              <th style={thStyle}>{labels.item}</th>
              <th style={{ ...thStyle, textAlign: "center", width: "56px" }}>
                {labels.qty}
              </th>
              <th
                style={{
                  ...thStyle,
                  textAlign: dir === "rtl" ? "left" : "right",
                  width: "96px",
                }}
              >
                {labels.rate}
              </th>
              <th style={{ ...thStyle, textAlign: "center", width: "64px" }}>
                {labels.hours}
              </th>
              <th
                style={{
                  ...thStyle,
                  textAlign: dir === "rtl" ? "left" : "right",
                  width: "104px",
                }}
              >
                {labels.amount}
              </th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}
                >
                  -
                </td>
              </tr>
            ) : (
              quotation.items.map((item, index) => (
                <LineRow
                  key={item.id}
                  item={item}
                  index={index}
                  formatCurrency={formatCurrency}
                  labels={labels}
                  dir={dir}
                />
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: dir === "rtl" ? "flex-start" : "flex-end",
            marginTop: "8px",
          }}
        >
          <div style={{ width: "280px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              <span>{labels.subtotal}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(total)}
              </span>
            </div>
            {estimatedHours > 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  color: "#64748b",
                  fontSize: "13px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span>{labels.estimatedHours}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {estimatedHours}
                </span>
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 0 0",
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              <span>{labels.total}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#065f46" }}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
            fontSize: "11px",
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          {labels.appName} · {labels.quoteNumber} {shortId}
        </div>
      </div>
    );
  }
);
