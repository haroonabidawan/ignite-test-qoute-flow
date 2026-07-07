"use client";

import { Box } from "../ui/box";
import { Text } from "../ui/text";
import { getInitials } from "../../lib/format";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export function UserAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Box
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground ring-2 ring-background ${sizes[size]} ${className}`}
    >
      <Text className="font-semibold text-inherit">{getInitials(name)}</Text>
    </Box>
  );
}
