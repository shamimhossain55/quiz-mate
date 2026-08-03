import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/friends/pending-count
 * Returns only the count of pending incoming friend requests for the current user.
 * Very lightweight — used by BottomNav badge polling.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ count: 0 });
  }

  const currentEmail = session.user.email.toLowerCase();

  const snap = await adminDb
    .collection("friend_requests")
    .where("receiverEmail", "==", currentEmail)
    .where("status", "==", "pending")
    .get();

  return NextResponse.json({ count: snap.size });
}
