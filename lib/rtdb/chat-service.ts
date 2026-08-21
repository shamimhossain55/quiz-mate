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

/**
 * Deterministic conversation ID from two emails.
 * email-এর "@" এবং "." replace করতে হয় কারণ RTDB path-এ
 * এই characters invalid হয়।
 */
export function buildConvId(emailA: string, emailB: string): string {
  return [emailA.toLowerCase(), emailB.toLowerCase()]
    .sort()
    .join("__");
}

/**
 * RTDB path-এ email সরাসরি key হিসেবে ব্যবহার করা যায় না
 * কারণ ".", "#", "$", "[", "]" invalid।
 * এই function সেগুলো replace করে।
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().replace(/\./g, ",").replace(/@/g, "_at_");
}

// ─── Refs ────────────────────────────────────────────────────────────────────

function messagesRef(convId: string): DatabaseReference {
  return ref(rtdb, `dm_messages/${convId}/messages`);
}

function typingRef(convId: string, email: string): DatabaseReference {
  return ref(rtdb, `dm_typing/${convId}/${sanitizeEmail(email)}`);
}

function typingConvRef(convId: string): DatabaseReference {
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
  const convId = buildConvId(myEmail, friendEmail);
  const msgRef = messagesRef(convId);

  const newRef = push(msgRef);
  await set(newRef, {
    senderId: myEmail.toLowerCase(),
    text: text.trim(),
    timestamp: serverTimestamp(), // RTDB server-side timestamp
  });

  return newRef.key!;
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
  const convId = buildConvId(myEmail, friendEmail);
  const q = query(
    messagesRef(convId),
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
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingRef(convId, myEmail);

  if (isTyping) {
    await set(tRef, { isTyping: true, updatedAt: serverTimestamp() });
    // ব্রাউজার বন্ধ হলে typing indicator auto remove করবে
    onDisconnect(tRef).remove();
  } else {
    await remove(tRef);
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
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingRef(convId, friendEmail);

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
  const convId = buildConvId(myEmail, friendEmail);
  const tRef = typingConvRef(convId);

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
