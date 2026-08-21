import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

const databaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  process.env.FIREBASE_DATABASE_URL;

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    ...(databaseURL ? { databaseURL } : {}),
  });
} else {
  adminApp = getApps()[0];
}

/** Cloud Firestore — quiz, user profiles, results, missions */
export const adminDb = getFirestore(adminApp);

/** Realtime Database — safely initialized only when databaseURL is available */
let _adminRtdb: any = null;
export const getAdminRtdb = () => {
  if (!_adminRtdb && (databaseURL || adminApp.options.databaseURL)) {
    try {
      _adminRtdb = getDatabase(adminApp);
    } catch (e) {
      console.warn("RTDB initialization warning:", e);
    }
  }
  return _adminRtdb;
};

export const adminRtdb = (() => {
  if (databaseURL || adminApp.options.databaseURL) {
    try {
      return getDatabase(adminApp);
    } catch {
      return null as any;
    }
  }
  return null as any;
})();

export default adminApp;