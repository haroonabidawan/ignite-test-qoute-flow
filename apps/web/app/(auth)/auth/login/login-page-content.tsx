"use client";

import { useSearchParams } from "next/navigation";
import { LoginScreen } from "@repo/ui/screens/login";

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  return <LoginScreen resetSuccess={resetSuccess} />;
}
