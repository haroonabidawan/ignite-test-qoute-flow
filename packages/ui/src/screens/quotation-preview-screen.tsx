"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@repo/i18n";
import { useClient, useQuotation, useSession } from "@repo/api/hooks";
import { Box } from "../components/ui/box";
import { Button, ButtonText } from "../components/ui/button";
import { HStack } from "../components/ui/hstack";
import { Text } from "../components/ui/text";
import { BackLink } from "../components/layout/app-shell";
import { PageHeader } from "../components/layout/page-header";
import { QueryBoundary } from "../components/common/query-boundary";
import {
  QuotationDocument,
  type QuotationDocumentLabels,
} from "../components/quotation/quotation-document";
import {
  buildQuotationPdfFilename,
  exportQuotationPdf,
} from "../lib/export-quotation-pdf";
import { useFormatCurrency, useFormatDate } from "../lib/format";
import { useNavigate } from "../navigation/navigation-context";
import type { QuotationStatus } from "@repo/types";

export function QuotationPreviewScreen({ quotationId }: { quotationId: string }) {
  const { t, dir, statusLabel } = useTranslation();
  const quotationQuery = useQuotation(quotationId);
  const quotation = quotationQuery.data;
  const { data: client } = useClient(quotation?.clientId);
  const { user } = useSession();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();
  const navigate = useNavigate();
  const documentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const labels = useMemo<QuotationDocumentLabels>(
    () => ({
      appName: t("common.appName"),
      quotation: t("preview.document.quotation"),
      quoteNumber: t("preview.document.quoteNumber"),
      quoteDate: t("preview.document.quoteDate"),
      status: t("preview.document.status"),
      billTo: t("preview.document.billTo"),
      item: t("preview.document.item"),
      description: t("preview.document.description"),
      qty: t("preview.document.qty"),
      rate: t("preview.document.rate"),
      hours: t("preview.document.hours"),
      amount: t("preview.document.amount"),
      subtotal: t("preview.document.subtotal"),
      total: t("preview.document.total"),
      estimatedHours: t("preview.document.estimatedHours"),
      preparedBy: t("preview.document.preparedBy"),
      tbd: t("preview.document.tbd"),
      statusLabels: {
        Draft: statusLabel("Draft"),
        Sent: statusLabel("Sent"),
        Approved: statusLabel("Approved"),
        Rejected: statusLabel("Rejected"),
      } satisfies Record<QuotationStatus, string>,
    }),
    [t, statusLabel]
  );

  const handleDownloadPdf = useCallback(async () => {
    if (!documentRef.current || !quotation) {
      return;
    }
    setExporting(true);
    setExportError("");
    try {
      await exportQuotationPdf(
        documentRef.current,
        buildQuotationPdfFilename(quotation.title, quotation.id)
      );
    } catch {
      setExportError(t("preview.exportError"));
    } finally {
      setExporting(false);
    }
  }, [quotation, t]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!quotation) {
    return (
      <Box className="quotation-preview-page">
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

  return (
    <Box className="quotation-preview-page">
      <Box className="quotation-preview-toolbar mb-6 print:hidden">
        <BackLink href={`/quotations/${quotationId}`} label={t("preview.back")} />
        <PageHeader
          eyebrow={t("preview.eyebrow")}
          title={t("preview.title")}
          description={t("preview.subtitle")}
          actions={
            <HStack space="sm" className="flex-wrap">
              <Button variant="outline" onPress={handlePrint}>
                <ButtonText>{t("preview.print")}</ButtonText>
              </Button>
              <Button onPress={handleDownloadPdf} disabled={exporting}>
                <ButtonText>
                  {exporting ? t("preview.exporting") : t("preview.downloadPdf")}
                </ButtonText>
              </Button>
            </HStack>
          }
        />
        {exportError ? (
          <Box className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
            <Text className="text-sm text-destructive">{exportError}</Text>
          </Box>
        ) : null}
      </Box>

      <Box className="quotation-preview-canvas rounded-xl border border-border/60 bg-muted/30 p-4 shadow-soft-1 sm:p-8 print:border-0 print:bg-white print:p-0 print:shadow-none">
        <QuotationDocument
          ref={documentRef}
          quotation={quotation}
          client={client ?? null}
          preparedBy={user?.name ?? user?.email}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          labels={labels}
          dir={dir}
        />
      </Box>

      <Text className="mt-4 text-center text-sm text-muted-foreground print:hidden">
        {t("preview.hint")}
      </Text>
    </Box>
  );
}
