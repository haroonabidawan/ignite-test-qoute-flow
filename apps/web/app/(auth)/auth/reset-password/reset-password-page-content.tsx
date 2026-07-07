"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordScreen } from "@repo/ui/screens/reset-password";

export function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <ResetPasswordScreen token={token} />;
}
