import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

/**
 * GET  /api/messages?friendEmail=xxx[&since=timestamp_ms]
 * Returns last 80 messages between current user and friendEmail.
 * If `since` is provided (ms), returns only messages newer than that timestamp.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });

  const friendEmail = req.nextUrl.searchParams.get("friendEmail");
  if (!friendEmail)
    return NextResponse.json({ error: "friendEmail প্রয়োজন" }, { status: 400 });

  const sinceParam = req.nextUrl.searchParams.get("since");
  const sinceMs = sinceParam ? parseInt(sinceParam, 10) : null;

  const myEmail = session.user.email.toLowerCase();
  const theirEmail = friendEmail.toLowerCase();

  // Conversation ID: deterministic sorted pair
  const convId = [myEmail, theirEmail].sort().join("__");

  const messagesCol = adminDb
    .collection("conversations")
    .doc(convId)
    .collection("messages");

  let snap;

  if (sinceMs && sinceMs > 0) {
    // Incremental poll — only fetch messages strictly newer than `since`
    snap = await messagesCol
      .orderBy("createdAt", "asc")
      .where("createdAt", ">", Timestamp.fromMillis(sinceMs))
      .get();
  } else {
    // Full load — last 80 messages
    snap = await messagesCol
      .orderBy("createdAt", "asc")
      .limitToLast(80)
      .get();
  }

  const messages = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      senderEmail: data.senderEmail,
      text: data.text,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });

  return NextResponse.json({ messages, convId });
}

/**
 * POST /api/messages
 * Body: { friendEmail, text }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });

  const body = await req.json();
  const { friendEmail, text } = body;

  if (!friendEmail || !text?.trim())
    return NextResponse.json({ error: "friendEmail ও text প্রয়োজন" }, { status: 400 });

  const myEmail = session.user.email.toLowerCase();
  const theirEmail = friendEmail.toLowerCase();

  const convId = [myEmail, theirEmail].sort().join("__");

  // Save message
  await adminDb
    .collection("conversations")
    .doc(convId)
    .collection("messages")
    .add({
      senderEmail: myEmail,
      text: text.trim(),
      createdAt: FieldValue.serverTimestamp(),
    });

  // Update conversation metadata (for future unread count / inbox list)
  await adminDb.collection("conversations").doc(convId).set(
    {
      participants: [myEmail, theirEmail],
      lastMessage: text.trim(),
      lastMessageAt: FieldValue.serverTimestamp(),
      lastSender: myEmail,
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
