import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * QuizMate Proxy (Next.js 16+ convention):
 * Role-Based Access Control Guard for /admin and /api/admin routes, plus Subdomain mapping.
 */
export async function proxy(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  const isAdminSubdomain =
    host.startsWith("admin.") || host.includes("admin.localhost");

  const isAdminRoute = pathname.startsWith("/admin") || isAdminSubdomain;
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    // Decrypt and read the NextAuth JWT using NEXTAUTH_SECRET
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "quizmate_secret_key_2026",
    });

    // Step 1: Unauthenticated
    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in to access this resource." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Step 2: Logged in but NOT admin
    if (token.role !== "admin") {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Forbidden: Admin privileges required." },
          { status: 403 }
        );
      }
      const forbiddenUrl = new URL("/dashboard", request.url);
      forbiddenUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Subdomain Mapping Rewrites
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

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
