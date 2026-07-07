import type { ApiListParams } from "@repo/types";

export const queryKeys = {
  all: ["quoteflow"] as const,
  config: () => [...queryKeys.all, "config"] as const,
  session: () => [...queryKeys.all, "session"] as const,
  clients: {
    all: () => [...queryKeys.all, "clients"] as const,
    lists: () => [...queryKeys.clients.all(), "list"] as const,
    list: (params?: ApiListParams) =>
      [...queryKeys.clients.lists(), params ?? {}] as const,
    details: () => [...queryKeys.clients.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
  quotations: {
    all: () => [...queryKeys.all, "quotations"] as const,
    lists: () => [...queryKeys.quotations.all(), "list"] as const,
    list: (params?: ApiListParams) =>
      [...queryKeys.quotations.lists(), params ?? {}] as const,
    details: () => [...queryKeys.quotations.all(), "detail"] as const,
    detail: (id: string) => [...queryKeys.quotations.details(), id] as const,
  },
  ai: {
    all: () => [...queryKeys.all, "ai"] as const,
    usage: () => [...queryKeys.ai.all(), "usage"] as const,
  },
} as const;

export const mutationKeys = {
  auth: {
    login: () => [...queryKeys.all, "mutation", "auth", "login"] as const,
    logout: () => [...queryKeys.all, "mutation", "auth", "logout"] as const,
    requestPasswordReset: () =>
      [...queryKeys.all, "mutation", "auth", "request-password-reset"] as const,
    resetPassword: () =>
      [...queryKeys.all, "mutation", "auth", "reset-password"] as const,
  },
  clients: {
    create: () => [...queryKeys.all, "mutation", "clients", "create"] as const,
    update: () => [...queryKeys.all, "mutation", "clients", "update"] as const,
    delete: () => [...queryKeys.all, "mutation", "clients", "delete"] as const,
  },
  quotations: {
    create: () => [...queryKeys.all, "mutation", "quotations", "create"] as const,
    update: () => [...queryKeys.all, "mutation", "quotations", "update"] as const,
    delete: () => [...queryKeys.all, "mutation", "quotations", "delete"] as const,
    approve: () => [...queryKeys.all, "mutation", "quotations", "approve"] as const,
    aiDraft: () => [...queryKeys.all, "mutation", "quotations", "ai-draft"] as const,
    addItem: () => [...queryKeys.all, "mutation", "quotations", "add-item"] as const,
  },
} as const;
