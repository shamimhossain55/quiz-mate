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
 *   - status      : "sent" | "delivered" | "seen"
 *   - seenAt      : number  (unix ms, optional)
 *   - deliveredAt : number  (unix ms, optional)
 *
 * /dm_typing/{convId}/{sanitizedEmail}
 *   - isTyping    : boolean
 *   - updatedAt   : number
 *
 * /presence/{sanitizedEmail}
 *   - isOnline    : boolean
 *   - lastSeen    : number  (unix ms)
 *
 * convId = sorted([myEmail, friendEmail]).join("__")
 *
 * RTDB ব্যবহারের কারণ:
 *  - onValue() দিয়ে push-based real-time updates (polling নেই)
 *  - typing indicator: ephemeral data, Firestore writes অপচয় ছাড়াই
 *  - presence: .info/connected দিয়ে accurate online/offline tracking
 *  - সস্তা: Firestore per-document-read cost নেই
 */

import {
  ref,
  push,
  set,
  get,
  update,
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

export type MessageStatus = "sent" | "delivered" | "seen";

export type RtdbMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  seenAt?: number;
  deliveredAt?: number;
};

export type TypingPayload = {
  isTyping: boolean;
  updatedAt: number;
};

export type PresencePayload = {
  isOnline: boolean;
  lastSeen: number;
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

function presenceRef(email: string): DatabaseReference | null {
  if (!rtdb || !email) return null;
  return ref(rtdb, `presence/${sanitizeEmail(email)}`);
}

// ─── User Presence ────────────────────────────────────────────────────────────

/**
 * Sets up user presence tracking using RTDB .info/connected.
 * Call this once when the user logs in.
 * Returns a cleanup function.
 *
 * @param userEmail - current user's email
 */
export function setupUserPresence(userEmail: string): () => void {
  if (!rtdb || !userEmail) return () => {};

  const pRef = presenceRef(userEmail);
  if (!pRef) return () => {};

  const connectedRef = ref(rtdb, ".info/connected");

  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // Register onDisconnect before setting online — race-condition safe
      onDisconnect(pRef)
        .set({ isOnline: false, lastSeen: serverTimestamp() })
        .then(() => {
          // Now mark as online
          set(pRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(
            () => {}
          );
        })
        .catch(() => {});
    }
  });

  return () => off(connectedRef, "value", unsubscribe as any);
}

/**
 * Listen to another user's presence (online/offline) in real time.
 *
 * @param userEmail - the user to watch (e.g. friend's email)
 * @param callback  - called with PresencePayload or null if unknown
 * @returns unsubscribe function
 */
export function listenToUserPresence(
  userEmail: string,
  callback: (presence: PresencePayload | null) => void
): () => void {
  if (!rtdb || !userEmail) {
    callback(null);
    return () => {};
  }

  const pRef = presenceRef(userEmail);
  if (!pRef) {
    callback(null);
    return () => {};
  }

  onValue(
    pRef,
    (snapshot) => {
      const data = snapshot.val() as PresencePayload | null;
      callback(data);
    },
    (err) => {
      console.warn("RTDB listenToUserPresence error:", err);
      callback(null);
    }
  );

  return () => off(pRef);
}

// ─── Send Message ─────────────────────────────────────────────────────────────

