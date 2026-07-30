import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const senderEmail = session.user.email.toLowerCase();
  const body = await req.json();
  const targetInput = (body.targetUid || body.targetEmail || "").trim();

  if (!targetInput) {
    return NextResponse.json({ error: "টার্গেট ইউজার আইডি প্রয়োজন" }, { status: 400 });
  }

  // Find sender student data
  const senderSnap = await adminDb.collection("students").doc(senderEmail).get();
  const senderData = senderSnap.data() || {};

  // Find receiver student data
  let receiverSnap = await adminDb
    .collection("students")
    .where("customUidLower", "==", targetInput.toLowerCase())
    .limit(1)
    .get();

  if (receiverSnap.empty) {
    receiverSnap = await adminDb
      .collection("students")
      .where("customUid", "==", targetInput.toUpperCase())
      .limit(1)
      .get();
  }

  if (receiverSnap.empty) {
    receiverSnap = await adminDb
      .collection("students")
      .where("email", "==", targetInput.toLowerCase())
      .limit(1)
      .get();
  }

  if (receiverSnap.empty) {
    return NextResponse.json(
      { error: "এই ইউজার আইডি দিয়ে কাউকে পাওয়া যায়নি" },
      { status: 404 }
    );
  }

  const receiverDoc = receiverSnap.docs[0];
  const receiverData = receiverDoc.data();
  const receiverEmail = (receiverData.email || receiverDoc.id).toLowerCase();

  if (senderEmail === receiverEmail) {
    return NextResponse.json(
      { error: "নিজের কাছে ফ্রেন্ড রিকোয়েস্ট পাঠানো যাবে না" },
      { status: 400 }
    );
  }

  // Check if already friends
  const sortedEmails = [senderEmail, receiverEmail].sort();
  const friendshipId = `${sortedEmails[0]}_${sortedEmails[1]}`;
  const friendshipSnap = await adminDb.collection("friends").doc(friendshipId).get();

  if (friendshipSnap.exists) {
    return NextResponse.json({ error: "আপনারা ইতোমধ্যে বন্ধু!" }, { status: 400 });
  }

  // Check if request exists
  const reqId = `${senderEmail}_${receiverEmail}`;
  const existingReqSnap = await adminDb.collection("friend_requests").doc(reqId).get();

  if (existingReqSnap.exists && existingReqSnap.data()?.status === "pending") {
    return NextResponse.json(
      { error: "ফ্রেন্ড রিকোয়েস্ট ইতোমধ্যে পাঠানো হয়েছে" },
      { status: 400 }
    );
  }

  // Create request
  await adminDb.collection("friend_requests").doc(reqId).set({
    id: reqId,
    senderEmail,
    senderName: senderData.name || session.user.name || "শিক্ষার্থী",
    senderAvatar: senderData.avatarUrl || null,
    senderUid: senderData.customUid || "000000",
    receiverEmail,
    receiverName: receiverData.name || "শিক্ষার্থী",
    receiverAvatar: receiverData.avatarUrl || null,
    receiverUid: receiverData.customUid || "000000",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ message: "ফ্রেন্ড রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! 🎉" });
}
