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
  const { requestId, action } = body;

  if (!requestId || !action || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "সঠিক রিকোয়েস্ট তথ্য প্রদান করুন" }, { status: 400 });
  }

  const reqRef = adminDb.collection("friend_requests").doc(requestId);
  const reqSnap = await reqRef.get();

  if (!reqSnap.exists) {
    return NextResponse.json({ error: "রিকোয়েস্ট খুঁজে পাওয়া যায়নি" }, { status: 404 });
  }

  const reqData = reqSnap.data() || {};
  if (reqData.receiverEmail !== currentEmail) {
    return NextResponse.json(
      { error: "এই রিকোয়েস্টে আপনার অনুমতি নেই" },
      { status: 403 }
    );
  }

  const batch = adminDb.batch();

  if (action === "accept") {
    batch.update(reqRef, {
      status: "accepted",
      updatedAt: new Date().toISOString(),
    });

    const senderEmail = reqData.senderEmail.toLowerCase();
    const sortedEmails = [currentEmail, senderEmail].sort();
    const friendshipId = `${sortedEmails[0]}_${sortedEmails[1]}`;
    const friendshipRef = adminDb.collection("friends").doc(friendshipId);

    batch.set(friendshipRef, {
      id: friendshipId,
      user1Email: sortedEmails[0],
      user2Email: sortedEmails[1],
      createdAt: new Date().toISOString(),
    });

    // Increment friendsCount for both
    const user1Ref = adminDb.collection("students").doc(currentEmail);
    const user2Ref = adminDb.collection("students").doc(senderEmail);

    batch.set(user1Ref, { friendsCount: FieldValue.increment(1) }, { merge: true });
    batch.set(user2Ref, { friendsCount: FieldValue.increment(1) }, { merge: true });

    await batch.commit();

    return NextResponse.json({ message: "ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে! 🤝" });
  } else {
    batch.update(reqRef, {
      status: "declined",
      updatedAt: new Date().toISOString(),
    });
    await batch.commit();

    return NextResponse.json({ message: "রিকোয়েস্ট বাতিল করা হয়েছে" });
  }
}
