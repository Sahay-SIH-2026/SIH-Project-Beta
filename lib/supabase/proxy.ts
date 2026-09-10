import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/counselor") ||
    pathname.startsWith("/victim") ||
    pathname.startsWith("/admin");

  // Redirect unauthenticated requests for protected routes to /login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login to their corresponding portal
  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "VICTIM";
    let target = "/victim";
    if (role === "COUNSELOR") target = "/counselor";
    if (role === "ADMIN") target = "/admin";

    return NextResponse.redirect(new URL(target, request.url));
  }

  // Role-Based Access Control (RBAC)
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "VICTIM";

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      const fallback = role === "COUNSELOR" ? "/counselor" : "/victim";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    if (pathname.startsWith("/counselor") && role !== "COUNSELOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/victim", request.url));
    }
  }

  return supabaseResponse;
}
