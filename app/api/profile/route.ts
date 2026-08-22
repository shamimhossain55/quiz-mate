import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { generateUniqueCustomUid, ACHIEVEMENTS_CATALOG } from "@/lib/profile-utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  const studentRef = adminDb.collection("students").doc(email);
  const studentSnap = await studentRef.get();

  let studentData: Record<string, any>;

  if (!studentSnap.exists) {
    const customUid = await generateUniqueCustomUid();
    studentData = {
      email,
      name: session.user.name || email.split("@")[0] || "শিক্ষার্থী",
      customUid,
      customUidLower: customUid.toLowerCase(),
      avatarUrl: session.user.image || null,
      bio: "কুইজ মেটে স্বাগতম! 🚀",
      classId: null,
      className: null,
      group: null,
      profileComplete: false,
      point: 0,
      totalExam: 0,
      streak: 1,
      level: 1,
      isPro: false,
      likesCount: 0,
      friendsCount: 0,
      achievementsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await studentRef.set(studentData);
  } else {
    studentData = studentSnap.data() || {};
    let isUpdated = false;

    if (studentData.profileComplete === undefined) {
      studentData.profileComplete = Boolean(studentData.classId || studentData.totalExam > 0 || studentData.point > 0);
    }

    // Check if customUid is missing or invalid 6-digit number format
    if (!studentData.customUid || !/^\d{6}$/.test(String(studentData.customUid))) {
      const customUid = await generateUniqueCustomUid();
      studentData.customUid = customUid;
      studentData.customUidLower = customUid.toLowerCase();
      isUpdated = true;
    }

    // Fallback name if missing
    if (!studentData.name || typeof studentData.name !== "string" || studentData.name.trim().length === 0) {
      if (session.user.name) {
        studentData.name = session.user.name.trim();
        isUpdated = true;
      } else {
        const prefix = email.split("@")[0];
        studentData.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        isUpdated = true;
      }
    }

    if (!studentData.avatarUrl && session.user.image) {
      studentData.avatarUrl = session.user.image;
      isUpdated = true;
    }

    // Default values if missing
    if (studentData.point === undefined) studentData.point = 0;
    if (studentData.totalExam === undefined) studentData.totalExam = 0;
    if (studentData.streak === undefined) studentData.streak = 1;
    if (studentData.likesCount === undefined) studentData.likesCount = 0;
    if (studentData.friendsCount === undefined) studentData.friendsCount = 0;

    studentData.level = Math.floor((studentData.point || 0) / 100) + 1;

    // Evaluate Achievements
    const existingAchievementsSnap = await adminDb
      .collection("user_achievements")
      .where("userEmail", "==", email)
      .get();
    
    const unlockedIds = new Set(
      existingAchievementsSnap.docs.map((doc) => doc.data().achievementId)
    );

    let newlyUnlocked = 0;
    const batch = adminDb.batch();

    for (const ach of ACHIEVEMENTS_CATALOG) {
      if (!unlockedIds.has(ach.id)) {
        const isEligible = ach.check({
          totalExam: studentData.totalExam || 0,
          point: studentData.point || 0,
          streak: studentData.streak || 1,
          friendsCount: studentData.friendsCount || 0,
          likesCount: studentData.likesCount || 0,
        });

        if (isEligible) {
          const achRef = adminDb.collection("user_achievements").doc(`${email}_${ach.id}`);
          batch.set(achRef, {
            userEmail: email,
            achievementId: ach.id,
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            category: ach.category,
            unlockedAt: new Date().toISOString(),
          });
          newlyUnlocked++;
          unlockedIds.add(ach.id);
        }
      }
    }

    studentData.achievementsCount = unlockedIds.size;

    if (newlyUnlocked > 0 || isUpdated) {
      batch.set(studentRef, { ...studentData, updatedAt: new Date().toISOString() }, { merge: true });
      await batch.commit();
    }
  }

  return NextResponse.json({ student: studentData });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  const body = await req.json();
  const { name, avatarUrl, bio, classId, className, group, language, division, district } = body;

  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (name !== undefined) updateData.name = typeof name === "string" ? name.trim() : name;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (bio !== undefined) updateData.bio = typeof bio === "string" ? bio.trim() : bio;
  if (classId !== undefined) updateData.classId = classId;
  if (className !== undefined) updateData.className = className;
  if (group !== undefined) updateData.group = group;
  if (language !== undefined) updateData.language = language;
  if (division !== undefined) updateData.division = typeof division === "string" ? division.trim() : division;
  if (district !== undefined) updateData.district = typeof district === "string" ? district.trim() : district;

  const studentRef = adminDb.collection("students").doc(email);
  await studentRef.set(updateData, { merge: true });

  const updatedSnap = await studentRef.get();
  return NextResponse.json({ student: updatedSnap.data() });
}
