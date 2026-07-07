"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiListParams, PaginatedList, Quotation } from "@repo/types";
import { useApi } from "../../lib/context/use-api";
import { queryKeys } from "../../lib/query/keys";
import { useSession } from "../auth/hooks";
import {
  QUOTATIONS_LOOKUP_PARAMS,
  quotationDetailQueryOptions,
  quotationsListQueryOptions,
} from "./options";

export function useQuotations(params?: ApiListParams) {
  const api = useApi();
  const { isAuthenticated } = useSession();

  return useQuery({
    ...quotationsListQueryOptions(api, params),
    enabled: isAuthenticated,
  });
}

/** Fetch up to 100 quotations for dashboard summaries and cross-references. */
export function useQuotationsLookup() {
  return useQuotations(QUOTATIONS_LOOKUP_PARAMS);
}

export function useQuotation(id: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  return useQuery({
    ...quotationDetailQueryOptions(api, id ?? ""),
    enabled: isAuthenticated && Boolean(id),
    initialData: () => {
      const cachedLists = queryClient.getQueriesData<PaginatedList<Quotation>>({
        queryKey: queryKeys.quotations.lists(),
      });
      for (const [, page] of cachedLists) {
        const match = page?.items.find((quotation) => quotation.id === id);
        if (match) return match;
      }
      return undefined;
    },
  });
}
