import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const likerEmail = session.user.email.toLowerCase();
  const body = await req.json();
  const targetEmail = body.targetEmail?.toLowerCase();

  if (!targetEmail) {
    return NextResponse.json({ error: "টার্গেট ইমেইল প্রয়োজন" }, { status: 400 });
  }

  if (targetEmail === likerEmail) {
    return NextResponse.json(
      { error: "নিজের প্রোফাইলে লাইক দেওয়া যাবে না" },
      { status: 400 }
    );
  }

  const targetStudentRef = adminDb.collection("students").doc(targetEmail);
  const targetSnap = await targetStudentRef.get();

  if (!targetSnap.exists) {
    return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });
  }

  const likeDocId = `${targetEmail}_${likerEmail}`;
  const likeRef = adminDb.collection("profile_likes").doc(likeDocId);
  const likeSnap = await likeRef.get();

  let isLiked = false;
  let newLikesCount = (targetSnap.data()?.likesCount || 0);

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
