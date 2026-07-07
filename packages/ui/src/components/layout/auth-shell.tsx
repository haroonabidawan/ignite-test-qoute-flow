"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../ui/box";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { QuoteFlowMark } from "../common/quote-flow-mark";
import { LanguageSwitcher } from "../common/language-switcher";

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <Box className="min-h-dvh bg-background lg:grid lg:min-h-dvh lg:grid-cols-2">
      <Box className="relative hidden overflow-hidden ui-sidebar-shell px-12 py-16 lg:flex lg:min-h-dvh lg:flex-col lg:items-center lg:justify-center">
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(5,150,105,0.35),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.28),transparent_50%)]" />
        <Box className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
          <VStack space="xl" className="items-center">
            <VStack space="md" className="items-center">
              <QuoteFlowMark size="xl" />
              <VStack space="xs" className="items-center">
                <Heading size="lg" className="text-sidebar-foreground">
                  {t("common.appName")}
                </Heading>
                <Text className="text-sm text-sidebar-foreground/65">
                  {t("common.tagline")}
                </Text>
              </VStack>
            </VStack>

            <VStack space="lg" className="mt-8 items-center text-center">
              <Heading
                size="3xl"
                className="text-center leading-tight text-sidebar-foreground"
              >
                {t("auth.shell.title")}
              </Heading>
              <Text className="text-justify text-base leading-relaxed text-sidebar-foreground/75">
                {t("auth.shell.description")}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Box>

      <Box className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-8">
        <Box className="absolute end-4 top-4 sm:end-8 sm:top-8">
          <LanguageSwitcher />
        </Box>
        {children}
      </Box>
    </Box>
  );
}
