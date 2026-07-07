"use client";

import type { ReactNode } from "react";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`ui-surface overflow-hidden ${className}`}>
      {title ? (
        <Box className="flex-row items-center justify-between gap-3 border-b border-border/60 bg-muted/25 px-6 py-4">
          <Box>
            <Heading size="sm" className="text-foreground">
              {title}
            </Heading>
            {description ? (
              <Text className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </Text>
            ) : null}
          </Box>
          {action}
        </Box>
      ) : null}
      <Box className="p-6">{children}</Box>
    </Card>
  );
}
