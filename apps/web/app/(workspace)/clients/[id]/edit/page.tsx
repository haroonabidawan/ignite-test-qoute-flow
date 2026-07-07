import { ClientFormScreen } from "@repo/ui/screens/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientFormScreen clientId={id} />;
}
