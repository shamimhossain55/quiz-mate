import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const currentEmail = session.user.email.toLowerCase();

  // 1. Get accepted friendships
  const friendsSnap1 = await adminDb
    .collection("friends")
    .where("user1Email", "==", currentEmail)
    .get();

  const friendsSnap2 = await adminDb
    .collection("friends")
    .where("user2Email", "==", currentEmail)
    .get();

  const friendEmails = new Set<string>();
  friendsSnap1.docs.forEach((doc) => friendEmails.add(doc.data().user2Email));
  friendsSnap2.docs.forEach((doc) => friendEmails.add(doc.data().user1Email));

  // Fetch profiles of friends in batch
  const friendsList: any[] = [];
  const friendEmailArray = Array.from(friendEmails);
  if (friendEmailArray.length > 0) {
    const refs = friendEmailArray.map((email) => adminDb.collection("students").doc(email));
    const snaps = await adminDb.getAll(...refs);
    snaps.forEach((sSnap) => {
      if (sSnap.exists) {
        const data = sSnap.data() || {};
        const friendEmail = sSnap.id;
        friendsList.push({
          email: friendEmail,
          name: data.name || "শিক্ষার্থী",
          customUid: data.customUid || "000000",
          avatarUrl: data.avatarUrl || null,
          level: Math.floor((data.point || 0) / 100) + 1,
          point: data.point || 0,
          streak: data.streak || 1,
        });
      }
    });
  }

  // 2. Incoming friend requests
  const incomingSnap = await adminDb
    .collection("friend_requests")
    .where("receiverEmail", "==", currentEmail)
    .where("status", "==", "pending")
    .get();

  const incomingRequests = incomingSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 3. Outgoing friend requests
  const outgoingSnap = await adminDb
    .collection("friend_requests")
    .where("senderEmail", "==", currentEmail)
    .where("status", "==", "pending")
    .get();

  const outgoingRequests = outgoingSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({
    friends: friendsList,
    incomingRequests,
    outgoingRequests,
  });
}
