"use client";

import { Button, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { useTranslation, type Locale } from "@repo/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <HStack space="xs" className="items-center">
      {(["en", "ar"] as Locale[]).map((value) => {
        const active = locale === value;
        const shortLabel = value.toUpperCase();
        const fullLabel = value === "en" ? t("common.english") : t("common.arabic");
        return (
          <Button
            key={value}
            size="xs"
            variant={active ? "default" : "outline"}
            onPress={() => setLocale(value)}
            aria-pressed={active}
            aria-label={`${t("common.language")}: ${fullLabel}`}
            className={
              active
                ? "h-7 min-w-[2.25rem] px-2"
                : "h-7 min-w-[2.25rem] border-sidebar-border px-2 text-sidebar-foreground/60 hover:border-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }
          >
            <ButtonText className="text-[11px] font-semibold tracking-wide">
              {shortLabel}
            </ButtonText>
          </Button>
        );
      })}
    </HStack>
  );
}
