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

  const currentEmail = session.user.email.toLowerCase();
  const body = await req.json();
  const targetEmail = body.targetEmail?.toLowerCase();

  if (!targetEmail) {
    return NextResponse.json({ error: "টার্গেট ইমেইল প্রয়োজন" }, { status: 400 });
  }

  const sortedEmails = [currentEmail, targetEmail].sort();
  const friendshipId = `${sortedEmails[0]}_${sortedEmails[1]}`;
  const friendshipRef = adminDb.collection("friends").doc(friendshipId);
  const friendshipSnap = await friendshipRef.get();

  if (!friendshipSnap.exists) {
    return NextResponse.json({ error: "বন্ধুত্ব খুঁজে পাওয়া যায়নি" }, { status: 404 });
  }

  const batch = adminDb.batch();
  batch.delete(friendshipRef);

  const u1Ref = adminDb.collection("students").doc(currentEmail);
  const u2Ref = adminDb.collection("students").doc(targetEmail);

  batch.set(u1Ref, { friendsCount: FieldValue.increment(-1) }, { merge: true });
  batch.set(u2Ref, { friendsCount: FieldValue.increment(-1) }, { merge: true });

  await batch.commit();

  return NextResponse.json({ message: "বন্ধু তালিকা থেকে সরানো হয়েছে" });
}
