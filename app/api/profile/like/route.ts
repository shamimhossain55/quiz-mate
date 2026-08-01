import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function resolveStudent(targetParam: string) {
  const cleanParam = targetParam.trim().toLowerCase();
  let ref = adminDb.collection("students").doc(cleanParam);
  let snap = await ref.get();

  if (!snap.exists) {
    const q = await adminDb
      .collection("students")
      .where("customUidLower", "==", cleanParam)
      .limit(1)
      .get();
    if (!q.empty) {
      snap = q.docs[0];
      ref = q.docs[0].ref;
    }
  }

  if (!snap.exists) return null;

  return {
    email: snap.id.toLowerCase(),
    ref,
    snap,
    data: snap.data() || {},
  };
}

/**
 * GET /api/profile/like?targetEmail=...
 * Returns whether the current session user has liked the target profile.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const targetParam = url.searchParams.get("targetEmail");

  if (!targetParam) {
    return NextResponse.json({ error: "targetEmail প্রয়োজন" }, { status: 400 });
  }

  const studentObj = await resolveStudent(targetParam);
  if (!studentObj) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  const targetEmail = studentObj.email;

  // Not logged in → return isLiked: false
  if (!session?.user?.email) {
    return NextResponse.json({ isLiked: false, isOwnProfile: false, likesCount: studentObj.data.likesCount || 0 });
  }

  const likerEmail = session.user.email.toLowerCase();
  const likeDocId = `${targetEmail}_${likerEmail}`;
  const likeSnap = await adminDb.collection("profile_likes").doc(likeDocId).get();

  return NextResponse.json({
    isLiked: likeSnap.exists,
    isOwnProfile: likerEmail === targetEmail,
    likesCount: studentObj.data.likesCount || 0,
  });
}

/**
 * POST /api/profile/like
 * Toggles or adds a like on a target student's profile and updates likesCount in Firestore.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const likerEmail = session.user.email.toLowerCase();
  const body = await req.json();
  const targetParam = body.targetEmail;

  if (!targetParam) {
    return NextResponse.json({ error: "টার্গেট ইমেইল প্রয়োজন" }, { status: 400 });
  }

  const studentObj = await resolveStudent(targetParam);
  if (!studentObj) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  const targetEmail = studentObj.email;
  const targetStudentRef = studentObj.ref;

  if (targetEmail === likerEmail) {
    return NextResponse.json(
      { error: "নিজের প্রোফাইলে লাইক দেওয়া যাবে না" },
      { status: 400 }
    );
  }

  const likeDocId = `${targetEmail}_${likerEmail}`;
  const likeRef = adminDb.collection("profile_likes").doc(likeDocId);
  const likeSnap = await likeRef.get();

  let isLiked = false;
  let newLikesCount = studentObj.data.likesCount || 0;

  const batch = adminDb.batch();

  if (likeSnap.exists) {
    // Unlike
    batch.delete(likeRef);
    newLikesCount = Math.max(0, newLikesCount - 1);
    batch.update(targetStudentRef, {
      likesCount: FieldValue.increment(-1),
      updatedAt: new Date().toISOString(),
    });
    isLiked = false;
  } else {
    // Like
    batch.set(likeRef, {
      targetEmail,
      likerEmail,
      createdAt: new Date().toISOString(),
    });
    newLikesCount += 1;
    batch.update(targetStudentRef, {
      likesCount: FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });
    isLiked = true;
  }

  await batch.commit();

  return NextResponse.json({ isLiked, likesCount: newLikesCount });
}
