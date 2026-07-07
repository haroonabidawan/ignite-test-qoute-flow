import type {
  AiDraftResponse,
  ApiApproveData,
  ApiListParams,
  ApiPaginatedData,
  ApiQuotationItemRead,
  ApiQuotationRead,
} from "@repo/types";
import type { RequestFn, RequestWithMessageFn } from "../../lib/http/request";

function toQuery(params?: ApiListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.status) search.set("status", params.status);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createQuotationsApi(
  request: RequestFn,
  requestWithMessage: RequestWithMessageFn
) {
  return {
    listQuotations(params?: ApiListParams) {
      return request<ApiPaginatedData<ApiQuotationRead>>(
        `/quotations${toQuery(params)}`
      );
    },

    createQuotation(payload: Record<string, unknown>) {
      return request<ApiQuotationRead>("/quotations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    updateQuotation(id: string, payload: Record<string, unknown>) {
      return request<ApiQuotationRead>(`/quotations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    addQuotationItem(id: string, payload: Record<string, unknown>) {
      return request<ApiQuotationItemRead>(`/quotations/${id}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    getQuotation(id: string) {
      return request<ApiQuotationRead>(`/quotations/${id}`);
    },

    deleteQuotation(id: string) {
      return request<Record<string, never>>(`/quotations/${id}`, {
        method: "DELETE",
      });
    },

    approveQuotation(id: string) {
      return requestWithMessage<ApiApproveData>(`/quotations/${id}/approve`, {
        method: "POST",
      });
    },

    generateAiDraft(requestText: string, locale = "en") {
      return request<AiDraftResponse>("/quotations/ai-draft", {
        method: "POST",
        body: JSON.stringify({ request: requestText, locale }),
      });
    },
  };
}

export type QuotationsApi = ReturnType<typeof createQuotationsApi>;
