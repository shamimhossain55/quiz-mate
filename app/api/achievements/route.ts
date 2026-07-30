import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { ACHIEVEMENTS_CATALOG } from "@/lib/profile-utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  const userAchSnap = await adminDb
    .collection("user_achievements")
    .where("userEmail", "==", email)
    .get();

  const unlockedMap = new Map<string, string>();
  userAchSnap.docs.forEach((doc) => {
    const data = doc.data();
    unlockedMap.set(data.achievementId, data.unlockedAt || new Date().toISOString());
  });

  const achievements = ACHIEVEMENTS_CATALOG.map((ach) => {
    const isUnlocked = unlockedMap.has(ach.id);
    return {
      id: ach.id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? unlockedMap.get(ach.id) : null,
    };
  });

  return NextResponse.json({ achievements });
}
