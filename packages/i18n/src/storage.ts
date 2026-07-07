import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "./types";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ar";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("ar") ? "ar" : DEFAULT_LOCALE;
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isLocale(stored) ? stored : null;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? detectBrowserLocale();
}
