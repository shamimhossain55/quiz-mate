/**
 * lib/rtdb-client.ts
 *
 * Firebase Realtime Database — client-side instance.
 * firebase-client.ts থেকে initialized app reuse করে।
 *
 * ব্যবহার:
 *   import { rtdb } from "@/lib/rtdb-client";
 */

import { getDatabase } from "firebase/database";
import app from "@/lib/firebase-client";

/**
 * Realtime Database instance — DM Chat, Typing Indicators, Presence।
 * Firestore এর জন্য firebase-client.ts থেকে `db` import করুন।
 */
export const rtdb = getDatabase(app);

