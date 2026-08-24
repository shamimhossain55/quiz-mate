import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export type ChapterOption = {
  id: string;
  name: string;
  author?: string;
  order: number;
};

const chaptersCache = new Map<string, { data: any; timestamp: number }>();
const CHAPTERS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  const { subjectId } = await context.params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const email = session.user.email;
  const docId = email.toLowerCase();

  try {
    const studentSnap = await adminDb.collection("students").doc(docId).get();
    const studentData = studentSnap.data();

    if (!studentData?.classId) {
      return NextResponse.json(
        { error: "আগে ক্লাস সিলেক্ট করো (onboarding সম্পন্ন করো)" },
        { status: 400 }
      );
    }

    const classId: string = studentData.classId;
    const cacheKey = `${classId}_${subjectId}`;

    const cached = chaptersCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CHAPTERS_CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const subjectRef = adminDb
      .collection("classes")
      .doc(classId)
      .collection("subjects")
      .doc(subjectId);

    const subjectSnap = await subjectRef.get();

    if (!subjectSnap.exists) {
      return NextResponse.json(
        { error: "এই subject খুঁজে পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const chaptersSnap = await subjectRef.collection("chapters").get();

    const chapters: ChapterOption[] = chaptersSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? doc.id,
        author: data.author ?? undefined,
        order: typeof data.order === "number" ? data.order : 999,
      };
    });

    chapters.sort((a, b) => a.order - b.order);

    const responsePayload = {
      subject: {
        id: subjectSnap.id,
        name: subjectSnap.data()?.name ?? subjectSnap.id,
      },
      chapters,
    };

    chaptersCache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error("Error fetching chapters:", err);
    return NextResponse.json({ error: "অধ্যায় লোড করা সম্ভব হয়নি" }, { status: 500 });
  }
}