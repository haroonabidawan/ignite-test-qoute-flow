import type { MessageTree, TranslateParams } from "./types";

function resolvePath(tree: MessageTree, path: string): string | undefined {
  const parts = path.split(".");
  let current: MessageTree | string = tree;

  for (const part of parts) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part] as MessageTree | string;
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function createTranslator(messages: MessageTree) {
  return function translate(key: string, params?: TranslateParams): string {
    const value = resolvePath(messages, key);
    if (!value) {
      return key;
    }
    return interpolate(value, params);
  };
}

export function translateApiErrorCode(
  t: (key: string, params?: TranslateParams) => string,
  code: string | undefined,
  fallback: string
): string {
  if (!code) {
    return fallback;
  }
  const key = `errors.${code}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}