/**
 * Sends a new message to RTDB.
 * Automatically sets status based on whether recipient is online.
 *
 * @param myEmail     - current user's email (lowercase)
 * @param friendEmail - friend's email (lowercase)
 * @param text        - message text
 * @returns pushed message key
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

  // Check friend's presence to set initial status
  let initialStatus: MessageStatus = "sent";
  try {
    const pRef = presenceRef(friendEmail);
    if (pRef) {
      const snap = await get(pRef);
      const presence = snap.val() as PresencePayload | null;
      if (presence?.isOnline === true) {
        initialStatus = "delivered";
      }
    }
  } catch {
    // If presence check fails, default to "sent"
  }

  const newRef = push(msgRef);
  await set(newRef, {
    senderId: myEmail.toLowerCase(),
    text: text.trim(),
    timestamp: serverTimestamp(), // RTDB server-side timestamp
    status: initialStatus,
    ...(initialStatus === "delivered" && { deliveredAt: serverTimestamp() }),
  });

  return newRef.key || "";
}

// ─── Listen to Messages ───────────────────────────────────────────────────────

/**
 * Listens to the last `limit` messages in real time.
 * `onValue()` fires immediately and on every change.
 *
 * @returns unsubscribe function
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
          status: data.status ?? "sent",
          seenAt: data.seenAt ?? undefined,
          deliveredAt: data.deliveredAt ?? undefined,
        });
      });
      // RTDB orderByChild ইতিমধ্যে ascending sort করে
      callback(msgs);
    },
    (err) => {
      console.warn("RTDB listenToMessages error:", err);
    }
  );

  // Cleanup function
  return () => off(q);
}

// ─── Read Receipts ────────────────────────────────────────────────────────────

/**
 * Marks all messages from friendEmail in this conversation as "seen".
 * Call this when the local user opens the chat and has messages from the friend.
 *
 * @param myEmail     - current user's email (they are doing the "seeing")
 * @param friendEmail - the sender whose messages we are marking as seen
 */
export async function markConversationAsSeen(
  myEmail: string,
  friendEmail: string
): Promise<void> {
  if (!myEmail || !friendEmail) return;
  const convId = buildConvId(myEmail, friendEmail);
  const msgRef = messagesRef(convId);
  if (!msgRef) return;

  try {
    const q = query(msgRef, orderByChild("timestamp"), limitToLast(80));
    const snapshot = await get(q);
    if (!snapshot.exists()) return;

    const updates: Record<string, any> = {};
    snapshot.forEach((child) => {
      const data = child.val();
      // Only mark messages FROM the friend that aren't already seen
      if (data.senderId === friendEmail.toLowerCase() && data.status !== "seen") {
        updates[`${child.key}/status`] = "seen";
        updates[`${child.key}/seenAt`] = serverTimestamp();
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(msgRef, updates);
    }
  } catch (err) {
    console.warn("markConversationAsSeen error:", err);
  }
}

/**
 * Marks all messages from friendEmail in this conversation as "delivered"
 * (if they were previously "sent"). Call when this user comes online.
 *
 * @param myEmail     - current user's email (they are doing the receiving)
 * @param friendEmail - the sender whose messages we are marking as delivered
 */
export async function markConversationAsDelivered(
  myEmail: string,
  friendEmail: string
): Promise<void> {
  if (!myEmail || !friendEmail) return;
  const convId = buildConvId(myEmail, friendEmail);
  const msgRef = messagesRef(convId);
  if (!msgRef) return;

  try {
    const q = query(msgRef, orderByChild("timestamp"), limitToLast(80));
    const snapshot = await get(q);
    if (!snapshot.exists()) return;

    const updates: Record<string, any> = {};
    snapshot.forEach((child) => {
      const data = child.val();
      // Only promote "sent" → "delivered" for messages FROM the friend
      if (data.senderId === friendEmail.toLowerCase() && data.status === "sent") {
        updates[`${child.key}/status`] = "delivered";
        updates[`${child.key}/deliveredAt`] = serverTimestamp();
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(msgRef, updates);
    }
  } catch (err) {
    console.warn("markConversationAsDelivered error:", err);
  }
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

/**
 * Sets typing indicator.
 * `onDisconnect` auto-removes on browser close.
 *
 * @param myEmail     - current user's email
 * @param friendEmail - conversation partner's email
 * @param isTyping    - true = typing started, false = stopped
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
      // Auto-remove on browser close
      onDisconnect(tRef).remove().catch(() => {});
    } else {
      await remove(tRef).catch(() => {});
    }
  } catch (err) {
    console.warn("setTypingIndicator error:", err);
  }
}

/**
 * Listens to friend's typing status in real time.
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
 * Listens to all typing statuses in the conversation.
 * For group chat future use.
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
