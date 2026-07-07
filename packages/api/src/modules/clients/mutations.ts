"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@repo/types";
import { useApi } from "../../lib/context/use-api";
import { mapClient, toClientPayload } from "../../lib/mappers";
import { mutationKeys, queryKeys } from "../../lib/query/keys";

export function useCreateClient() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clients.create(),
    mutationFn: async (data: Omit<Client, "id">) => {
      const raw = await api.createClient(toClientPayload(data));
      return mapClient(raw);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
    },
  });
}

export function useUpdateClient() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clients.update(),
    mutationFn: async ({ id, data }: { id: string; data: Omit<Client, "id"> }) => {
      const raw = await api.updateClient(id, toClientPayload(data));
      return mapClient(raw);
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
    },
  });
}

export function useDeleteClient() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.clients.delete(),
    mutationFn: async (id: string) => api.deleteClient(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.clients.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all() });
    },
  });
}
