"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/shared/bottom-nav";
import { FloatingCalculator } from "@/components/shared/floating-calculator";
import { LocalDataMigration } from "@/components/shared/local-data-migration";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const publicPaths = new Set([
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/restablecer-contrasena",
]);

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (publicPaths.has(pathname)) return;

    let active = true;
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }: { data: { user: unknown } }) => active && setIsAuthenticated(Boolean(data.user)))
      .catch(() => active && setIsAuthenticated(false));

    return () => {
      active = false;
    };
  }, [pathname]);

  const showAuthenticatedUI = isAuthenticated && !publicPaths.has(pathname);

  return (
    <>
      {children}
      {showAuthenticatedUI && (
        <>
          <LocalDataMigration />
          <BottomNav />
          <FloatingCalculator />
        </>
      )}
    </>
  );
}