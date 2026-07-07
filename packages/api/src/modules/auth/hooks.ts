"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../lib/context/use-api";
import { mapUser } from "../../lib/mappers";
import { mutationKeys, queryKeys } from "../../lib/query/keys";
import { CLIENTS_LOOKUP_PARAMS, clientsListQueryOptions } from "../clients/options";
import {
  QUOTATIONS_LOOKUP_PARAMS,
  quotationsListQueryOptions,
} from "../quotations/options";
import { sessionQueryOptions } from "./options";

export function useSession() {
  const api = useApi();
  const query = useQuery({
    ...sessionQueryOptions(api),
  });

  return {
    user: query.data ?? null,
    ready: query.isFetched,
    isAuthenticated: Boolean(query.data),
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}

export function useLogin() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.auth.login(),
    mutationFn: async ({ email, password }: { email: string; password: string }) =>
      api.login(email.trim(), password),
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.session(), mapUser(data.user));
      await Promise.all([
        queryClient.prefetchQuery(clientsListQueryOptions(api, CLIENTS_LOOKUP_PARAMS)),
        queryClient.prefetchQuery(
          quotationsListQueryOptions(api, QUOTATIONS_LOOKUP_PARAMS)
        ),
      ]);
    },
  });
}

export function useLogout() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.auth.logout(),
    mutationFn: async () => {
      await api.logout();
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationKey: mutationKeys.auth.requestPasswordReset(),
    mutationFn: async (_email: string) => ({}),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationKey: mutationKeys.auth.resetPassword(),
    mutationFn: async (_input: { token: string; password: string }) => ({
      ok: false,
      message: "Password reset is not available. Please contact support.",
    }),
  });
}
