"use client";

import type { ReactNode } from "react";
import { Box } from "../../components/ui/box";
import { Heading } from "../../components/ui/heading";
import { Text } from "../../components/ui/text";
import { VStack } from "../../components/ui/vstack";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Box className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-card to-muted/20 px-8 py-16 text-center">
      <VStack space="md" className="max-w-md items-center">
        {icon ? (
          <Box className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-soft-1">
            {icon}
          </Box>
        ) : null}
        <Heading size="lg" className="text-foreground">
          {title}
        </Heading>
        <Text className="leading-relaxed text-muted-foreground">{description}</Text>
        {action ? <Box className="pt-2">{action}</Box> : null}
      </VStack>
    </Box>
  );
}
