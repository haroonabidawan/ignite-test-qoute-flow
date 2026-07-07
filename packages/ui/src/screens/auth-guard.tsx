"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslation } from "@repo/i18n";
import { useSession } from "@repo/api/hooks";
import { Box } from "../components/ui/box";
import { Spinner } from "../components/ui/spinner";
import { Text } from "../components/ui/text";
import { useNavigate } from "../navigation/navigation-context";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (ready && !user) {
      navigate("/auth/login");
    }
  }, [ready, user, navigate]);

  if (!ready) {
    return (
      <Box className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner size="large" />
        <Text className="text-sm text-muted-foreground">
          {t("auth.sessionLoading")}
        </Text>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
