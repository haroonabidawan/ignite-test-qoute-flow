import { QuotationPreviewScreen } from "@repo/ui/screens/quotation-preview";

export default async function QuotationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuotationPreviewScreen quotationId={id} />;
}
