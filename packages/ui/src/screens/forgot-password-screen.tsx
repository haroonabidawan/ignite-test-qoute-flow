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
import { useRequestPasswordReset } from "@repo/api/hooks";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const requestReset = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<UiMessageState>(null);
  const errorMessage = useResolvedMessage(error);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError({ kind: "key", key: "auth.forgot.emailRequired" });
      return;
    }

    setError(null);
    try {
      await requestReset.mutateAsync(trimmed);
      setSubmitted(true);
    } catch {
      setError({ kind: "key", key: "errors.tryAgain" });
    }
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/70 bg-card p-8 shadow-soft-2">
        <VStack space="lg">
          <VStack space="sm">
            <Heading size="2xl" className="tracking-tight text-foreground">
              {t("auth.forgot.title")}
            </Heading>
            <Text className="text-muted-foreground">{t("auth.forgot.subtitle")}</Text>
          </VStack>

          {submitted ? (
            <VStack space="md">
              <Box className="rounded-lg border border-border/70 bg-muted/30 px-3 py-3">
                <Text className="text-sm text-foreground">
                  {t("auth.forgot.submitted")}
                </Text>
              </Box>
              <AuthCardLink href="/auth/login">
                {t("auth.forgot.backToSignIn")}
              </AuthCardLink>
            </VStack>
          ) : (
            <VStack space="md">
              <TextField
                label={t("auth.forgot.email")}
                type="email"
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.forgot.emailPlaceholder")}
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
                disabled={requestReset.isPending}
              >
                <ButtonText>
                  {requestReset.isPending
                    ? t("auth.forgot.sendingLink")
                    : t("auth.forgot.sendLink")}
                </ButtonText>
              </Button>

              <AuthCardLink href="/auth/login">
                {t("auth.forgot.backToSignIn")}
              </AuthCardLink>
            </VStack>
          )}
        </VStack>
      </Card>
    </AuthShell>
  );
}
