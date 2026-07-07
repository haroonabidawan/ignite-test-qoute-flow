"use client";

import { AuthGuard } from "@repo/ui/screens/auth-guard";
import { AppShell } from "@repo/ui/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
