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
    return NextResponse.json({ count: 0, unreadMsgCount: 0 });
  }

  const currentEmail = session.user.email.toLowerCase();

  // 1. Pending friend requests count
  const snap = await adminDb
    .collection("friend_requests")
    .where("receiverEmail", "==", currentEmail)
    .where("status", "==", "pending")
    .get();

  // 2. Unread messages count
  let unreadMsgCount = 0;
  try {
    const unreadConvsSnap = await adminDb
      .collection("conversations")
      .where("participants", "array-contains", currentEmail)
      .where("lastMessageRead", "==", false)
      .get();

    unreadConvsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.lastSender && data.lastSender !== currentEmail) {
        unreadMsgCount++;
      }
    });
  } catch (e) {
    console.error("Error fetching unread message count", e);
  }

  return NextResponse.json({ count: snap.size, unreadMsgCount });
}
