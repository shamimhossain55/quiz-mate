import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const currentEmail = session.user.email.toLowerCase();
  const { uid } = await params;
  const decodedUid = decodeURIComponent(uid).trim();

  // Find user by customUid or email
  let targetSnap = await adminDb
    .collection("students")
    .where("customUidLower", "==", decodedUid.toLowerCase())
    .limit(1)
    .get();

  if (targetSnap.empty) {
    targetSnap = await adminDb
      .collection("students")
      .where("customUid", "==", decodedUid.toUpperCase())
      .limit(1)
      .get();
  }

  if (targetSnap.empty) {
    targetSnap = await adminDb
      .collection("students")
      .where("email", "==", decodedUid.toLowerCase())
      .limit(1)
      .get();
  }

  if (targetSnap.empty) {
    const docRef = adminDb.collection("students").doc(decodedUid.toLowerCase());
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      targetSnap = { docs: [docSnap], empty: false } as any;
    }
  }

  if (targetSnap.empty) {
    return NextResponse.json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" }, { status: 404 });
  }

  const targetDoc = targetSnap.docs[0];
  const targetData = targetDoc.data();
  const targetEmail = (targetData.email || targetDoc.id).toLowerCase();

  // Check if liked by current user
  const likeDocId = `${targetEmail}_${currentEmail}`;
  const likeSnap = await adminDb.collection("profile_likes").doc(likeDocId).get();
  const isLiked = likeSnap.exists;

  // Check relationship status
  let relationship: "none" | "friends" | "pending_sent" | "pending_received" | "self" = "none";

  if (targetEmail === currentEmail) {
    relationship = "self";
  } else {
    // Check friendship
    const sortedEmails = [currentEmail, targetEmail].sort();
    const friendshipId = `${sortedEmails[0]}_${sortedEmails[1]}`;
    const friendshipSnap = await adminDb.collection("friends").doc(friendshipId).get();

    if (friendshipSnap.exists) {
      relationship = "friends";
    } else {
      // Check pending requests
      const sentReqSnap = await adminDb
        .collection("friend_requests")
        .doc(`${currentEmail}_${targetEmail}`)
        .get();

      if (sentReqSnap.exists && sentReqSnap.data()?.status === "pending") {
        relationship = "pending_sent";
      } else {
        const recvReqSnap = await adminDb
          .collection("friend_requests")
          .doc(`${targetEmail}_${currentEmail}`)
          .get();

        if (recvReqSnap.exists && recvReqSnap.data()?.status === "pending") {
          relationship = "pending_received";
        }
      }
    }
  }

  // Get achievements count
  const achievementsSnap = await adminDb
    .collection("user_achievements")
    .where("userEmail", "==", targetEmail)
    .get();

  const userProfile = {
    email: targetEmail,
    name: targetData.name || "শিক্ষার্থী",
    customUid: targetData.customUid || "000000",
    avatarUrl: targetData.avatarUrl || null,
    bio: targetData.bio || "কুইজ মেট সদস্য",
    className: targetData.className || "Class 9",
    point: targetData.point || 0,
    level: Math.floor((targetData.point || 0) / 100) + 1,
    streak: targetData.streak || 1,
    totalExam: targetData.totalExam || 0,
    likesCount: targetData.likesCount || 0,
    friendsCount: targetData.friendsCount || 0,
    achievementsCount: achievementsSnap.size,
    isPro: targetData.isPro || false,
    isLiked,
    relationship,
  };

  return NextResponse.json({ user: userProfile });
}
