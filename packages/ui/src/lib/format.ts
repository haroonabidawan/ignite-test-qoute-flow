"use client";

import { useMemo } from "react";
import { useTranslation } from "@repo/i18n";
import { useAppConfig } from "@repo/api/hooks";

const FALLBACK_CURRENCY_CODE = "USD";

export function useFormatCurrency() {
  const { intlLocale } = useTranslation();
  const { data: config } = useAppConfig();
  const currencyCode = config?.currency_code ?? FALLBACK_CURRENCY_CODE;

  return useMemo(() => {
    const formatter = new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currencyCode,
    });
    return (amount: number) => formatter.format(amount);
  }, [intlLocale, currencyCode]);
}

export function useFormatDate() {
  const { intlLocale } = useTranslation();

  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, {
      dateStyle: "medium",
    });
    return (iso: string) => formatter.format(new Date(iso));
  }, [intlLocale]);
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
