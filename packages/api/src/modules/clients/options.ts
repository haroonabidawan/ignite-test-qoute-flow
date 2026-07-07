import { queryOptions } from "@tanstack/react-query";
import type { ApiListParams, Client, PaginatedList } from "@repo/types";
import type { ApiClient } from "../../lib/client/create-client";
import { mapClient } from "../../lib/mappers";
import { queryKeys } from "../../lib/query/keys";

export const CLIENTS_LOOKUP_PARAMS: ApiListParams = { page: 1, page_size: 100 };

function mapClientsPage(
  page: Awaited<ReturnType<ApiClient["listClients"]>>
): PaginatedList<Client> {
  return {
    items: page.items.map(mapClient),
    total: page.total,
    page: page.page,
    pageSize: page.page_size,
    totalPages: page.total_pages,
  };
}

export function clientsListQueryOptions(api: ApiClient, params?: ApiListParams) {
  return queryOptions({
    queryKey: queryKeys.clients.list(params),
    queryFn: async (): Promise<PaginatedList<Client>> => {
      const page = await api.listClients(params);
      return mapClientsPage(page);
    },
  });
}

export function clientDetailQueryOptions(api: ApiClient, id: string) {
  return queryOptions({
    queryKey: queryKeys.clients.detail(id),
    queryFn: async (): Promise<Client> => {
      const row = await api.getClient(id);
      return mapClient(row);
    },
    staleTime: 60_000,
  });
}
