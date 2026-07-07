import type { ApiEnvelope, ApiErrorBody } from "@repo/types";
import type { TokenStorage } from "../storage";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "message" in value &&
    "data" in value
  );
}

export type RequestFn = <T>(
  path: string,
  init?: RequestInit,
  auth?: boolean
) => Promise<T>;

export type RequestWithMessageFn = <T>(
  path: string,
  init?: RequestInit,
  auth?: boolean
) => Promise<{ data: T; message: string }>;

export interface RequestClientConfig {
  apiBase: string;
  tokenStorage: TokenStorage;
  credentials?: RequestCredentials;
}

export function createRequestClient({
  apiBase,
  tokenStorage,
  credentials = "include",
}: RequestClientConfig) {
  async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
    const text = await response.text();
    let body: unknown = null;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new ApiError(
          response.ok
            ? "The API returned an invalid response."
            : `Unable to reach the API (${response.status}). Is the backend running on ${apiBase}?`,
          response.status
        );
      }
    }

    if (!isApiEnvelope(body)) {
      throw new ApiError(`Request failed (${response.status}).`, response.status);
    }

    if (!response.ok || body.success === false) {
      const errorBody = body as ApiErrorBody;
      throw new ApiError(
        errorBody.message || `Request failed (${response.status}).`,
        response.status,
        errorBody.data?.code
      );
    }

    return body as ApiEnvelope<T>;
  }

  async function send(
    path: string,
    init: RequestInit = {},
    auth = true
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (auth) {
      const token = tokenStorage.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return fetch(`${apiBase}${path}`, {
      ...init,
      headers,
      credentials,
    });
  }

  async function request<T>(
    path: string,
    init: RequestInit = {},
    auth = true
  ): Promise<T> {
    const response = await send(path, init, auth);
    const envelope = await parseEnvelope<T>(response);
    return envelope.data;
  }

  async function requestWithMessage<T>(
    path: string,
    init: RequestInit = {},
    auth = true
  ): Promise<{ data: T; message: string }> {
    const response = await send(path, init, auth);
    const envelope = await parseEnvelope<T>(response);
    return { data: envelope.data, message: envelope.message };
  }

  return { request, requestWithMessage };
}
