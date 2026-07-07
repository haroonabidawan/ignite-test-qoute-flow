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
import { useLogin } from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";

export function LoginScreen({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<UiMessageState>(null);
  const errorMessage = useResolvedMessage(error, "auth.login.invalidCredentials");

  const handleSubmit = async () => {
    setError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError({
        kind: "api",
        error: err,
        fallbackKey: "auth.login.invalidCredentials",
      });
    }
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-lg border-border/70 bg-card p-10 shadow-soft-2">
        <VStack space="xl">
          <VStack space="sm">
            <Heading size="2xl" className="tracking-tight text-foreground">
              {t("auth.login.title")}
            </Heading>
            <Text className="text-muted-foreground">{t("auth.login.subtitle")}</Text>
          </VStack>

          <VStack space="md">
            {resetSuccess ? (
              <Box className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                <Text className="text-sm text-foreground">
                  {t("auth.login.resetSuccess")}
                </Text>
              </Box>
            ) : null}

            <TextField
              label={t("auth.login.email")}
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.login.emailPlaceholder")}
              required
            />
            <TextField
              label={t("auth.login.password")}
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.login.passwordPlaceholder")}
              required
            />
            <Box className="flex-row justify-end">
              <AuthCardLink href="/auth/forgot-password">
                {t("auth.login.forgotPassword")}
              </AuthCardLink>
            </Box>

            {errorMessage ? (
              <Box className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                <Text className="text-sm text-destructive">{errorMessage}</Text>
              </Box>
            ) : null}

            <Button
              onPress={handleSubmit}
              className="h-11 w-full"
              disabled={loginMutation.isPending}
            >
              <ButtonText>
                {loginMutation.isPending
                  ? t("auth.login.signingIn")
                  : t("auth.login.signIn")}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Card>
    </AuthShell>
  );
}
