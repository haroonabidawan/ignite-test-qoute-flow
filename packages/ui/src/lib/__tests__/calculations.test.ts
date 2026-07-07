import { describe, expect, it } from "vitest";
import {
  calculateItemTotal,
  calculateQuotationTotal,
  resolveQuotationTotal,
} from "../calculations";
import { buildQuotationPdfFilename } from "../export-quotation-pdf";
import type { QuotationItem } from "@repo/types";

describe("calculateItemTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateItemTotal(2, 150)).toBe(300);
  });

  it("returns 0 when price is null", () => {
    expect(calculateItemTotal(3, null)).toBe(0);
  });

  it("returns 0 when price is NaN", () => {
    expect(calculateItemTotal(1, Number.NaN)).toBe(0);
  });
});

describe("calculateQuotationTotal", () => {
  it("sums line totals", () => {
    const items: QuotationItem[] = [
      {
        id: "1",
        title: "Design",
        description: "",
        quantity: 2,
        unitPrice: 100,
        estimatedHours: null,
      },
      {
        id: "2",
        title: "TBD",
        description: "",
        quantity: 1,
        unitPrice: null,
        estimatedHours: 5,
      },
    ];
    expect(calculateQuotationTotal(items)).toBe(200);
  });
});

describe("resolveQuotationTotal", () => {
  it("prefers API total when provided", () => {
    expect(
      resolveQuotationTotal({
        total: 999,
        items: [
          {
            id: "1",
            title: "A",
            description: "",
            quantity: 1,
            unitPrice: 10,
            estimatedHours: null,
          },
        ],
      })
    ).toBe(999);
  });

  it("falls back to calculated total", () => {
    expect(
      resolveQuotationTotal({
        items: [
          {
            id: "1",
            title: "A",
            description: "",
            quantity: 2,
            unitPrice: 50,
            estimatedHours: null,
          },
        ],
      })
    ).toBe(100);
  });
});

describe("buildQuotationPdfFilename", () => {
  it("slugifies title and appends short id", () => {
    expect(buildQuotationPdfFilename("Website Redesign!", "abc-def-12345678")).toBe(
      "website-redesign-12345678.pdf"
    );
  });

  it("falls back when title is empty", () => {
    expect(buildQuotationPdfFilename("   ", "quotation-id-abcdef01")).toBe(
      "quotation-abcdef01.pdf"
    );
  });
});
