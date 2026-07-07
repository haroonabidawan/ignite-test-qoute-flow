"use client";

import type { ReactNode } from "react";
import { useNavigate } from "../../navigation/navigation-context";

export function AuthCardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
    >
      {children}
    </button>
  );
}
