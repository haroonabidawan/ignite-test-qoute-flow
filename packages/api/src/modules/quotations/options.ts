import { queryOptions } from "@tanstack/react-query";
import type { ApiListParams, PaginatedList, Quotation } from "@repo/types";
import type { ApiClient } from "../../lib/client/create-client";
import { mapQuotation } from "../../lib/mappers";
import { queryKeys } from "../../lib/query/keys";

export const QUOTATIONS_LOOKUP_PARAMS: ApiListParams = { page: 1, page_size: 100 };

function mapQuotationsPage(
  page: Awaited<ReturnType<ApiClient["listQuotations"]>>
): PaginatedList<Quotation> {
  return {
    items: page.items.map(mapQuotation),
    total: page.total,
    page: page.page,
    pageSize: page.page_size,
    totalPages: page.total_pages,
  };
}

export function quotationsListQueryOptions(api: ApiClient, params?: ApiListParams) {
  return queryOptions({
    queryKey: queryKeys.quotations.list(params),
    queryFn: async (): Promise<PaginatedList<Quotation>> => {
      const page = await api.listQuotations(params);
      return mapQuotationsPage(page);
    },
  });
}

export function quotationDetailQueryOptions(api: ApiClient, id: string) {
  return queryOptions({
    queryKey: queryKeys.quotations.detail(id),
    queryFn: async (): Promise<Quotation> => {
      const row = await api.getQuotation(id);
      return mapQuotation(row);
    },
    staleTime: 60_000,
  });
}
