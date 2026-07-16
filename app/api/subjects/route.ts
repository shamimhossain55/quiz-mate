import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export type SubjectOption = {
  id: string; // subjectDocId, যেমন "subject_1"
  name: string;
  group: "all" | "science" | "commerce" | "arts";
  order: number;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email;
  const docId = email.toLowerCase();

  // ⚠️ স্টুডেন্টের নিজের classId/group session/query থেকে না নিয়ে,
  //    সরাসরি তার Firestore ডকুমেন্ট থেকে নেওয়া হচ্ছে (নিরাপদ, এবং onboarding
  //    করার পরের সঠিক ডেটা নিশ্চিত করার জন্য)
  const studentSnap = await adminDb.collection("students").doc(docId).get();
  const studentData = studentSnap.data();

  if (!studentData?.classId) {
    return NextResponse.json(
      { error: "আগে ক্লাস সিলেক্ট করো (onboarding সম্পন্ন করো)" },
      { status: 400 }
    );
  }

  const classId: string = studentData.classId;
  const studentGroup: string | null = studentData.group ?? null;

  const snap = await adminDb
    .collection("classes")
    .doc(classId)
    .collection("subjects")
    .get();

  const subjects: SubjectOption[] = snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? doc.id,
        group: (data.group ?? "all") as SubjectOption["group"],
        order: typeof data.order === "number" ? data.order : 999,
      };
    })
    // যেই subject "all" এর জন্য (কম্পালসরি), অথবা স্টুডেন্টের নিজের গ্রুপের সাথে মেলে —
    // শুধু সেগুলোই রাখা হচ্ছে (hasGroups=false ক্লাসে সব subject "all" গ্রুপের হবে)
    .filter((s) => s.group === "all" || s.group === studentGroup);

  subjects.sort((a, b) => a.order - b.order);

  return NextResponse.json({ subjects });
}
