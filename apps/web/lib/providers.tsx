"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ApiQueryProvider } from "@repo/api";
import { I18nProvider } from "@repo/i18n";
import { NavigationProvider } from "@repo/ui/navigation";
import { api } from "@/lib/api-config";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <I18nProvider>
      <ApiQueryProvider api={api}>
        <NavigationProvider pathname={pathname} navigate={(path) => router.push(path)}>
          {children}
        </NavigationProvider>
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        ) : null}
      </ApiQueryProvider>
    </I18nProvider>
  );
}
