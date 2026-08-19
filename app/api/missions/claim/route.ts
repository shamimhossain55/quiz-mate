import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const body = await req.json();
    const { missionId, rewardXP, date } = body;

    if (!missionId || typeof rewardXP !== "number" || rewardXP <= 0) {
      return NextResponse.json({ error: "অবৈধ মিশন তথ্য" }, { status: 400 });
    }

    // Default to today's date key YYYY-MM-DD
    const todayKey = date || new Date().toISOString().split("T")[0];
    const missionDocRef = adminDb
      .collection("students")
      .doc(email)
      .collection("daily_missions")
      .doc(todayKey);

    const docSnap = await missionDocRef.get();
    const claimedData = docSnap.exists ? docSnap.data() || {} : {};

    // Check if already claimed today
    if (claimedData[missionId]) {
      return NextResponse.json({
        success: false,
        message: "মিশনটি আজ আগেই ক্লেইম করা হয়েছে",
        alreadyClaimed: true,
      });
    }

    // Save claim record for today
    await missionDocRef.set(
      {
        [missionId]: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Atomically increment student points
    const studentRef = adminDb.collection("students").doc(email);
    await studentRef.set(
      {
        point: FieldValue.increment(rewardXP),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Fetch updated student doc to get current points and level
    const updatedSnap = await studentRef.get();
    const studentData = updatedSnap.data() || {};
    const newPoints = studentData.point || 0;
    const newLevel = Math.floor(newPoints / 100) + 1;

    // Update level if changed
    if (studentData.level !== newLevel) {
      await studentRef.update({ level: newLevel });
    }

    return NextResponse.json({
      success: true,
      rewardXP,
      newPoints,
      newLevel,
      claimedMissionId: missionId,
    });
  } catch (error: any) {
    console.error("Error claiming mission reward:", error);
    return NextResponse.json(
      { error: error?.message || "মিশন ক্লেইম করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();
    const todayKey = new Date().toISOString().split("T")[0];

    const missionDocRef = adminDb
      .collection("students")
      .doc(email)
      .collection("daily_missions")
      .doc(todayKey);

    const docSnap = await missionDocRef.get();
    const claimedMissions = docSnap.exists ? docSnap.data() || {} : {};

    return NextResponse.json({
      claimedMissions,
      date: todayKey,
    });
  } catch (error: any) {
    console.error("Error fetching claimed missions:", error);
    return NextResponse.json(
      { error: error?.message || "মিশন তথ্য আনতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
