import { QuotationDetailScreen } from "@repo/ui/screens/quotation-detail";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuotationDetailScreen quotationId={id} />;
}
