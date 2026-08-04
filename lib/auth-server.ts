import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type RequireAdminResult =
  | {
      authorized: true;
      session: any;
      response: null;
    }
  | {
      authorized: false;
      session: null;
      response: NextResponse;
    };

/**
 * Reusable server-side authorization helper for API routes (/api/admin/*).
 * Checks whether the current user is authenticated and possesses the "admin" role.
 *
 * @param providedSession Optional pre-fetched NextAuth session object.
 * @returns An object with `authorized`, `session`, and `response` (401/403 NextResponse if unauthorized).
 */
export async function requireAdmin(providedSession?: any): Promise<RequireAdminResult> {
  const session = providedSession || (await getServerSession(authOptions));

  // 1. Unauthenticated check
  if (!session || !session.user) {
    return {
      authorized: false,
      session: null,
      response: NextResponse.json(
        { error: "Unauthorized: Please sign in to perform this action." },
        { status: 401 }
      ),
    };
  }

  // 2. Role verification check
  if (session.user.role !== "admin") {
    return {
      authorized: false,
      session: null,
      response: NextResponse.json(
        { error: "Forbidden: You do not have admin permissions." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
    response: null,
  };
}
