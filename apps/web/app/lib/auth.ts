"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, clearToken, getToken } from "./api";

export type Me = { id: string; email: string };

export function signOut(router?: ReturnType<typeof useRouter>) {
  clearToken();
  if (router) router.replace("/login");
}

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const tok = getToken();
      if (!tok) {
        router.replace(`/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`);
        return;
      }
      try {
        const data = await apiFetch<Me>("/api/auth/me");
        setMe(data);
      } catch (e) {
        // apiFetch clears token on 401; treat as signed-out.
        setMe(null);
        setError(e instanceof Error ? e.message : "Auth error");
        router.replace(`/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, pathname]);

  return { me, loading, error };
}

