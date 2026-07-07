"use client";

import { useEffect, useMemo, useState } from "react";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Heading } from "../components/ui/heading";
import { HStack } from "../components/ui/hstack";
import { Text } from "../components/ui/text";
import { VStack } from "../components/ui/vstack";
import {
  Icon,
  CheckCircleIcon,
  EditIcon,
  StarIcon,
} from "../components/ui/icon/index.web";
import { BackLink } from "../components/layout/app-shell";
import { PageHeader } from "../components/layout/page-header";
import { SectionCard } from "../components/common/section-card";
import {
  SelectField,
  TextAreaField,
  TextField,
  InlineInputField,
} from "../components/forms/fields";
import { ManualItemsEditor } from "../components/quotation/manual-items-editor";
import { createId, useFormatCurrency } from "../lib/format";
import { calculateQuotationTotal } from "../lib/calculations";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";
import {
  useAiUsage,
  useClientsLookup,
  useCreateQuotation,
  useGenerateAiDraft,
} from "@repo/api/hooks";
import { useTranslation } from "@repo/i18n";
import { useNavigate } from "../navigation/navigation-context";
import type { AiDraftResponse, Quotation, QuotationItem } from "@repo/types";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type ComposeMode = {
  value: "manual" | "ai";
  label: string;
  description: string;
  icon: typeof EditIcon;
};

