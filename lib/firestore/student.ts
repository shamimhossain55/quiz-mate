import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Student } from "@/types/firestore";

interface UpdateStudentStatsParams {
  studentId: string;
  name?: string;
  email?: string;
  point: number;
}

/** Ensures the name field never contains an email address */
function cleanName(name: string | undefined | null, emailFallback: string): string {
  if (name && !name.includes("@") && name.trim().length > 0) return name.trim();
  // name is missing or is an email — derive a readable username from email
  const username = emailFallback.split("@")[0] || "শিক্ষার্থী";
  // Capitalize first letter
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export async function getStudentProfile(studentId: string): Promise<Student | null> {
  if (!studentId) return null;
  try {
    const studentRef = doc(db, "students", studentId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    const email = data.email || studentId;
    return {
      id: snap.id,
      name: cleanName(data.name, email),
      email,
      customUid: data.customUid || "",
      division: data.division || "",
      district: data.district || "",
      upazila: data.upazila || "",
      point: data.point || 0,
      totalExam: data.totalExam || 0,
      streak: data.streak || 1,
      level: data.level || Math.floor((data.point || 0) / 100) + 1,
      avatarUrl: data.avatarUrl || null,
      classId: data.classId || "class6",
      className: data.className || "",
      group: data.group || "all",
      profileComplete: data.profileComplete ?? false,
    };
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return null;
  }
}

export async function updateStudentProfile({
  studentId,
  classId,
  group,
  name,
  avatarUrl,
}: {
  studentId: string;
  classId?: string;
  group?: string;
  name?: string;
  avatarUrl?: string | null;
}) {
  if (!studentId) return;
  try {
    const studentRef = doc(db, "students", studentId);
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (classId !== undefined) updateData.classId = classId;
    if (group !== undefined) updateData.group = group;
    if (name !== undefined) updateData.name = name;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    await setDoc(studentRef, updateData, { merge: true });
  } catch (error) {
    console.error("Error updating student profile:", error);
  }
}

export async function updateStudentStats({
  studentId,
  name,
  email,
  point,
}: UpdateStudentStatsParams) {
  if (!studentId) return;
  try {
    const studentRef = doc(db, "students", studentId);
    await setDoc(
      studentRef,
      {
        name: name || studentId.split("@")[0] || "Student",
        email: email || studentId,
        point: increment(point),
        totalExam: increment(1),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating student stats:", error);
  }
}

export async function getTopStudents(limitCount = 50): Promise<Student[]> {
  try {
    const q = query(
      collection(db, "students"),
      orderBy("point", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const email = data.email || docSnap.id;
      return {
        id: docSnap.id,
        uid: docSnap.id,
        customUid: data.customUid || "",
        name: cleanName(data.name, email),
        email,
        division: data.division || "",
        district: data.district || "",
        upazila: data.upazila || "",
        point: data.point || 0,
        totalExam: data.totalExam || 0,
        streak: data.streak || 1,
        level: data.level || Math.floor((data.point || 0) / 100) + 1,
        avatarUrl: data.avatarUrl || null,
        classId: data.classId || "class6",
        className: data.className || "",
        group: data.group || "all",
      };
    });
  } catch (error) {
    console.error("Error fetching top students:", error);
    return [];
  }
}