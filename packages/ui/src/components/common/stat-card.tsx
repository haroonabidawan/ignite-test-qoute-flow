"use client";

import type { ReactNode } from "react";
import { Box } from "../ui/box";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="ui-surface p-5">
      <Box className="flex items-start justify-between gap-3">
        <Box>
          <Text className="text-sm font-medium text-muted-foreground">{label}</Text>
          <Heading size="2xl" className="mt-1 tracking-tight text-foreground">
            {value}
          </Heading>
          {hint ? (
            <Text className="mt-1 text-xs text-muted-foreground">{hint}</Text>
          ) : null}
        </Box>
        {icon ? (
          <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {icon}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}
