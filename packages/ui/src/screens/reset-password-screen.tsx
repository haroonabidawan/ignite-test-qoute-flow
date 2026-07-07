"use client";

import { useState } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { VStack } from "../components/ui/vstack";
import { TextField } from "../components/forms/fields";
import { AuthCardLink } from "../components/layout/auth-card-link";
import { AuthShell } from "../components/layout/auth-shell";
import { useResetPassword } from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";

export function ResetPasswordScreen({ token }: { token: string }) {
  const { t } = useTranslation();
  const resetPassword = useResetPassword();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<UiMessageState>(null);
  const errorMessage = useResolvedMessage(error);

  const handleSubmit = async () => {
    if (!token) {
      setError({ kind: "key", key: "auth.reset.invalidToken" });
      return;
    }
    if (password.length < 8) {
      setError({ kind: "key", key: "auth.reset.passwordMinLength" });
      return;
    }
    if (password !== confirmPassword) {
      setError({ kind: "key", key: "auth.reset.passwordMismatch" });
      return;
    }

    setError(null);
    try {
      const result = await resetPassword.mutateAsync({ token, password });
      if (!result.ok) {
        setError({ kind: "key", key: "auth.reset.unavailable" });
        return;
      }
      navigate("/auth/login?reset=success");
    } catch {
      setError({ kind: "key", key: "errors.tryAgain" });
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <Card className="w-full max-w-md border-border/70 bg-card p-8 shadow-soft-2">
          <VStack space="md">
            <Heading size="2xl" className="tracking-tight text-foreground">
              {t("auth.reset.invalidLinkTitle")}
            </Heading>
            <Text className="text-muted-foreground">
              {t("auth.reset.invalidLinkBody")}
            </Text>
            <AuthCardLink href="/auth/forgot-password">
              {t("auth.reset.requestNewLink")}
            </AuthCardLink>
            <AuthCardLink href="/auth/login">
              {t("auth.reset.backToSignIn")}
            </AuthCardLink>
          </VStack>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/70 bg-card p-8 shadow-soft-2">
        <VStack space="lg">
          <VStack space="sm">
            <Heading size="2xl" className="tracking-tight text-foreground">
              {t("auth.reset.title")}
            </Heading>
            <Text className="text-muted-foreground">{t("auth.reset.subtitle")}</Text>
          </VStack>

          <VStack space="md">
            <TextField
              label={t("auth.reset.newPassword")}
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.reset.newPasswordPlaceholder")}
              required
            />
            <TextField
              label={t("auth.reset.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("auth.reset.confirmPasswordPlaceholder")}
              required
            />

            {errorMessage ? (
              <Box className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                <Text className="text-sm text-destructive">{errorMessage}</Text>
              </Box>
            ) : null}

            <Button
              onPress={handleSubmit}
              className="h-11 w-full"
              disabled={resetPassword.isPending}
            >
              <ButtonText>
                {resetPassword.isPending
                  ? t("auth.reset.updating")
                  : t("auth.reset.updatePassword")}
              </ButtonText>
            </Button>

            <AuthCardLink href="/auth/login">
              {t("auth.reset.backToSignIn")}
            </AuthCardLink>
          </VStack>
        </VStack>
      </Card>
    </AuthShell>
  );
}
