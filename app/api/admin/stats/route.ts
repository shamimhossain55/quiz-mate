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
    // 2. Fetch admin dashboard stats using efficient Firebase aggregation count (1 read instead of full collection download)
    const [usersCountSnap, studentsCountSnap, resultsCountSnap] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("students").count().get(),
      adminDb.collection("results").count().get(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersCountSnap.data().count,
        totalStudents: studentsCountSnap.data().count,
        totalQuizzesTaken: resultsCountSnap.data().count,
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
