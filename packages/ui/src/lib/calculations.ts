import type { Quotation, QuotationItem } from "@repo/types";

export function calculateItemTotal(quantity: number, unitPrice: number | null): number {
  if (unitPrice === null || Number.isNaN(unitPrice)) {
    return 0;
  }
  return quantity * unitPrice;
}

export function calculateQuotationTotal(items: QuotationItem[]): number {
  return items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.unitPrice),
    0
  );
}

/** Prefer API total when present; fall back to client-side sum. */
export function resolveQuotationTotal(
  quotation: Pick<Quotation, "total" | "items">
): number {
  if (quotation.total !== undefined) {
    return quotation.total;
  }
  return calculateQuotationTotal(quotation.items);
}
