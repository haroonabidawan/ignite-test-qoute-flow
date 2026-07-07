"use client";

import { useMemo } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Heading } from "../components/ui/heading";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Text } from "../components/ui/text";
import { Icon, AddIcon } from "../components/ui/icon/index.web";
import { SectionCard } from "../components/common/section-card";
import { QueryBoundary } from "../components/common/query-boundary";
import { StatCard } from "../components/common/stat-card";
import { UserAvatar } from "../components/common/user-avatar";
import { PageHeader } from "../components/layout/page-header";
import { StatusBadge } from "../components/quotation/status-badge";
import { resolveQuotationTotal } from "../lib/calculations";
import { useFormatCurrency, useFormatDate } from "../lib/format";
import { useClientsLookup, useQuotationsLookup } from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";
import type { QuotationStatus } from "@repo/types";

const STATUSES: QuotationStatus[] = ["Draft", "Sent", "Approved", "Rejected"];

export function DashboardScreen() {
  const { t, statusHint } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();
  const quotationsQuery = useQuotationsLookup();
  const clientsQuery = useClientsLookup();
  const quotations = quotationsQuery.data?.items ?? [];
  const clients = clientsQuery.data?.items ?? [];
  const navigate = useNavigate();

  const statusStats = useMemo(() => {
    return STATUSES.map((status) => {
      const quotes = quotations.filter((q) => q.status === status);
      const value = quotes.reduce((sum, q) => sum + resolveQuotationTotal(q), 0);
      return { status, count: quotes.length, value };
    });
  }, [quotations]);

  const summary = useMemo(() => {
    const pipeline = quotations.reduce((sum, q) => sum + resolveQuotationTotal(q), 0);
    return {
      quotations: quotationsQuery.data?.total ?? quotations.length,
      clients: clientsQuery.data?.total ?? clients.length,
      pipeline: formatCurrency(pipeline),
      approved: quotations.filter((q) => q.status === "Approved").length,
    };
  }, [quotations, clients, formatCurrency]);

  const recentQuotations = useMemo(
    () =>
      [...quotations]
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [quotations]
  );

  return (
    <Box>
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <Button onPress={() => navigate("/quotations/new")} className="h-10">
            <Icon as={AddIcon} size="sm" className="text-primary-foreground" />
            <ButtonText>{t("nav.newQuotation")}</ButtonText>
          </Button>
        }
      />

      <QueryBoundary
        isLoading={quotationsQuery.isLoading || clientsQuery.isLoading}
        isError={quotationsQuery.isError || clientsQuery.isError}
        onRetry={() => {
          void quotationsQuery.refetch();
          void clientsQuery.refetch();
        }}
      >
        <Box className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.totalQuotations")}
            value={summary.quotations}
            hint={t("dashboard.totalQuotationsHint")}
          />
          <StatCard
            label={t("dashboard.activeClients")}
            value={summary.clients}
            hint={t("dashboard.activeClientsHint")}
          />
          <StatCard
            label={t("dashboard.approved")}
            value={summary.approved}
            hint={t("dashboard.approvedHint")}
          />
          <StatCard
            label={t("dashboard.pipelineValue")}
            value={summary.pipeline}
            hint={t("dashboard.pipelineValueHint")}
          />
        </Box>

        <Box className="mb-6">
          <Heading size="sm" className="mb-4 text-foreground">
            {t("dashboard.statusBreakdown")}
          </Heading>
          <Box className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusStats.map(({ status, count, value }) => (
              <button
                key={status}
                type="button"
                onClick={() => navigate(`/quotations?status=${status}`)}
                className="ui-surface rounded-xl p-5 text-start transition-colors hover:bg-muted/30"
              >
                <Box className="flex-row items-center justify-between gap-3">
                  <StatusBadge status={status} />
                  <Text className="text-2xl font-semibold tabular-nums text-foreground">
                    {count}
                  </Text>
                </Box>
                <Text className="mt-3 text-sm font-medium tabular-nums text-foreground">
                  {formatCurrency(value)}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  {statusHint(status)}
                </Text>
              </button>
            ))}
          </Box>
        </Box>

        <SectionCard
          title={t("dashboard.recentQuotations")}
          description={t("dashboard.recentQuotationsDesc")}
          action={
            <Button variant="outline" size="sm" onPress={() => navigate("/quotations")}>
              <ButtonText>{t("dashboard.viewAll")}</ButtonText>
            </Button>
          }
        >
          {recentQuotations.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              {t("dashboard.empty")}
            </Text>
          ) : (
            <Card className="overflow-hidden border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>{t("dashboard.table.quotation")}</TableHead>
                    <TableHead>{t("dashboard.table.client")}</TableHead>
                    <TableHead>{t("dashboard.table.status")}</TableHead>
                    <TableHead>{t("dashboard.table.total")}</TableHead>
                    <TableHead>{t("dashboard.table.created")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotations.map((quote) => {
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
                          </button>
                        </TableData>
                        <TableData>
                          {client ? (
                            <Box className="flex-row items-center gap-2">
                              <UserAvatar name={client.name} size="sm" />
                              <Box>
                                <Text className="text-sm font-medium">
                                  {client.name}
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                  {client.company}
                                </Text>
                              </Box>
                            </Box>
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </SectionCard>
      </QueryBoundary>
    </Box>
  );
}
