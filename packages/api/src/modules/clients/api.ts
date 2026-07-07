import type { ApiClientRead, ApiListParams, ApiPaginatedData } from "@repo/types";
import type { RequestFn } from "../../lib/http/request";

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

export function createClientsApi(request: RequestFn) {
  return {
    listClients(params?: ApiListParams) {
      return request<ApiPaginatedData<ApiClientRead>>(`/clients${toQuery(params)}`);
    },

    createClient(payload: Record<string, string>) {
      return request<ApiClientRead>("/clients", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    updateClient(id: string, payload: Record<string, string>) {
      return request<ApiClientRead>(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    getClient(id: string) {
      return request<ApiClientRead>(`/clients/${id}`);
    },

    deleteClient(id: string) {
      return request<Record<string, never>>(`/clients/${id}`, {
        method: "DELETE",
      });
    },
  };
}

export type ClientsApi = ReturnType<typeof createClientsApi>;
