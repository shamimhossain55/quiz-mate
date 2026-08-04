import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/admin/users/role
 * Secure Admin API endpoint to update a user's role in both 'users' and 'students' collections.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const { userId, email, role } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Role is required." },
        { status: 400 }
      );
    }

    const targetEmail = (email || userId || "").toLowerCase().trim();
    if (!targetEmail) {
      return NextResponse.json(
        { error: "User email or ID is required." },
        { status: 400 }
      );
    }

    const isAdminRole =
      role === "super_admin" ||
      role === "admin" ||
      role === "moderator" ||
      role === "content_creator";

    // Standardize role for NextAuth (admin or user)
    const normalizedRole = role === "super_admin" ? "admin" : role;

    // 1. Update role in 'users' collection (read by NextAuth JWT/Session callback)
    const userRef = adminDb.collection("users").doc(targetEmail);
    await userRef.set(
      {
        email: targetEmail,
        role: normalizedRole,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.session.user.email,
      },
      { merge: true }
    );

    // 2. Update role in 'students' collection (read by Admin Panel dashboard)
    const studentRef = adminDb.collection("students").doc(targetEmail);
    const studentSnap = await studentRef.get();

    if (studentSnap.exists) {
      await studentRef.update({
        role: normalizedRole,
        isAdmin: isAdminRole,
        updatedAt: new Date().toISOString(),
      });
    } else if (userId && userId !== targetEmail) {
      const idRef = adminDb.collection("students").doc(userId);
      const idSnap = await idRef.get();
      if (idSnap.exists) {
        await idRef.update({
          role: normalizedRole,
          isAdmin: isAdminRole,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      email: targetEmail,
      role: normalizedRole,
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role." },
      { status: 500 }
    );
  }
}
