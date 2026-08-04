import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/admin/stats
 * Protected admin API endpoint example.
 */
export async function GET() {
  // 1. Verify admin authorization
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response; // Returns 401 or 403 response automatically
  }

  try {
    // 2. Fetch admin dashboard stats using Firebase Admin SDK
    const usersSnap = await adminDb.collection("users").get();
    const studentsSnap = await adminDb.collection("students").get();
    const resultsSnap = await adminDb.collection("results").get();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersSnap.size,
        totalStudents: studentsSnap.size,
        totalQuizzesTaken: resultsSnap.size,
      },
      requestedBy: auth.session.user.email,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to retrieve admin statistics." },
      { status: 500 }
    );
  }
}
