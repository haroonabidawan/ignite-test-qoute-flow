import { arMessages } from "./ar";
import { enMessages } from "./en";
import type { Locale } from "../types";

export const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  ar: arMessages,
};
