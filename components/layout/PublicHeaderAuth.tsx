"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function PublicHeaderAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setIsAuthenticated(!!data.session?.user);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === true) {
    return null;
  }

  return (
    <Link
      href="/login"
      className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 no-underline shadow-xs"
    >
      Sign In
    </Link>
  );
}
