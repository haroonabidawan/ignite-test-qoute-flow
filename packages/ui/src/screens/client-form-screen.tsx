"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { VStack } from "../components/ui/vstack";
import { Text } from "../components/ui/text";
import { BackLink } from "../components/layout/app-shell";
import { PageHeader } from "../components/layout/page-header";
import { SectionCard } from "../components/common/section-card";
import { QueryBoundary } from "../components/common/query-boundary";
import { TextAreaField, TextField } from "../components/forms/fields";
import { useClient, useCreateClient, useUpdateClient } from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";
import type { Client } from "@repo/types";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";

export function ClientFormScreen({ clientId }: { clientId?: string }) {
  const { t } = useTranslation();
  const clientQuery = useClient(clientId);
  const existingClient = clientQuery.data;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const navigate = useNavigate();
  const isEdit = Boolean(clientId);
  const [form, setForm] = useState<Omit<Client, "id">>({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [error, setError] = useState<UiMessageState>(null);
  const errorMessage = useResolvedMessage(error);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingClient) {
      const { id: _id, ...rest } = existingClient;
      setForm(rest);
    }
  }, [existingClient]);

  const update = (key: keyof Omit<Client, "id">, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError({ kind: "key", key: "clients.form.nameEmailRequired" });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && clientId) {
        await updateClient.mutateAsync({ id: clientId, data: form });
      } else {
        await createClient.mutateAsync(form);
      }
      navigate("/clients");
    } catch (err) {
      setError({ kind: "api", error: err });
    } finally {
      setSaving(false);
    }
  };

  const isPending = saving || createClient.isPending || updateClient.isPending;

  return (
    <Box>
      <BackLink href="/clients" label={t("clients.form.back")} />
      <PageHeader
        eyebrow={isEdit ? t("clients.form.editEyebrow") : t("clients.form.newEyebrow")}
        title={isEdit ? t("clients.form.editTitle") : t("clients.form.newTitle")}
        description={t("clients.form.description")}
      />

      <QueryBoundary
        isLoading={isEdit && clientQuery.isLoading}
        isError={isEdit && clientQuery.isError}
        onRetry={() => void clientQuery.refetch()}
      >
        <SectionCard
          title={t("clients.form.contactTitle")}
          description={t("clients.form.contactDescription")}
        >
          <VStack space="md">
            <Box className="grid gap-4 md:grid-cols-2">
              <TextField
                label={t("clients.form.fullName")}
                value={form.name}
                onChangeText={(v) => update("name", v)}
                placeholder={t("clients.form.fullNamePlaceholder")}
                required
              />
              <TextField
                label={t("clients.form.company")}
                value={form.company}
                onChangeText={(v) => update("company", v)}
                placeholder={t("clients.form.companyPlaceholder")}
              />
            </Box>
            <Box className="grid gap-4 md:grid-cols-2">
              <TextField
                label={t("clients.form.email")}
                type="email"
                value={form.email}
                onChangeText={(v) => update("email", v)}
                placeholder={t("clients.form.emailPlaceholder")}
                required
              />
              <TextField
                label={t("clients.form.phone")}
                type="tel"
                value={form.phone}
                onChangeText={(v) => update("phone", v)}
                placeholder={t("clients.form.phonePlaceholder")}
              />
            </Box>
            <TextAreaField
              label={t("clients.form.notes")}
              value={form.notes}
              onChangeText={(v) => update("notes", v)}
              placeholder={t("clients.form.notesPlaceholder")}
              hint={t("clients.form.notesHint")}
            />

            {errorMessage ? (
              <Box className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                <Text className="text-sm text-destructive">{errorMessage}</Text>
              </Box>
            ) : null}

            <Box className="flex flex-wrap gap-3 border-t border-border/60 pt-4">
              <Button onPress={handleSave} className="h-10" disabled={isPending}>
                <ButtonText>
                  {isPending ? t("clients.form.saving") : t("clients.form.saveClient")}
                </ButtonText>
              </Button>
              <Button variant="outline" onPress={() => navigate("/clients")}>
                <ButtonText>{t("common.cancel")}</ButtonText>
              </Button>
            </Box>
          </VStack>
        </SectionCard>
      </QueryBoundary>
    </Box>
  );
}
