import type { TokenStorage } from "../storage";
import { createRequestClient } from "../http/request";
import { createAuthApi } from "../../modules/auth/api";
import { createAiApi } from "../../modules/ai/api";
import { createClientsApi } from "../../modules/clients/api";
import { createConfigApi } from "../../modules/config/api";
import { createQuotationsApi } from "../../modules/quotations/api";

export interface ApiClientConfig {
  baseUrl: string;
  tokenStorage: TokenStorage;
}

export function createApiClient({ baseUrl, tokenStorage }: ApiClientConfig) {
  const apiBase = baseUrl.replace(/\/$/, "");
  const { request, requestWithMessage } = createRequestClient({
    apiBase,
    tokenStorage,
    credentials: "include",
  });

  return {
    ...createAuthApi(request, tokenStorage),
    ...createAiApi(request),
    ...createConfigApi(request),
    ...createClientsApi(request),
    ...createQuotationsApi(request, requestWithMessage),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
