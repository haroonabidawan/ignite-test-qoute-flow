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
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Icon,
  AddIcon,
  CheckCircleIcon,
  TrashIcon,
} from "../components/ui/icon/index.web";
import { BackLink } from "../components/layout/app-shell";
import { PageHeader } from "../components/layout/page-header";
import { UserAvatar } from "../components/common/user-avatar";
import { QueryBoundary } from "../components/common/query-boundary";
import { InlineInputField, SelectField, TextField } from "../components/forms/fields";
import { StatusBadge } from "../components/quotation/status-badge";
import { calculateItemTotal, calculateQuotationTotal } from "../lib/calculations";
import { useFormatCurrency, useFormatDate } from "../lib/format";
import { useResolvedMessage, type UiMessageState } from "../lib/errors";
import {
  useAddQuotationItem,
  useApproveQuotation,
  useClient,
  useClientsLookup,
  useDeleteQuotation,
  useQuotation,
  useUpdateQuotation,
} from "@repo/api/hooks";
import { useTranslation } from "@repo/i18n";
import { useNavigate } from "../navigation/navigation-context";
import type { QuotationItem, QuotationStatus } from "@repo/types";

const editableStatuses: QuotationStatus[] = ["Draft", "Sent", "Rejected"];

export function QuotationDetailScreen({ quotationId }: { quotationId: string }) {
  const { t, statusLabel } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();
  const quotationQuery = useQuotation(quotationId);
  const quotation = quotationQuery.data;
  const { data: clientsPage } = useClientsLookup();
  const clients = clientsPage?.items ?? [];
  const updateQuotation = useUpdateQuotation();
  const addQuotationItem = useAddQuotationItem();
  const deleteQuotation = useDeleteQuotation();
  const approveQuotation = useApproveQuotation();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<QuotationStatus>("Draft");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [saveMessage, setSaveMessage] = useState<UiMessageState>(null);
  const saveMessageText = useResolvedMessage(saveMessage);
  const [approving, setApproving] = useState(false);
  const [approveMessage, setApproveMessage] = useState<UiMessageState>(null);
  const approveMessageText = useResolvedMessage(approveMessage);

  useEffect(() => {
    if (quotation) {
      setTitle(quotation.title);
      setClientId(quotation.clientId);
      setStatus(quotation.status);
      setItems(quotation.items);
    }
  }, [quotation]);

  const client = useClient(clientId || undefined).data;

  const total = useMemo(() => calculateQuotationTotal(items), [items]);

  const estimatedHours = useMemo(
    () => items.reduce((sum, item) => sum + (item.estimatedHours ?? 0), 0),
    [items]
  );

  if (!quotation) {
    return (
      <Box>
        <BackLink href="/quotations" label={t("quotations.back")} />
        <QueryBoundary
          isLoading={quotationQuery.isLoading}
          isError={quotationQuery.isError}
          onRetry={() => void quotationQuery.refetch()}
          notFound={
            !quotationQuery.isLoading &&
            !quotationQuery.isError &&
            quotation === undefined
          }
          notFoundTitle={t("quotations.notFound")}
          notFoundAction={
            <Button variant="outline" onPress={() => navigate("/quotations")}>
              <ButtonText>{t("quotations.back")}</ButtonText>
            </Button>
          }
        >
          <Box />
        </QueryBoundary>
      </Box>
    );
  }

  const clientOptions = clients.map((c) => ({
    label: `${c.name} - ${c.company}`,
    value: c.id,
  }));

  const updateItem = (itemId: string, patch: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
    setSaveMessage(null);
  };

  const addItem = async () => {
    setAddingItem(true);
    setSaveMessage(null);
    try {
      const item = await addQuotationItem.mutateAsync({
        quotationId,
        item: {
          title: t("quotations.detail.newItem"),
          description: "",
          quantity: 1,
          unitPrice: null,
          estimatedHours: null,
        },
      });
      setItems((prev) => [...prev, item]);
    } catch (err) {
      setSaveMessage({ kind: "api", error: err });
    } finally {
      setAddingItem(false);
    }
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !clientId) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const validItems = items.filter((item) => item.title.trim());
      await updateQuotation.mutateAsync({
        id: quotationId,
        data: {
          title: title.trim(),
          clientId,
          ...(quotation.status !== "Approved" ? { status } : {}),
          items: validItems,
        },
      });
      setItems(validItems);
      setSaveMessage({ kind: "key", key: "quotations.saved" });
    } catch (err) {
      setSaveMessage({ kind: "api", error: err });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setApproveMessage(null);
    try {
      const result = await approveQuotation.mutateAsync(quotationId);
      setStatus("Approved");
      setApproveMessage({ kind: "raw", text: result.message });
    } catch (err) {
      setApproveMessage({ kind: "api", error: err });
    } finally {
      setApproving(false);
    }
  };

  return (
    <Box>
      <BackLink href="/quotations" label={t("quotations.back")} />
      <PageHeader
        eyebrow={t("quotations.detail.eyebrow")}
        title={title || t("quotations.untitled")}
        description={t("quotations.created", {
          date: formatDate(quotation.createdAt),
        })}
        actions={
          <HStack space="sm" className="flex-wrap items-center">
            <Button
              variant="outline"
              onPress={() => navigate(`/quotations/${quotationId}/preview`)}
            >
              <ButtonText>{t("preview.openPreview")}</ButtonText>
            </Button>
            <StatusBadge status={status} />
          </HStack>
        }
      />

      <Box className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="ui-surface overflow-hidden">
          <Box className="border-b border-border/60 bg-muted/20 px-6 py-5">
            <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label={t("quotations.detail.title")}
                value={title}
                onChangeText={setTitle}
                required
              />
              <SelectField
                label={t("quotations.detail.client")}
                value={clientId}
                onChange={setClientId}
                options={clientOptions}
              />
              {quotation.status === "Approved" ? (
                <Box>
                  <Text className="mb-2 text-sm font-medium text-foreground">
                    {t("quotations.detail.status")}
                  </Text>
                  <Box className="rounded-lg border border-border/70 bg-background px-3 py-2.5">
                    <StatusBadge status="Approved" />
                  </Box>
                </Box>
              ) : (
                <SelectField
                  label={t("quotations.detail.status")}
                  value={status}
                  onChange={(value) => setStatus(value as QuotationStatus)}
                  options={editableStatuses.map((s) => ({
                    label: statusLabel(s),
                    value: s,
                  }))}
                />
              )}
              <Box>
                <Text className="mb-2 text-sm font-medium text-foreground">
                  {t("quotations.detail.quoteDate")}
                </Text>
                <Text className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm text-muted-foreground">
                  {formatDate(quotation.createdAt)}
                </Text>
              </Box>
            </Box>
          </Box>

          <Box className="border-b border-border/60 px-6 py-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("quotations.detail.billTo")}
            </Text>
            {client ? (
              <VStack space="xs" className="mt-2">
                <Text className="font-medium text-foreground">{client.name}</Text>
                <Text className="text-sm text-muted-foreground">{client.company}</Text>
                {client.email ? (
                  <Text className="text-sm text-muted-foreground">{client.email}</Text>
                ) : null}
              </VStack>
            ) : (
              <Text className="mt-2 text-sm text-muted-foreground">
                {t("quotations.detail.selectClient")}
              </Text>
            )}
          </Box>

          <Box className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="min-w-[220px]">
                    {t("quotations.detail.itemDescription")}
                  </TableHead>
                  <TableHead className="w-24">{t("quotations.detail.qty")}</TableHead>
                  <TableHead className="w-32">{t("quotations.detail.rate")}</TableHead>
                  <TableHead className="w-24">{t("quotations.detail.hours")}</TableHead>
                  <TableHead className="w-32 text-end">
                    {t("quotations.detail.amount")}
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableData>
                      <Text className="py-6 text-center text-sm text-muted-foreground">
                        {t("quotations.detail.noLineItems")}
                      </Text>
                    </TableData>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={item.id} className="ui-table-row align-top">
                      <TableData className="pt-4 text-sm text-muted-foreground">
                        {index + 1}
                      </TableData>
                      <TableData>
                        <VStack space="xs">
                          <InlineInputField
                            value={item.title}
                            onChangeText={(value) =>
                              updateItem(item.id, { title: value })
                            }
                            placeholder={t("quotations.detail.itemName")}
                            className="w-full min-w-[180px]"
                          />
                          <InlineInputField
                            value={item.description}
                            onChangeText={(value) =>
                              updateItem(item.id, { description: value })
                            }
                            placeholder={t("quotations.detail.descriptionOptional")}
                            className="w-full min-w-[180px]"
                          />
                        </VStack>
                      </TableData>
                      <TableData className="pt-3">
                        <InlineInputField
                          type="number"
                          min={0}
                          value={String(item.quantity)}
                          onChangeText={(value) => {
                            const parsed = Number(value);
                            updateItem(item.id, {
                              quantity: Number.isNaN(parsed) ? 1 : parsed,
                            });
                          }}
                        />
                      </TableData>
                      <TableData className="pt-3">
                        <InlineInputField
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice === null ? "" : String(item.unitPrice)}
                          onChangeText={(value) => {
                            if (value === "") {
                              updateItem(item.id, { unitPrice: null });
                              return;
                            }
                            const parsed = Number(value);
                            updateItem(item.id, {
                              unitPrice: Number.isNaN(parsed) ? null : parsed,
                            });
                          }}
                          placeholder={t("common.tbd")}
                        />
                      </TableData>
                      <TableData className="pt-3">
                        <InlineInputField
                          type="number"
                          min={0}
                          step="0.5"
                          value={
                            item.estimatedHours === null
                              ? ""
                              : String(item.estimatedHours)
                          }
                          onChangeText={(value) => {
                            if (value === "") {
                              updateItem(item.id, { estimatedHours: null });
                              return;
                            }
                            const parsed = Number(value);
                            updateItem(item.id, {
                              estimatedHours: Number.isNaN(parsed) ? null : parsed,
                            });
                          }}
                          placeholder={t("common.dash")}
                        />
                      </TableData>
                      <TableData className="pt-4 text-end tabular-nums font-medium">
                        {formatCurrency(
                          calculateItemTotal(item.quantity, item.unitPrice)
                        )}
                      </TableData>
                      <TableData className="pt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => removeItem(item.id)}
                          aria-label={t("quotations.detail.removeLineItem")}
                        >
                          <Icon as={TrashIcon} size="sm" className="text-destructive" />
                        </Button>
                      </TableData>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <Box className="flex flex-col gap-4 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              size="sm"
              variant="outline"
              onPress={() => void addItem()}
              disabled={addingItem}
            >
              <Icon as={AddIcon} size="sm" />
              <ButtonText>
                {addingItem
                  ? t("quotations.detail.addingLine")
                  : t("quotations.detail.addLine")}
              </ButtonText>
            </Button>
            <Box className="text-end">
              <Text className="text-sm text-muted-foreground">{t("common.total")}</Text>
              <Heading size="xl" className="tabular-nums tracking-tight">
                {formatCurrency(total)}
              </Heading>
            </Box>
          </Box>

          <HStack
            space="sm"
            className="flex-wrap border-t border-border/60 bg-muted/10 px-6 py-4"
          >
            <Button onPress={handleSave} disabled={saving}>
              <ButtonText>
                {saving
                  ? t("quotations.detail.saving")
                  : t("quotations.detail.saveQuotation")}
              </ButtonText>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                if (
                  window.confirm(
                    t("quotations.deleteConfirm", { title: quotation.title })
                  )
                ) {
                  void deleteQuotation
                    .mutateAsync(quotationId)
                    .then(() => navigate("/quotations"));
                }
              }}
            >
              <Icon as={TrashIcon} size="sm" className="text-white" />
              <ButtonText>{t("common.delete")}</ButtonText>
            </Button>
            {saveMessageText ? (
              <Text className="text-sm text-muted-foreground">{saveMessageText}</Text>
            ) : null}
          </HStack>
        </Card>

        <VStack space="md">
          <Card className="ui-surface sticky top-6 p-5">
            <VStack space="md">
              {client ? (
                <HStack space="sm" className="items-center">
                  <UserAvatar name={client.name} />
                  <Box>
                    <Text className="font-medium">{client.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {client.company}
                    </Text>
                  </Box>
                </HStack>
              ) : null}

              <Box className="ui-success-surface mt-1 rounded-xl px-4 py-3">
                <Text className="text-sm text-accent-foreground">
                  {t("quotations.detail.grandTotal")}
                </Text>
                <Heading
                  size="3xl"
                  className="mt-1 tracking-tight tabular-nums text-accent-foreground"
                >
                  {formatCurrency(total)}
                </Heading>
              </Box>

              <Box className="grid grid-cols-2 gap-3 text-sm">
                <Box className="rounded-xl border border-border/70 bg-muted p-3">
                  <Text className="text-muted-foreground">
                    {t("quotations.detail.lineItems")}
                  </Text>
                  <Text className="mt-1 font-semibold tabular-nums">
                    {items.length}
                  </Text>
                </Box>
                <Box className="rounded-xl border border-border/70 bg-muted p-3">
                  <Text className="text-muted-foreground">
                    {t("quotations.detail.estHours")}
                  </Text>
                  <Text className="mt-1 font-semibold tabular-nums">
                    {estimatedHours || t("common.dash")}
                  </Text>
                </Box>
              </Box>

              {status !== "Approved" ? (
                <Button
                  onPress={handleApprove}
                  disabled={approving}
                  className="h-11 w-full"
                >
                  <ButtonText>
                    {approving
                      ? t("quotations.detail.approving")
                      : t("quotations.detail.approveNotify")}
                  </ButtonText>
                </Button>
              ) : (
                <Box className="ui-success-surface flex items-center gap-2 px-3 py-2.5">
                  <Icon as={CheckCircleIcon} size="sm" className="text-primary" />
                  <Text className="text-sm font-medium text-accent-foreground">
                    {t("quotations.detail.approved")}
                  </Text>
                </Box>
              )}

              {approveMessageText ? (
                <Text className="text-sm text-primary">{approveMessageText}</Text>
              ) : null}
            </VStack>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
}
