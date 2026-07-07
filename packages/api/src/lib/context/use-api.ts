"use client";

import { useContext } from "react";
import { ApiClientContext } from "./api-client-context";

export function useApi() {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("useApi must be used within ApiQueryProvider");
  }
  return client;
}
