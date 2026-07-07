"use client";

import { useSearchParams } from "next/navigation";
import { QuotationsScreen } from "@repo/ui/screens/quotations";

const statuses = ["Draft", "Sent", "Approved", "Rejected"] as const;

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const initialStatusFilter = statuses.includes(
    statusParam as (typeof statuses)[number]
  )
    ? statusParam
    : "";

  return <QuotationsScreen initialStatusFilter={initialStatusFilter} />;
}
