import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Update session using Supabase
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // We check if the user is authenticated by looking at the session.
    // However, `updateSession` refreshed it, so we can verify if the cookie exists or just let supabase handle the check.
    // The safest way on edge without doing another `getUser` is checking if the auth cookie exists.
    // Supabase stores tokens in `sb-[PROJECT_ID]-auth-token` or similar, but the safest way inside middleware is calling getUser again
    // But since the helper already did `getUser`, we can just check if cookies have the `sb-` prefix or use another client.

    // Actually, let's just create a quick server client here or use the auth cookie.
    // The easiest way is to import createServerClient and check getUser, but we want to avoid double hitting DB.
    // Let's rely on `sb-` cookies presence as a quick check for redirect, or do a proper check.
    const hasSessionCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

    // Fallback: If no supabase session, redirect to login
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
