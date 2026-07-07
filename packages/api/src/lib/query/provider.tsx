"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ApiClient } from "../client/create-client";
import { ApiClientContext } from "../context/api-client-context";
import { createQueryClient } from "../query/client";

export function ApiQueryProvider({
  api,
  children,
}: {
  api: ApiClient;
  children: ReactNode;
}) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={api}>{children}</ApiClientContext.Provider>
    </QueryClientProvider>
  );
}
