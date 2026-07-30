import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const currentEmail = session.user.email.toLowerCase();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("query")?.trim() || searchParams.get("uid")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const queryUpper = q.toUpperCase();
  const queryLower = q.toLowerCase();

  // Search by exact customUid (case insensitive) or prefix
  const snapCustomUid = await adminDb
    .collection("students")
    .where("customUidLower", "==", queryLower)
    .limit(5)
    .get();

  let results: any[] = snapCustomUid.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // If no exact UID match, try uppercase search
  if (results.length === 0) {
    const snapCustomUidUpper = await adminDb
      .collection("students")
      .where("customUid", "==", queryUpper)
      .limit(5)
      .get();
    
    results = snapCustomUidUpper.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // If still empty, search all students and filter by name or customUid containing query
  if (results.length === 0) {
    const allStudentsSnap = await adminDb.collection("students").limit(50).get();
    results = allStudentsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((u: any) => {
        if (u.email === currentEmail) return false;
        const nameMatch = u.name?.toLowerCase().includes(queryLower);
        const uidMatch = u.customUid?.toLowerCase().includes(queryLower);
        const emailMatch = u.email?.toLowerCase().includes(queryLower);
        return nameMatch || uidMatch || emailMatch;
      })
      .slice(0, 10);
  }

  // Filter out self
  const filteredUsers = results
    .filter((u) => u.email?.toLowerCase() !== currentEmail)
    .map((u) => ({
      email: u.email,
      name: u.name || "শিক্ষার্থী",
      customUid: u.customUid || "000000",
      avatarUrl: u.avatarUrl || null,
      level: u.level || Math.floor((u.point || 0) / 100) + 1,
      point: u.point || 0,
      streak: u.streak || 1,
    }));

  return NextResponse.json({ users: filteredUsers });
}
