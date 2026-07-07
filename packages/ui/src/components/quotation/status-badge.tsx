"use client";

import type { QuotationStatus } from "@repo/types";
import { useTranslation } from "@repo/i18n";
import { Badge, BadgeText } from "../../components/ui/badge";
import { Box } from "../../components/ui/box";

const statusStyles: Record<
  QuotationStatus,
  { variant: "default" | "secondary" | "destructive" | "outline"; dot: string }
> = {
  Draft: { variant: "outline", dot: "bg-muted-foreground" },
  Sent: { variant: "secondary", dot: "bg-chart-5" },
  Approved: { variant: "default", dot: "bg-primary" },
  Rejected: { variant: "destructive", dot: "bg-destructive" },
};

export function StatusBadge({ status }: { status: QuotationStatus }) {
  const { statusLabel } = useTranslation();
  const style = statusStyles[status];
  return (
    <Badge
      variant={style.variant}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
    >
      <Box className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <BadgeText>{statusLabel(status)}</BadgeText>
    </Badge>
  );
}
