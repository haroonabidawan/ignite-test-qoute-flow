"use client";

import { useCallback, useMemo } from "react";
import { useI18n } from "@repo/i18n";

/** Store errors/messages by key or raw API error - resolved at render for locale changes. */
export type UiMessageState =
  | { kind: "api"; error: unknown; fallbackKey?: string }
  | { kind: "key"; key: string }
  | { kind: "raw"; text: string }
  | null;

export function useTranslateError() {
  const { translateError } = useI18n();
  return useCallback(
    (error: unknown, fallbackKey = "errors.generic") =>
      translateError(error, fallbackKey),
    [translateError]
  );
}

export function useResolvedMessage(
  state: UiMessageState,
  defaultFallback = "errors.generic"
): string {
  const { t, translateError } = useI18n();

  return useMemo(() => {
    if (!state) {
      return "";
    }
    if (state.kind === "key") {
      return t(state.key);
    }
    if (state.kind === "raw") {
      return state.text;
    }
    return translateError(state.error, state.fallbackKey ?? defaultFallback);
  }, [state, t, translateError, defaultFallback]);
}
