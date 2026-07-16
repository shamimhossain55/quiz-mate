import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

const VALID_GROUPS = ["science", "commerce", "arts"] as const;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const classId: string | undefined = body?.classId;
  const group: string | undefined = body?.group;

  if (!classId) {
    return NextResponse.json({ error: "classId দেওয়া হয়নি" }, { status: 400 });
  }

  // classId টা আসলেই আছে কিনা এবং hasGroups অনুযায়ী group ঠিকমতো দেওয়া হয়েছে কিনা যাচাই
  const classRef = adminDb.collection("classes").doc(classId);
  const classSnap = await classRef.get();

  if (!classSnap.exists) {
    return NextResponse.json({ error: "এই classId খুঁজে পাওয়া যায়নি" }, { status: 400 });
  }

  const classData = classSnap.data()!;
  const hasGroups = Boolean(classData.hasGroups);

  if (hasGroups) {
    if (!group || !VALID_GROUPS.includes(group as (typeof VALID_GROUPS)[number])) {
      return NextResponse.json(
        { error: "এই ক্লাসের জন্য সঠিক group (science/commerce/arts) দেওয়া হয়নি" },
        { status: 400 }
      );
    }
  }

  const email = session.user.email;
  const docId = email.toLowerCase();
  const studentRef = adminDb.collection("students").doc(docId);

  const updateData = {
    classId,
    className: classData.name ?? classId,
    group: hasGroups ? group : null,
    profileComplete: true,
  };

  await studentRef.set(updateData, { merge: true });

  return NextResponse.json({ success: true, student: updateData });
}