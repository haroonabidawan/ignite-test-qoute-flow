export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "quoteflow_locale";

export type MessageValue = string | MessageTree;
export type MessageTree = { [key: string]: MessageValue };

export type TranslateParams = Record<string, string | number>;
