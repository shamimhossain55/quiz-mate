import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export type SubjectOption = {
  id: string;
  name: string;
  slug?: string;
  group: "all" | "science" | "commerce" | "arts";
  order: number;
  color?: string;
  imageUrl?: string;
};

function isClassMatching(subjectClassId?: string, studentClassId?: string): boolean {
  if (!studentClassId || !subjectClassId) return true;
  if (subjectClassId === studentClassId) return true;

  const sscClasses = ["class9", "class10", "class9_10"];
  if (sscClasses.includes(subjectClassId) && sscClasses.includes(studentClassId)) {
    return true;
  }

  const hscClasses = ["class11", "class12", "class11_12"];
  if (hscClasses.includes(subjectClassId) && hscClasses.includes(studentClassId)) {
    return true;
  }

  return false;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email;
  const docId = email.toLowerCase();

  // স্টুডেন্টের Firestore ডকুমেন্ট থেকে classId/group নেওয়া হচ্ছে (নিরাপদ)
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

  // root "subjects" collection থেকে সমস্ত বিষয় নেওয়া হচ্ছে
  const snap = await adminDb.collection("subjects").get();

  let docsData = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? doc.id,
      slug: data.slug ?? doc.id,
      classId: data.classId ?? "class6",
      group: (data.group ?? "all") as SubjectOption["group"],
      order: typeof data.order === "number" ? data.order : 999,
      color: data.color ?? "#0D9488",
      imageUrl: data.imageUrl ?? "",
    };
  });

  // 1. Filter by classId (স্মার্ট ম্যাচিং সহ)
  const filteredByClass = docsData.filter((s) => isClassMatching(s.classId, classId));
  if (filteredByClass.length > 0) {
    docsData = filteredByClass;
  }

  // 2. Group filter logic
  const subjects: SubjectOption[] = docsData.filter((s) => {
    const subjectGroup = (s.group || "all").toLowerCase();
    if (subjectGroup === "all") return true;
    if (!studentGroup || studentGroup.toLowerCase() === "all") return false;
    return subjectGroup === studentGroup.toLowerCase();
  });

  subjects.sort((a, b) => a.order - b.order);

  return NextResponse.json({ subjects });
}

