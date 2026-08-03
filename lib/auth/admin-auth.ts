import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export type AdminVerificationResult = {
  isAdmin: boolean;
  uid?: string;
  email?: string;
  role?: string;
  error?: string;
};

/**
 * Verifies a Firebase ID token or Session Cookie and checks if the user has admin privileges.
 * Admin role is verified via Firebase Custom Claims (decodedToken.admin === true || decodedToken.role === 'admin')
 * or via Firestore document lookup in 'students' or 'admins' collections.
 */
export async function verifyAdminToken(
  tokenOrCookie: string
): Promise<AdminVerificationResult> {
  try {
    const auth = getAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(tokenOrCookie, true);
    } catch {
      decodedToken = await auth.verifyIdToken(tokenOrCookie);
    }

    if (!decodedToken || !decodedToken.uid) {
      return { isAdmin: false, error: "Invalid or expired token" };
    }

    // Check custom claims first
    if (decodedToken.admin === true || decodedToken.role === "admin") {
      return {
        isAdmin: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "admin",
      };
    }

    // Fallback: Check Firestore document
    const userDoc = await adminDb
      .collection("students")
      .doc(decodedToken.uid)
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        return {
          isAdmin: true,
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: userData?.role || "admin",
        };
      }
    }

    // Also check 'admins' collection by email or UID
    if (decodedToken.email) {
      const adminSnap = await adminDb
        .collection("admins")
        .where("email", "==", decodedToken.email.toLowerCase())
        .limit(1)
        .get();

      if (!adminSnap.empty) {
        return {
          isAdmin: true,
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: "admin",
        };
      }
    }

    return { isAdmin: false, error: "Insufficient admin permissions" };
  } catch (err: any) {
    console.error("Admin verification error:", err);
    return { isAdmin: false, error: err.message || "Authentication failed" };
  }
}

/**
 * Checks if a user email or UID has admin status directly in Firestore.
 */
export async function isEmailAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    const adminSnap = await adminDb
      .collection("admins")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (!adminSnap.empty) return true;

    const studentSnap = await adminDb
      .collection("students")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (!studentSnap.empty) {
      const userData = studentSnap.docs[0].data();
      return userData?.role === "admin" || userData?.isAdmin === true;
    }

    return false;
  } catch (err) {
    console.error("Error checking email admin status:", err);
    return false;
  }
}
