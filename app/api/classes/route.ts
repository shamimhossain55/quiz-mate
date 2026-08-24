import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export type ClassOption = {
  id: string;
  name: string;
  hasGroups: boolean;
};

let classesCache: { data: ClassOption[]; timestamp: number } | null = null;
const CLASSES_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  if (classesCache && Date.now() - classesCache.timestamp < CLASSES_CACHE_TTL_MS) {
    return NextResponse.json({ classes: classesCache.data });
  }

  try {
    const snap = await adminDb.collection("classes").get();

    const classes: ClassOption[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? doc.id,
        hasGroups: Boolean(data.hasGroups),
      };
    });

    // "class6" < "class7" < ... < "class9_10" < "class11_12" এভাবে সাজানোর জন্য
    // classId এর ভিতরের প্রথম সংখ্যা ধরে sort করা হচ্ছে
    classes.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    classesCache = { data: classes, timestamp: Date.now() };

    return NextResponse.json({ classes });
  } catch (err) {
    console.error("Error fetching classes:", err);
    if (classesCache) return NextResponse.json({ classes: classesCache.data });
    return NextResponse.json({ error: "ক্লাস লোড করা সম্ভব হয়নি" }, { status: 500 });
  }
}