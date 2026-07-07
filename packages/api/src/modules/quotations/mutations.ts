"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Quotation, QuotationItem } from "@repo/types";
import { useApi } from "../../lib/context/use-api";
import {
  mapQuotation,
  mapQuotationItem,
  toQuotationCreatePayload,
  toQuotationItemCreatePayload,
  toQuotationUpdatePayload,
} from "../../lib/mappers";
import { mutationKeys, queryKeys } from "../../lib/query/keys";

export function useCreateQuotation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.create(),
    mutationFn: async (data: Omit<Quotation, "id">) => {
      const raw = await api.createQuotation(toQuotationCreatePayload(data));
      return mapQuotation(raw);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.lists() });
    },
  });
}

export function useUpdateQuotation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.update(),
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Quotation, "id">>;
    }) => {
      const raw = await api.updateQuotation(id, toQuotationUpdatePayload(data));
      return mapQuotation(raw);
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.lists() });
    },
  });
}

export function useDeleteQuotation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.delete(),
    mutationFn: async (id: string) => api.deleteQuotation(id),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all() });
    },
  });
}

export function useApproveQuotation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.approve(),
    mutationFn: async (quotationId: string) => {
      const { data, message } = await api.approveQuotation(quotationId);
      return { quotation: mapQuotation(data.quotation), message };
    },
    onSuccess: ({ quotation }) => {
      queryClient.setQueryData(queryKeys.quotations.detail(quotation.id), quotation);
    },
    onSettled: (_data, _error, quotationId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.quotations.detail(quotationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.lists() });
    },
  });
}

export function useAddQuotationItem() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.addItem(),
    mutationFn: async ({
      quotationId,
      item,
    }: {
      quotationId: string;
      item: Pick<
        QuotationItem,
        "title" | "description" | "quantity" | "unitPrice" | "estimatedHours"
      >;
    }) => {
      const raw = await api.addQuotationItem(
        quotationId,
        toQuotationItemCreatePayload(item)
      );
      return mapQuotationItem(raw);
    },
    onSuccess: (item, { quotationId }) => {
      queryClient.setQueryData<Quotation>(
        queryKeys.quotations.detail(quotationId),
        (current) =>
          current ? { ...current, items: [...current.items, item] } : current
      );
    },
    onSettled: (_data, _error, { quotationId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.quotations.detail(quotationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.quotations.lists() });
    },
  });
}

export function useGenerateAiDraft() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.quotations.aiDraft(),
    mutationFn: async ({
      request,
      locale = "en",
    }: {
      request: string;
      locale?: string;
    }) => api.generateAiDraft(request, locale),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage() });
    },
  });
}
