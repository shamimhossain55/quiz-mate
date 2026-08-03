import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * QuizMate Proxy (Next.js 16+ convention):
 *
 * Layer 1 — Admin Route Guard:
 *   - Unauthenticated users           → redirect to /login
 *   - Authenticated but non-admin     → redirect to /dashboard?error=forbidden
 *   - Authenticated admin (role=admin)→ allow through ✅
 *
 * Layer 2 — Subdomain Mapping:
 *   - admin.yourdomain.com → rewrites internally to /admin
 */
export async function proxy(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // ── Detect admin subdomain ────────────────────────────────────────────
  const isAdminSubdomain =
    host.startsWith("admin.") || host.includes("admin.localhost");

  const isAdminRoute = pathname.startsWith("/admin") || isAdminSubdomain;

  // ── Only enforce on admin routes ──────────────────────────────────────
  if (isAdminRoute) {
    // Decrypt and read the NextAuth JWT using NEXTAUTH_SECRET
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "quizmate_secret_key_2026",
    });

    // Step 1: Not logged in at all → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Step 2: Logged in but NOT admin → redirect to dashboard
    if (token.role !== "admin") {
      const forbiddenUrl = new URL("/dashboard", request.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbiddenUrl);
    }

    // Step 3: role === 'admin' → allow through ✅
  }

  // ── Subdomain Mapping Rewrites ────────────────────────────────────────
  if (isAdminSubdomain) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
