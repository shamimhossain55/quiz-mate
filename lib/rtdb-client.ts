/**
 * lib/rtdb-client.ts
 *
 * Firebase Realtime Database — client-side instance.
 * firebase-client.ts থেকে initialized app reuse করে।
 *
 * ব্যবহার:
 *   import { rtdb } from "@/lib/rtdb-client";
 */

import { getDatabase, Database } from "firebase/database";
import app from "@/lib/firebase-client";

export const RTDB_DATABASE_URL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://quizmate-5000-default-rtdb.asia-southeast1.firebasedatabase.app";

let _rtdb: Database;
try {
  _rtdb = getDatabase(app, RTDB_DATABASE_URL);
} catch (e) {
  try {
    _rtdb = getDatabase(app);
  } catch (err) {
    console.warn("RTDB Client Init Error:", err);
    _rtdb = null as any;
  }
}

/**
 * Realtime Database instance — DM Chat, Typing Indicators, Presence।
 * Firestore এর জন্য firebase-client.ts থেকে `db` import করুন।
 */
export const rtdb = _rtdb;

