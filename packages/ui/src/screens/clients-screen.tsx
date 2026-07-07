"use client";

import { useMemo, useState } from "react";
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
import {
  Icon,
  AddIcon,
  EditIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  TrashIcon,
} from "../components/ui/icon/index.web";
import { EmptyState } from "../components/common/empty-state";
import { PaginationControls } from "../components/common/pagination-controls";
import { QueryBoundary } from "../components/common/query-boundary";
import { StatCard } from "../components/common/stat-card";
import { UserAvatar } from "../components/common/user-avatar";
import { PageHeader } from "../components/layout/page-header";
import { SearchField } from "../components/forms/fields";
import { useClients, useDeleteClient, useQuotationsLookup } from "@repo/api/hooks";
import { useNavigate } from "../navigation/navigation-context";

export function ClientsScreen() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const clientsQuery = useClients({
    page,
    page_size: 20,
    search: search.trim() || undefined,
  });
  const quotationsQuery = useQuotationsLookup();
  const pageData = clientsQuery.data;
  const clients = pageData?.items ?? [];
  const deleteClient = useDeleteClient();
  const navigate = useNavigate();
  const quotations = quotationsQuery.data?.items ?? [];

  const withQuotes = useMemo(
    () => new Set(quotations.map((q) => q.clientId)).size,
    [quotations]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <Box>
      <PageHeader
        eyebrow={t("clients.eyebrow")}
        title={t("clients.title")}
        description={t("clients.description")}
        actions={
          <Button onPress={() => navigate("/clients/new")} className="h-10">
            <Icon as={AddIcon} size="sm" className="text-primary-foreground" />
            <ButtonText>{t("clients.addClient")}</ButtonText>
          </Button>
        }
      />

      <QueryBoundary
        isLoading={clientsQuery.isLoading}
        isError={clientsQuery.isError}
        onRetry={() => void clientsQuery.refetch()}
      >
        <Box className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("clients.totalClients")}
            value={pageData?.total ?? 0}
            icon={<Icon as={GlobeIcon} size="sm" />}
          />
          <StatCard
            label={t("clients.withQuotations")}
            value={withQuotes}
            hint={t("clients.withQuotationsHint")}
          />
          <StatCard
            label={t("clients.showing")}
            value={clients.length}
            hint={search ? t("clients.showingFiltered") : t("clients.showingAll")}
          />
        </Box>

        <Card className="ui-surface mb-6 p-4">
          <SearchField
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t("clients.searchPlaceholder")}
          />
        </Card>

        {clients.length === 0 ? (
          <EmptyState
            title={t("clients.emptyTitle")}
            description={t("clients.emptyDescription")}
            icon={<Icon as={GlobeIcon} size="lg" />}
            action={
              <Button onPress={() => navigate("/clients/new")}>
                <ButtonText>{t("clients.addClient")}</ButtonText>
              </Button>
            }
          />
        ) : (
          <Card className="ui-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>{t("clients.table.client")}</TableHead>
                  <TableHead>{t("clients.table.contact")}</TableHead>
                  <TableHead>{t("clients.table.company")}</TableHead>
                  <TableHead className="text-end">
                    {t("clients.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="ui-table-row">
                    <TableData>
                      <HStack space="sm" className="items-center">
                        <UserAvatar name={client.name} />
                        <Box>
                          <Text className="font-medium text-foreground">
                            {client.name}
                          </Text>
                          {client.notes ? (
                            <Text className="max-w-xs truncate text-xs text-muted-foreground">
                              {client.notes}
                            </Text>
                          ) : null}
                        </Box>
                      </HStack>
                    </TableData>
                    <TableData>
                      <VStackContact email={client.email} phone={client.phone} />
                    </TableData>
                    <TableData>
                      <Text className="text-sm">
                        {client.company || t("common.dash")}
                      </Text>
                    </TableData>
                    <TableData>
                      <HStack space="xs" className="justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => navigate(`/clients/${client.id}/edit`)}
                        >
                          <Icon as={EditIcon} size="sm" />
                          <ButtonText>{t("common.edit")}</ButtonText>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => {
                            if (
                              window.confirm(
                                t("clients.deleteConfirm", { name: client.name })
                              )
                            ) {
                              deleteClient.mutate(client.id);
                            }
                          }}
                        >
                          <Icon as={TrashIcon} size="sm" className="text-destructive" />
                        </Button>
                      </HStack>
                    </TableData>
                  </TableRow>
                ))}
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

function VStackContact({ email, phone }: { email: string; phone: string }) {
  return (
    <Box className="space-y-1">
      <HStack space="xs" className="items-center">
        <Icon as={MailIcon} size="xs" className="text-muted-foreground" />
        <Text className="text-sm text-foreground">{email}</Text>
      </HStack>
      {phone ? (
        <HStack space="xs" className="items-center">
          <Icon as={PhoneIcon} size="xs" className="text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">{phone}</Text>
        </HStack>
      ) : null}
    </Box>
  );
}
