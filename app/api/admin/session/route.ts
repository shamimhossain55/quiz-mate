import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth/admin-auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    const verification = await verifyAdminToken(idToken);

    if (!verification.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: User is not an admin" },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("firebase_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: verification.uid,
        email: verification.email,
        role: verification.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("firebase_token");
  cookieStore.delete("__session");
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("firebase_token")?.value ||
    cookieStore.get("__session")?.value;

  if (!token) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  const verification = await verifyAdminToken(token);
  if (!verification.isAdmin) {
    return NextResponse.json(
      { isAuthenticated: false, error: verification.error },
      { status: 403 }
    );
  }

  return NextResponse.json({
    isAuthenticated: true,
    user: {
      uid: verification.uid,
      email: verification.email,
      role: verification.role,
    },
  });
}
