/**
 * lib/rtdb/chat-service.ts
 *
 * Firebase Realtime Database — Direct Message Chat Service
 *
 * RTDB Structure:
 * /dm_messages/{convId}/messages/{pushId}
 *   - senderId    : string  (user email, lowercase)
 *   - text        : string
 *   - timestamp   : number  (ServerValue.TIMESTAMP — unix ms)
 *
 * /dm_typing/{convId}/{sanitizedEmail}
 *   - isTyping    : boolean
 *   - updatedAt   : number
 *
 * convId = sorted([myEmail, friendEmail]).join("__")
 *
 * RTDB ব্যবহারের কারণ:
 *  - onValue() দিয়ে push-based real-time updates (polling নেই)
 *  - typing indicator: ephemeral data, Firestore writes অপচয় ছাড়াই
 *  - সস্তা: Firestore per-document-read cost নেই
 */

import {
  ref,
  push,
  set,
  onValue,
  off,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  onDisconnect,
  remove,
  DatabaseReference,
} from "firebase/database";
import { rtdb } from "@/lib/rtdb-client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RtdbMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
};

export type TypingPayload = {
  isTyping: boolean;
  updatedAt: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function sanitizeEmail(email: string): string {
  if (!email) return "unknown";
  return email
    .toLowerCase()
    .trim()
    .replace(/\./g, ",")
    .replace(/@/g, "_at_")
    .replace(/[\$#\[\]\/]/g, "_");
}

/**
 * Deterministic conversation ID from two emails.
 * Emails are sanitized to ensure no '.', '@', or illegal characters
 * are present in the RTDB path.
 */
export function buildConvId(emailA: string, emailB: string): string {
  const sanitizedA = sanitizeEmail(emailA);
  const sanitizedB = sanitizeEmail(emailB);
  return [sanitizedA, sanitizedB].sort().join("__");
}

// ─── Refs ────────────────────────────────────────────────────────────────────

function messagesRef(convId: string): DatabaseReference | null {
  if (!rtdb || !convId) return null;
  return ref(rtdb, `dm_messages/${convId}/messages`);
}

function typingRef(convId: string, email: string): DatabaseReference | null {
  if (!rtdb || !convId || !email) return null;
  return ref(rtdb, `dm_typing/${convId}/${sanitizeEmail(email)}`);
}

function typingConvRef(convId: string): DatabaseReference | null {
  if (!rtdb || !convId) return null;
  return ref(rtdb, `dm_typing/${convId}`);
}

// ─── Send Message ─────────────────────────────────────────────────────────────

/**
 * একটি নতুন message RTDB-তে push করে।
 *
 * @param myEmail    - current user এর email (lowercase)
 * @param friendEmail - friend এর email (lowercase)
 * @param text        - message text
 * @returns pushed message এর key
 */
export async function sendMessage(
  myEmail: string,
  friendEmail: string,
  text: string
): Promise<string> {
  if (!myEmail || !friendEmail || !text.trim()) return "";
  const convId = buildConvId(myEmail, friendEmail);
  const msgRef = messagesRef(convId);
  if (!msgRef) return "";

  const newRef = push(msgRef);
  await set(newRef, {
    senderId: myEmail.toLowerCase(),
    text: text.trim(),
    timestamp: serverTimestamp(), // RTDB server-side timestamp
  });

  return newRef.key || "";
}

// ─── Listen to Messages ───────────────────────────────────────────────────────

/**
 * Conversation-এর শেষ `limit` টা message real-time এ listen করে।
 * `onValue()` দিয়ে subscribe — যেকোনো নতুন message আসলে callback call হয়।
 *
 * @returns unsubscribe function — component unmount এ call করতে হবে
 */
export function listenToMessages(
  myEmail: string,
  friendEmail: string,
  limit: number = 80,
  callback: (messages: RtdbMessage[]) => void
): () => void {
  if (!myEmail || !friendEmail) return () => {};
  const convId = buildConvId(myEmail, friendEmail);
  const msgRef = messagesRef(convId);
  if (!msgRef) return () => {};

  const q = query(
    msgRef,
    orderByChild("timestamp"),
    limitToLast(limit)
  );

  onValue(
    q,
    (snapshot) => {
      const msgs: RtdbMessage[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        msgs.push({
          id: child.key!,
          senderId: data.senderId ?? "",
          text: data.text ?? "",
          timestamp: data.timestamp ?? Date.now(),
        });
      });
      // RTDB orderByChild ইতিমধ্যে ascending sort করে, তাই reverse লাগবে না
      callback(msgs);
    },
    (err) => {
      console.warn("RTDB listenToMessages error:", err);
    }
  );

  // Cleanup function
  return () => off(q);
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

/**
 * Typing indicator set করে।
 * `onDisconnect` দিয়ে browser close হলে auto-remove হয়।
 *
 * @param myEmail     - current user এর email
 * @param friendEmail - conversation partner এর email
 * @param isTyping    - true হলে typing শুরু, false হলে বন্ধ
 */
export async function setTypingIndicator(
  myEmail: string,
  friendEmail: string,
  isTyping: boolean
): Promise<void> {
  if (!myEmail || !friendEmail) return;
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingRef(convId, myEmail);
  if (!tRef) return;

  try {
    if (isTyping) {
      await set(tRef, { isTyping: true, updatedAt: serverTimestamp() });
      // ব্রাউজার বন্ধ হলে typing indicator auto remove করবে
      onDisconnect(tRef).remove().catch(() => {});
    } else {
      await remove(tRef).catch(() => {});
    }
  } catch (err) {
    console.warn("setTypingIndicator error:", err);
  }
}

/**
 * Friend এর typing status real-time এ listen করে।
 *
 * @returns unsubscribe function
 */
export function listenToTyping(
  myEmail: string,
  friendEmail: string,
  callback: (isFriendTyping: boolean) => void
): () => void {
  if (!myEmail || !friendEmail) return () => {};
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingRef(convId, friendEmail);
  if (!tRef) return () => {};

  onValue(
    tRef,
    (snapshot) => {
      const data = snapshot.val() as TypingPayload | null;
      callback(data?.isTyping === true);
    },
    (err) => {
      console.warn("RTDB listenToTyping error:", err);
    }
  );

  return () => off(tRef);
}

/**
 * Conversation-এর সব typing status listen করে (multiple participants এর জন্য)।
 * Group chat future use-এর জন্য।
 *
 * @returns unsubscribe function
 */
export function listenToAllTyping(
  myEmail: string,
  friendEmail: string,
  callback: (typingUsers: Record<string, TypingPayload>) => void
): () => void {
  if (!myEmail || !friendEmail) return () => {};
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingConvRef(convId);
  if (!tRef) return () => {};

  onValue(
    tRef,
    (snapshot) => {
      callback((snapshot.val() as Record<string, TypingPayload>) ?? {});
    },
    (err) => {
      console.warn("RTDB listenToAllTyping error:", err);
    }
  );

  return () => off(tRef);
}
