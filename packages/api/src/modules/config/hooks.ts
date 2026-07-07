"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../lib/context/use-api";
import { appConfigQueryOptions } from "./options";

export function useAppConfig() {
  const api = useApi();
  return useQuery(appConfigQueryOptions(api));
}
