import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    // ✅ RTDB Admin SDK-এর জন্য databaseURL প্রয়োজন
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
} else {
  adminApp = getApps()[0];
}

/** Cloud Firestore — quiz, user profiles, results, missions */
export const adminDb = getFirestore(adminApp);

/** Realtime Database — chat, typing indicators, presence */
export const adminRtdb = getDatabase(adminApp);

export default adminApp;