import type { ApiAuthResponse, ApiUserRead } from "@repo/types";
import type { RequestFn } from "../../lib/http/request";
import type { TokenStorage } from "../../lib/storage";

export function createAuthApi(request: RequestFn, tokenStorage: TokenStorage) {
  return {
    getAccessToken: () => tokenStorage.getToken(),
    setAccessToken: (token: string | null) => tokenStorage.setToken(token),

    login(email: string, password: string) {
      return request<ApiAuthResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false
      );
    },

    logout() {
      return request<Record<string, never>>(
        "/auth/logout",
        {
          method: "POST",
        },
        false
      );
    },

    me() {
      return request<ApiUserRead>("/auth/me");
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
