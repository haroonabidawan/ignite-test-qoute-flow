"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/context/use-api";
import { aiUsageQueryOptions } from "./options";

export function useAiUsage() {
  const api = useApi();
  return useQuery(aiUsageQueryOptions(api));
}
