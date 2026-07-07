import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../../lib/client/create-client";
import { queryKeys } from "../../lib/query/keys";

export function appConfigQueryOptions(api: ApiClient) {
  return queryOptions({
    queryKey: queryKeys.config(),
    queryFn: () => api.getConfig(),
    staleTime: Infinity,
  });
}
