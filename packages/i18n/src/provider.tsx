"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@repo/api";
import type { QuotationStatus } from "@repo/types";
import { messagesByLocale } from "./locales";
import { getDir, getIntlLocale } from "./rtl";
import { resolveInitialLocale, writeStoredLocale } from "./storage";
import { createTranslator, translateApiErrorCode } from "./translate";
import type { Locale, TranslateParams } from "./types";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  intlLocale: string;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
  statusLabel: (status: QuotationStatus) => string;
  statusHint: (status: QuotationStatus) => string;
  translateError: (error: unknown, fallbackKey?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function syncDocument(locale: Locale, dir: "ltr" | "rtl") {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE_SAFE);

  useEffect(() => {
    setLocaleState(resolveInitialLocale());
  }, []);

  const dir = getDir(locale);
  const intlLocale = getIntlLocale(locale);

  useEffect(() => {
    syncDocument(locale, dir);
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => {
    writeStoredLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = createTranslator(messagesByLocale[locale]);

    return {
      locale,
      dir,
      intlLocale,
      setLocale,
      t,
      statusLabel: (status) => t(`status.${status}`),
      statusHint: (status) => t(`status.hint.${status}`),
      translateError: (error, fallbackKey = "errors.generic") => {
        const fallback = t(fallbackKey);
        if (error instanceof ApiError && error.code) {
          return translateApiErrorCode(t, error.code, fallback);
        }
        if (error instanceof ApiError) {
          return error.message || fallback;
        }
        if (error instanceof Error && error.message) {
          return error.message;
        }
        return fallback;
      },
    };
  }, [locale, dir, intlLocale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const DEFAULT_LOCALE_SAFE: Locale = "en";

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir, intlLocale, setLocale, statusLabel, statusHint } = useI18n();
  return { t, locale, dir, intlLocale, setLocale, statusLabel, statusHint };
}
