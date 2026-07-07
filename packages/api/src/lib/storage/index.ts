export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string | null): void;
}

export function createWebTokenStorage(key = "quoteflow_access_token"): TokenStorage {
  return {
    getToken() {
      if (typeof window === "undefined") return null;
      return sessionStorage.getItem(key);
    },
    setToken(token) {
      if (typeof window === "undefined") return;
      if (token) {
        sessionStorage.setItem(key, token);
      } else {
        sessionStorage.removeItem(key);
      }
    },
  };
}

export function createMemoryTokenStorage(): TokenStorage {
  let token: string | null = null;
  return {
    getToken: () => token,
    setToken: (value) => {
      token = value;
    },
  };
}

/** Cookie-based auth - tokens live in httpOnly cookies set by the API. */
export function createCookieTokenStorage(): TokenStorage {
  return {
    getToken: () => null,
    setToken: () => {},
  };
}
