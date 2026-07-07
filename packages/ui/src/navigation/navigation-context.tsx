"use client";

import { createContext, useContext, type ReactNode } from "react";

interface NavigationContextValue {
  navigate: (path: string) => void;
  pathname: string;
}

const NavigationContext = createContext<NavigationContextValue>({
  navigate: () => undefined,
  pathname: "/",
});

export function NavigationProvider({
  children,
  navigate,
  pathname,
}: {
  children: ReactNode;
  navigate: (path: string) => void;
  pathname: string;
}) {
  return (
    <NavigationContext.Provider value={{ navigate, pathname }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigate(): (path: string) => void {
  return useContext(NavigationContext).navigate;
}

export function usePathname(): string {
  return useContext(NavigationContext).pathname;
}
