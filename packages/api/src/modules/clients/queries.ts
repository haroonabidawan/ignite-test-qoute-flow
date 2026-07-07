"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiListParams, Client, PaginatedList } from "@repo/types";
import { useApi } from "../../lib/context/use-api";
import { queryKeys } from "../../lib/query/keys";
import { useSession } from "../auth/hooks";
import {
  CLIENTS_LOOKUP_PARAMS,
  clientDetailQueryOptions,
  clientsListQueryOptions,
} from "./options";

export function useClients(params?: ApiListParams) {
  const api = useApi();
  const { isAuthenticated } = useSession();

  return useQuery({
    ...clientsListQueryOptions(api, params),
    enabled: isAuthenticated,
  });
}

/** Fetch up to 100 clients for dropdowns and dashboard summaries. */
export function useClientsLookup() {
  return useClients(CLIENTS_LOOKUP_PARAMS);
}

export function useClient(id: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSession();

  return useQuery({
    ...clientDetailQueryOptions(api, id ?? ""),
    enabled: isAuthenticated && Boolean(id),
    initialData: () => {
      const cachedLists = queryClient.getQueriesData<PaginatedList<Client>>({
        queryKey: queryKeys.clients.lists(),
      });
      for (const [, page] of cachedLists) {
        const match = page?.items.find((client) => client.id === id);
        if (match) return match;
      }
      return undefined;
    },
  });
}
