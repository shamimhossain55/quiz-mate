import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth/admin-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token =
      cookieStore.get("firebase_token")?.value ||
      cookieStore.get("__session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await verifyAdminToken(token);
    if (!verification.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only super_admin and admin can view activity logs
    const role = verification.role || "";
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxDocs = Math.min(Number(searchParams.get("limit") || "100"), 200);

    const snap = await adminDb
      .collection("admin_activity_logs")
      .orderBy("timestamp", "desc")
      .limit(maxDocs)
      .get();

    const logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toMillis?.() ?? null,
    }));

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Error fetching activity logs:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
