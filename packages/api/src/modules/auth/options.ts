import { queryOptions } from "@tanstack/react-query";
import type { User } from "@repo/types";
import type { ApiClient } from "../../lib/client/create-client";
import { mapUser } from "../../lib/mappers";
import { queryKeys } from "../../lib/query/keys";

export function sessionQueryOptions(api: ApiClient) {
  return queryOptions({
    queryKey: queryKeys.session(),
    queryFn: async (): Promise<User | null> => {
      try {
        const me = await api.me();
        return mapUser(me);
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
