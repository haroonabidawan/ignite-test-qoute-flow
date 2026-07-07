import { Suspense } from "react";
import { LoginScreen } from "@repo/ui/screens/login";
import { LoginPageContent } from "./login-page-content";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginScreen />}>
      <LoginPageContent />
    </Suspense>
  );
}
