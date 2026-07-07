import { createApiClient, createCookieTokenStorage } from "@repo/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export const api = createApiClient({
  baseUrl: API_BASE,
  tokenStorage: createCookieTokenStorage(),
});
