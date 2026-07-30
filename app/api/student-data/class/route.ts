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
  const name: string | undefined = body?.name;
  const division: string | undefined = body?.division;
  const district: string | undefined = body?.district;
  const upazila: string | undefined = body?.upazila;

  if (!classId) {
    return NextResponse.json({ error: "শ্রেণী নির্বাচন করা হয়নি" }, { status: 400 });
  }

  const CLASS_NAME_MAP: Record<string, string> = {
    class6: "ষষ্ঠ শ্রেণী",
    class7: "সপ্তম শ্রেণী",
    class8: "অষ্টম শ্রেণী",
    class9: "নবম শ্রেণী",
    class10: "দশম শ্রেণী",
    class9_10: "নবম-দশম শ্রেণী (SSC)",
    class11: "একাদশ শ্রেণী",
    class12: "দ্বাদশ শ্রেণী",
    class11_12: "একাদশ-দ্বাদশ শ্রেণী (HSC)",
  };

  const isHighSchoolOrCollege = ["class9_10", "class9", "class10", "class11_12", "class11", "class12"].includes(classId);
  const selectedGroup = isHighSchoolOrCollege ? (group || "science") : "all";

  const email = session.user.email;
  const docId = email.toLowerCase();
  const studentRef = adminDb.collection("students").doc(docId);

  const updateData: Record<string, any> = {
    classId,
    className: CLASS_NAME_MAP[classId] || classId,
    group: selectedGroup,
    profileComplete: true,
    updatedAt: new Date().toISOString(),
  };

  if (name?.trim()) updateData.name = name.trim();
  if (division?.trim()) updateData.division = division.trim();
  if (district?.trim()) updateData.district = district.trim();
  if (upazila?.trim()) updateData.upazila = upazila.trim();

  await studentRef.set(updateData, { merge: true });

  return NextResponse.json({ success: true, student: updateData });
}