function ComposeModeSelector({
  mode,
  modes,
  onChange,
}: {
  mode: "manual" | "ai";
  modes: ComposeMode[];
  onChange: (mode: "manual" | "ai") => void;
}) {
  const { t } = useTranslation();

  return (
    <Box className="mb-6">
      <Text className="mb-3 text-sm font-medium text-foreground">
        {t("quotations.create.howToStart")}
      </Text>
      <Box className="grid gap-3 sm:grid-cols-2">
        {modes.map(({ value, label, description, icon }) => {
          const selected = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={selected}
              className={`flex w-full flex-row items-start gap-4 rounded-xl border p-4 text-start transition-all ${
                selected
                  ? "border-primary bg-accent/70 shadow-soft-1 ring-2 ring-primary/20"
                  : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <Box
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon
                  as={icon}
                  size="md"
                  className={
                    selected ? "text-primary-foreground" : "text-muted-foreground"
                  }
                />
              </Box>
              <VStack space="xs" className="min-w-0 flex-1">
                <Text
                  className={`text-base font-semibold ${
                    selected ? "text-foreground" : "text-foreground/90"
                  }`}
                >
                  {label}
                </Text>
                <Text className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </Text>
              </VStack>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

function AiDraftReview({
  draft,
  onApply,
  onDiscard,
}: {
  draft: AiDraftResponse;
  onApply: (items: QuotationItem[]) => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState(
    draft.suggested_items.map((item) => ({
      id: createId("item"),
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      estimatedHours: item.estimated_hours,
    }))
  );

  const updateItem = (index: number, patch: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  return (
    <SectionCard
      title={t("quotations.create.reviewTitle")}
      description={draft.summary}
      action={
        <Text className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {draft.project_type}
        </Text>
      }
    >
      <VStack space="lg">
        <Box className="rounded-xl border border-border/70 bg-muted/25 p-4">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            {t("quotations.create.clarifyTitle")}
          </Text>
          <ul className="list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted-foreground">
            {draft.questions_to_ask_client.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Box>

        <Box className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>{t("quotations.create.table.title")}</TableHead>
                <TableHead>{t("quotations.create.table.description")}</TableHead>
                <TableHead>{t("quotations.create.table.qty")}</TableHead>
                <TableHead>{t("quotations.create.table.unitPrice")}</TableHead>
                <TableHead>{t("quotations.create.table.hours")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="ui-table-row">
                  <TableData>
                    <InlineInputField
                      value={item.title}
                      onChangeText={(v) => updateItem(index, { title: v })}
                      className="min-w-[140px]"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      value={item.description}
                      onChangeText={(v) => updateItem(index, { description: v })}
                      className="min-w-[180px]"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={1}
                      value={String(item.quantity)}
                      onChangeText={(v) =>
                        updateItem(index, {
                          quantity: Number(v) || 1,
                        })
                      }
                      className="w-20"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice === null ? "" : String(item.unitPrice)}
                      placeholder={t("common.tbd")}
                      onChangeText={(v) =>
                        updateItem(index, {
                          unitPrice: v === "" ? null : Number(v),
                        })
                      }
                      className="w-24"
                    />
                  </TableData>
                  <TableData>
                    <InlineInputField
                      type="number"
                      min={0}
                      value={
                        item.estimatedHours === null ? "" : String(item.estimatedHours)
                      }
                      placeholder={t("common.dash")}
                      onChangeText={(v) =>
                        updateItem(index, {
                          estimatedHours: v === "" ? null : Number(v),
                        })
                      }
                      className="w-20"
                    />
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <HStack space="sm">
          <Button onPress={() => onApply(items)}>
            <ButtonText>{t("quotations.create.addItems")}</ButtonText>
          </Button>
          <Button variant="outline" onPress={onDiscard}>
            <ButtonText>{t("quotations.create.discardDraft")}</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SectionCard>
  );
}

export function QuotationCreateScreen() {
  const { t, locale } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const { data: clientsPage } = useClientsLookup();
  const clients = clientsPage?.items ?? [];
  const { data: aiUsage } = useAiUsage();
  const createQuotation = useCreateQuotation();
  const generateAiDraft = useGenerateAiDraft();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [form, setForm] = useState<Omit<Quotation, "id">>({
    clientId: "",
    title: "",
    status: "Draft",
    createdAt: new Date().toISOString(),
    items: [],
  });
  const [aiRequest, setAiRequest] = useState("");
  const [aiDraft, setAiDraft] = useState<AiDraftResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<UiMessageState>(null);
  const errorMessage = useResolvedMessage(error);
  const [pendingItems, setPendingItems] = useState<QuotationItem[]>([]);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    const serverCooldown = aiUsage?.seconds_until_next_request ?? 0;
    if (serverCooldown <= 0) {
      setCooldownSeconds(0);
      return;
    }

    setCooldownSeconds(serverCooldown);
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [aiUsage?.seconds_until_next_request]);

  const composeModes = useMemo<ComposeMode[]>(
    () => [
      {
        value: "manual",
        label: t("quotations.create.manual.label"),
        description: t("quotations.create.manual.description"),
        icon: EditIcon,
      },
      {
        value: "ai",
        label: t("quotations.create.ai.label"),
        description: t("quotations.create.ai.description"),
        icon: StarIcon,
      },
    ],
    [t]
  );

  const clientOptions = clients.map((c) => ({
    label: `${c.name} - ${c.company}`,
    value: c.id,
  }));

  useEffect(() => {
    if (!form.clientId && clients[0]?.id) {
      setForm((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients, form.clientId]);

  const validPendingItems = useMemo(
    () => pendingItems.filter((item) => item.title.trim()),
    [pendingItems]
  );

  const canCreate =
    Boolean(form.clientId) &&
    form.title.trim().length > 0 &&
    (mode === "manual" || validPendingItems.length > 0);

  const aiBlocked = Boolean(
    aiUsage &&
    (aiUsage.hourly_remaining <= 0 ||
      aiUsage.daily_remaining <= 0 ||
      cooldownSeconds > 0)
  );

  const aiUsageHint = useMemo(() => {
    if (!aiUsage) return null;
    if (aiUsage.hourly_remaining <= 0 || aiUsage.daily_remaining <= 0) {
      return t("quotations.create.ai.limitReached");
    }
    if (cooldownSeconds > 0) {
      return t("quotations.create.ai.cooldownHint", {
        seconds: cooldownSeconds,
      });
    }
    return t("quotations.create.ai.usageSummary", {
      hourlyRemaining: aiUsage.hourly_remaining,
      hourlyLimit: aiUsage.hourly_limit,
      dailyRemaining: aiUsage.daily_remaining,
      dailyLimit: aiUsage.daily_limit,
    });
  }, [aiUsage, cooldownSeconds, t]);

  const handleGenerateAi = async () => {
    if (!aiRequest.trim()) return;
    setError(null);
    try {
      const draft = await generateAiDraft.mutateAsync({
        request: aiRequest.trim(),
        locale,
      });
      setAiDraft(draft);
    } catch (err) {
      setError({ kind: "api", error: err });
    }
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    setError(null);
    try {
      const validItems = validPendingItems;
      const quotation = await createQuotation.mutateAsync({
        ...form,
        items: validItems,
      });
      navigate(`/quotations/${quotation.id}`);
    } catch (err) {
      setError({ kind: "api", error: err });
    } finally {
      setCreating(false);
    }
  };

  const handleModeChange = (next: "manual" | "ai") => {
    setMode(next);
    setError(null);
    if (next === "manual") {
      setAiDraft(null);
      setAiRequest("");
    }
  };

  const lineItemsLabel =
    mode === "manual"
      ? t("quotations.create.lineItems")
      : t("quotations.create.aiItems");

  const createTotal = useMemo(
    () => calculateQuotationTotal(validPendingItems),
    [validPendingItems]
  );

  const modeDescription =
    mode === "ai"
      ? t("quotations.create.ai.summary")
      : t("quotations.create.manual.summary");

  const modeLabel =
    mode === "ai"
      ? t("quotations.create.ai.label")
      : t("quotations.create.manual.label");

  return (
    <Box>
      <BackLink href="/quotations" label={t("quotations.create.back")} />
      <PageHeader
        eyebrow={t("quotations.create.eyebrow")}
        title={t("quotations.create.title")}
        description={modeDescription}
      />

      <ComposeModeSelector
        mode={mode}
        modes={composeModes}
        onChange={handleModeChange}
      />

      <Box className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <VStack space="md">
          <SectionCard
            title={t("quotations.create.basicsTitle")}
            description={t("quotations.create.basicsDescription")}
          >
            <VStack space="md">
              <SelectField
                label={t("quotations.detail.client")}
                value={form.clientId}
                onChange={(v) => setForm((prev) => ({ ...prev, clientId: v }))}
                options={clientOptions}
              />
              <TextField
                label={t("quotations.create.titleLabel")}
                value={form.title}
                onChangeText={(v) => setForm((prev) => ({ ...prev, title: v }))}
                placeholder={t("quotations.create.titlePlaceholder")}
                required
                hint={t("quotations.create.titleHint")}
              />
            </VStack>
          </SectionCard>

          {mode === "ai" && !aiDraft && validPendingItems.length === 0 ? (
            <SectionCard
              title={t("quotations.create.ai.briefTitle")}
              description={t("quotations.create.ai.briefDescription")}
            >
              <VStack space="md">
                <TextAreaField
                  label={t("quotations.create.ai.requestLabel")}
                  value={aiRequest}
                  onChangeText={setAiRequest}
                  rows={6}
                  placeholder={t("quotations.create.ai.requestPlaceholder")}
                  maxLength={aiUsage?.max_request_chars ?? 4000}
                />
                {aiUsageHint ? (
                  <Text className="text-sm text-muted-foreground">{aiUsageHint}</Text>
                ) : null}
                <Button
                  onPress={handleGenerateAi}
                  disabled={generateAiDraft.isPending || aiBlocked || !aiRequest.trim()}
                >
                  <ButtonText>
                    {generateAiDraft.isPending
                      ? t("quotations.create.ai.generatingDraft")
                      : t("quotations.create.ai.generateDraft")}
                  </ButtonText>
                </Button>
              </VStack>
            </SectionCard>
          ) : null}

          {aiDraft ? (
            <AiDraftReview
              draft={aiDraft}
              onApply={(items) => {
                setPendingItems(items);
                setAiDraft(null);
              }}
              onDiscard={() => setAiDraft(null)}
            />
          ) : null}

          {mode === "manual" ||
          (mode === "ai" && pendingItems.length > 0 && !aiDraft) ? (
            <ManualItemsEditor
              items={pendingItems}
              onChange={setPendingItems}
              title={mode === "ai" ? t("quotations.create.ai.itemsTitle") : undefined}
              description={
                mode === "ai" ? t("quotations.create.ai.itemsDescription") : undefined
              }
            />
          ) : null}
        </VStack>

        <VStack space="md" className="lg:sticky lg:top-6 lg:self-start">
          <Card className="ui-surface p-5">
            <VStack space="md">
              <Heading size="sm" className="text-foreground">
                {t("quotations.create.summary")}
              </Heading>
              <Box className="space-y-3 text-sm">
                <Box className="flex justify-between gap-4">
                  <Text className="text-muted-foreground">
                    {t("quotations.create.mode")}
                  </Text>
                  <Text className="font-medium">{modeLabel}</Text>
                </Box>
                <Box className="flex justify-between gap-4">
                  <Text className="text-muted-foreground">{lineItemsLabel}</Text>
                  <Text className="font-medium tabular-nums">
                    {pendingItems.length}
                  </Text>
                </Box>
                <Box className="flex justify-between gap-4">
                  <Text className="text-muted-foreground">{t("common.total")}</Text>
                  <Text className="font-semibold tabular-nums">
                    {createTotal > 0 ? formatCurrency(createTotal) : t("common.dash")}
                  </Text>
                </Box>
              </Box>

              {pendingItems.length > 0 ? (
                <Box className="rounded-lg border border-primary/20 bg-accent/60 p-3">
                  <HStack space="sm" className="items-start">
                    <Icon as={CheckCircleIcon} size="sm" className="text-primary" />
                    <Text className="text-sm text-foreground">
                      {t("quotations.create.itemsReady", {
                        count: pendingItems.length,
                      })}
                    </Text>
                  </HStack>
                </Box>
              ) : mode === "ai" ? (
                <Box className="rounded-lg border border-dashed border-border p-3">
                  <Text className="text-sm text-muted-foreground">
                    {aiDraft
                      ? t("quotations.create.ai.reviewHint")
                      : t("quotations.create.ai.draftHint")}
                  </Text>
                </Box>
              ) : null}

              {mode === "ai" ? (
                <Box className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <HStack space="sm" className="items-start">
                    <Icon
                      as={StarIcon}
                      size="sm"
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <Text className="text-sm leading-relaxed text-muted-foreground">
                      {t("quotations.create.ai.disclaimer")}
                    </Text>
                  </HStack>
                </Box>
              ) : null}

              <VStack space="sm" className="pt-2">
                {errorMessage ? (
                  <Box className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                    <Text className="text-sm text-destructive">{errorMessage}</Text>
                  </Box>
                ) : null}
                <Button
                  onPress={handleCreate}
                  className="h-10 w-full"
                  disabled={creating || !canCreate}
                >
                  <ButtonText>
                    {creating
                      ? t("quotations.create.creating")
                      : t("quotations.create.createQuotation")}
                  </ButtonText>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => navigate("/quotations")}
                >
                  <ButtonText>{t("common.cancel")}</ButtonText>
                </Button>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
