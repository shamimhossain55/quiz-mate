import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email;
  const docId = email.toLowerCase();

  const studentRef = adminDb.collection("students").doc(docId);
  const studentSnap = await studentRef.get();

  if (!studentSnap.exists) {
    const newStudentData = {
      name: session.user.name ?? "শিক্ষার্থী",
      email: email,
      photoUrl: session.user.image ?? null,
      classId: null as string | null, // যেমন: "class6", "class9_10" — onboarding এ সেট হবে
      className: null as string | null, // display নাম, যেমন: "Class 6", "Class 9-10 (SSC)"
      group: null as string | null, // "science" | "commerce" | "arts" — শুধু hasGroups=true ক্লাসের জন্য
      profileComplete: false,
      totalExam: 0,
      point: 0,
      rank: null,
      createdAt: new Date().toISOString(),
    };

    await studentRef.set(newStudentData);

    return NextResponse.json({ student: newStudentData });
  }

  return NextResponse.json({ student: studentSnap.data() });
}