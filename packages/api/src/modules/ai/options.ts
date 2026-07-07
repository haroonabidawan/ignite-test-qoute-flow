import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../../lib/client/create-client";
import { queryKeys } from "../../lib/query/keys";

export function aiUsageQueryOptions(api: ApiClient) {
  return queryOptions({
    queryKey: queryKeys.ai.usage(),
    queryFn: () => api.getUsage(),
    staleTime: 30_000,
  });
}
