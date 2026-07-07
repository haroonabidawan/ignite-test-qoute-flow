import type { ApiAppConfig } from "@repo/types";
import type { RequestFn } from "../../lib/http/request";

export function createConfigApi(request: RequestFn) {
  return {
    getConfig() {
      return request<ApiAppConfig>("/config", {}, false);
    },
  };
}

export type ConfigApi = ReturnType<typeof createConfigApi>;
