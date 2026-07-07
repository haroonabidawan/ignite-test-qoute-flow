import { Suspense } from "react";
import { ResetPasswordScreen } from "@repo/ui/screens/reset-password";
import { ResetPasswordPageContent } from "./reset-password-page-content";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordScreen token="" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
