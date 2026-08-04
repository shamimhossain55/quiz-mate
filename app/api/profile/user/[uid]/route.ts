import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/profile/user/[uid]
 * Returns a public (read-only) view of a student's profile by their Firebase UID (email-based doc ID).
 * Strips sensitive fields before returning.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<any> }
) {
  const { uid } = await context.params;
  if (!uid) {
    return NextResponse.json({ error: "uid প্রয়োজন" }, { status: 400 });
  }

  // Optionally get session for fallback name/image (not required)
  const session = await getServerSession(authOptions).catch(() => null);

  try {
    const rawUid = decodeURIComponent(uid).trim().toLowerCase();
    let studentRef = adminDb.collection("students").doc(rawUid);
    let snap = await studentRef.get();

    if (!snap.exists) {
      const customSnap = await adminDb
        .collection("students")
        .where("customUidLower", "==", rawUid)
        .limit(1)
        .get();

      if (!customSnap.empty) {
        snap = customSnap.docs[0];
        studentRef = customSnap.docs[0].ref;
      }
    }

    if (!snap.exists) {
      return NextResponse.json({ error: "প্রোফাইল পাওয়া যায়নি" }, { status: 404 });
    }

    const data = snap.data() || {};

    // Fetch achievements count
    const achSnap = await adminDb
      .collection("user_achievements")
      .where("userEmail", "==", decodeURIComponent(uid))
      .get();

    // Resolve display name (prefer name saved in Firestore from onboarding/profile edit)
    let displayName: string;
    if (data.name && typeof data.name === "string" && data.name.trim().length > 0) {
      displayName = data.name.trim();
    } else if (session?.user?.email?.toLowerCase() === decodeURIComponent(uid).toLowerCase() && session.user.name) {
      displayName = session.user.name.trim();
    } else {
      const prefix = decodeURIComponent(uid).split("@")[0] || "শিক্ষার্থী";
      displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    // Resolve avatar: Firestore > session image > null
    let avatarUrl: string | null = data.avatarUrl || null;
    if (!avatarUrl && session?.user?.email?.toLowerCase() === decodeURIComponent(uid).toLowerCase()) {
      avatarUrl = session.user.image || null;
    }

    // Return only public fields — no email, no private data
    const publicProfile = {
      uid: snap.id,
      name: displayName,
      customUid: data.customUid || "",
      avatarUrl,
      bio: data.bio || "",
      classId: data.classId || "class6",
      className: data.className || "",
      group: data.group || "all",
      point: data.point || 0,
      totalExam: data.totalExam || 0,
      streak: data.streak || 1,
      level: data.level || Math.floor((data.point || 0) / 100) + 1,
      isPro: data.isPro || false,
      division: data.division || "",
      district: data.district || "",
      upazila: data.upazila || "",
      likesCount: data.likesCount || 0,
      friendsCount: data.friendsCount || 0,
      achievementsCount: achSnap.size,
      createdAt: data.createdAt || "",
    };

    return NextResponse.json({ student: publicProfile });
  } catch (err) {
    console.error("Error fetching public profile:", err);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
