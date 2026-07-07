import type { Locale } from "./types";

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export function getIntlLocale(locale: Locale): string {
  return locale === "ar" ? "ar-SA" : "en-US";
}
