"use client";

import type { ReactNode } from "react";
import { Box } from "../../components/ui/box";
import { Heading } from "../../components/ui/heading";
import { HStack } from "../../components/ui/hstack";
import { Text } from "../../components/ui/text";
import { VStack } from "../../components/ui/vstack";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <Box className="mb-8 flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <VStack space="sm" className="max-w-2xl">
        {eyebrow ? (
          <Text className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <Heading size="3xl" className="tracking-tight text-foreground">
          {title}
        </Heading>
        {description ? (
          <Text className="text-base leading-relaxed text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </VStack>
      {actions ? (
        <HStack space="sm" className="shrink-0 flex-wrap items-center">
          {actions}
        </HStack>
      ) : null}
    </Box>
  );
}
