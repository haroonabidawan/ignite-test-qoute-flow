"use client";

import { createContext } from "react";
import type { ApiClient } from "../client/create-client";

export const ApiClientContext = createContext<ApiClient | null>(null);
