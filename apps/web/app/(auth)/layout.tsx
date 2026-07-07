"use client";

import { useEffect, type ReactNode } from "react";
import { useSession } from "@repo/api/hooks";
import { useNavigate } from "@repo/ui/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return children;
}
