"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Text } from "../components/ui/text";
import { HStack } from "../components/ui/hstack";
import { Icon, AddIcon, EditIcon, TrashIcon } from "../components/ui/icon/index.web";
import { EmptyState } from "../components/common/empty-state";
import { PaginationControls } from "../components/common/pagination-controls";
import { QueryBoundary } from "../components/common/query-boundary";
import { StatCard } from "../components/common/stat-card";
import { UserAvatar } from "../components/common/user-avatar";
import { PageHeader } from "../components/layout/page-header";
import { StatusBadge } from "../components/quotation/status-badge";
import { SearchField, SelectField } from "../components/forms/fields";
import { resolveQuotationTotal } from "../lib/calculations";
import { useFormatCurrency, useFormatDate } from "../lib/format";
import {
  useClientsLookup,
  useDeleteQuotation,
  useQuotations,
  useQuotationsLookup,
} from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";
import type { QuotationStatus } from "@repo/types";

const statuses: QuotationStatus[] = ["Draft", "Sent", "Approved", "Rejected"];

export function QuotationsScreen({
  initialStatusFilter = "",
}: {
  initialStatusFilter?: string;
} = {}) {
  const { t, statusLabel } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const quotationsQuery = useQuotations({
    page,
    page_size: 20,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  });
  const clientsQuery = useClientsLookup();
  const summaryQuery = useQuotationsLookup();
  const pageData = quotationsQuery.data;
  const quotations = pageData?.items ?? [];
  const clients = clientsQuery.data?.items ?? [];
  const deleteQuotation = useDeleteQuotation();
  const navigate = useNavigate();

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
    setPage(1);
  }, [initialStatusFilter]);

  const stats = useMemo(() => {
    const allQuotations = summaryQuery.data?.items ?? [];
    const pipeline = allQuotations.reduce(
      (sum, q) => sum + resolveQuotationTotal(q),
      0
    );
    return {
      total: summaryQuery.data?.total ?? allQuotations.length,
      approved: allQuotations.filter((q) => q.status === "Approved").length,
      pipeline: formatCurrency(pipeline),
    };
  }, [summaryQuery.data, formatCurrency]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <Box>
      <PageHeader
        eyebrow={t("quotations.eyebrow")}
        title={t("quotations.title")}
        description={t("quotations.description")}
        actions={
          <Button onPress={() => navigate("/quotations/new")} className="h-10">
            <Icon as={AddIcon} size="sm" className="text-primary-foreground" />
            <ButtonText>{t("quotations.newQuotation")}</ButtonText>
          </Button>
        }
      />

      <QueryBoundary
        isLoading={quotationsQuery.isLoading}
        isError={quotationsQuery.isError}
        onRetry={() => void quotationsQuery.refetch()}
      >
        <Box className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("quotations.openQuotes")}
            value={stats.total}
            hint={t("quotations.allStatuses")}
          />
          <StatCard
            label={t("quotations.approved")}
            value={stats.approved}
            hint={t("quotations.approvedHint")}
          />
          <StatCard
            label={t("quotations.pipelineValue")}
            value={stats.pipeline}
            hint={t("quotations.pipelineValueHint")}
          />
        </Box>

        <Card className="ui-surface mb-6 p-4">
          <Box className="grid gap-4 md:grid-cols-[1fr_220px]">
            <SearchField
              label={t("common.search")}
              value={search}
              onChangeText={handleSearchChange}
              placeholder={t("quotations.searchPlaceholder")}
            />
            <SelectField
              label={t("quotations.statusFilter")}
              value={statusFilter}
              onChange={handleStatusChange}
              placeholder={t("quotations.statusAll")}
              options={statuses.map((s) => ({ label: statusLabel(s), value: s }))}
            />
          </Box>
        </Card>

        {quotations.length === 0 ? (
          <EmptyState
            title={t("quotations.emptyTitle")}
            description={t("quotations.emptyDescription")}
            icon={<Icon as={EditIcon} size="lg" />}
            action={
              <Button onPress={() => navigate("/quotations/new")}>
                <ButtonText>{t("quotations.createQuotation")}</ButtonText>
              </Button>
            }
          />
        ) : (
          <Card className="ui-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>{t("quotations.table.quotation")}</TableHead>
                  <TableHead>{t("quotations.table.client")}</TableHead>
                  <TableHead>{t("quotations.table.status")}</TableHead>
                  <TableHead>{t("quotations.table.total")}</TableHead>
                  <TableHead>{t("quotations.table.created")}</TableHead>
                  <TableHead className="text-end">
                    {t("quotations.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quote) => {
                  const client = clients.find((c) => c.id === quote.clientId);
                  const total = resolveQuotationTotal(quote);
                  return (
                    <TableRow key={quote.id} className="ui-table-row">
                      <TableData>
                        <button
                          type="button"
                          onClick={() => navigate(`/quotations/${quote.id}`)}
                          className="text-start"
                        >
                          <Text className="font-medium text-foreground transition-colors hover:text-primary">
                            {quote.title}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {quote.items.length}{" "}
                            {quote.items.length === 1
                              ? t("common.lineItem")
                              : t("common.lineItems")}
                          </Text>
                        </button>
                      </TableData>
                      <TableData>
                        {client ? (
                          <HStack space="sm" className="items-center">
                            <UserAvatar name={client.name} size="sm" />
                            <Box>
                              <Text className="text-sm font-medium">{client.name}</Text>
                              <Text className="text-xs text-muted-foreground">
                                {client.company}
                              </Text>
                            </Box>
                          </HStack>
                        ) : (
                          t("common.dash")
                        )}
                      </TableData>
                      <TableData>
                        <StatusBadge status={quote.status} />
                      </TableData>
                      <TableData>
                        <Text className="font-medium tabular-nums">
                          {formatCurrency(total)}
                        </Text>
                      </TableData>
                      <TableData>
                        <Text className="text-sm text-muted-foreground">
                          {formatDate(quote.createdAt)}
                        </Text>
                      </TableData>
                      <TableData>
                        <HStack space="xs" className="justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => navigate(`/quotations/${quote.id}`)}
                          >
                            <ButtonText>{t("common.open")}</ButtonText>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onPress={() => {
                              if (
                                window.confirm(
                                  t("quotations.deleteConfirm", {
                                    title: quote.title,
                                  })
                                )
                              ) {
                                deleteQuotation.mutate(quote.id);
                              }
                            }}
                          >
                            <Icon
                              as={TrashIcon}
                              size="sm"
                              className="text-destructive"
                            />
                          </Button>
                        </HStack>
                      </TableData>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pageData ? (
              <PaginationControls
                page={pageData.page}
                totalPages={pageData.totalPages}
                total={pageData.total}
                onPageChange={setPage}
              />
            ) : null}
          </Card>
        )}
      </QueryBoundary>
    </Box>
  );
}
