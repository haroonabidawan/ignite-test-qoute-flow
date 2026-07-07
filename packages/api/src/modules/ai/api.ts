import type { ApiAiUsage } from "@repo/types";
import type { RequestFn } from "../../lib/http/request";

export function createAiApi(request: RequestFn) {
  return {
    getUsage() {
      return request<ApiAiUsage>("/ai/usage");
    },
  };
}

export type AiApi = ReturnType<typeof createAiApi>;
