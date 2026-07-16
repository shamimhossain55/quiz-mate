import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export type ClassOption = {
  id: string;
  name: string;
  hasGroups: boolean;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

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

  return NextResponse.json({ classes });
}