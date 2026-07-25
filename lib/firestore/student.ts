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

export async function getStudentProfile(studentId: string): Promise<Student | null> {
  if (!studentId) return null;
  try {
    const studentRef = doc(db, "students", studentId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name || studentId.split("@")[0] || "Student",
      email: data.email || studentId,
      point: data.point || 0,
      totalExam: data.totalExam || 0,
      streak: data.streak || 1,
      level: data.level || Math.floor((data.point || 0) / 100) + 1,
      avatarUrl: data.avatarUrl || null,
      classId: data.classId || "class6",
    };
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return null;
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

export async function getTopStudents(limitCount = 10): Promise<Student[]> {
  try {
    const q = query(
      collection(db, "students"),
      orderBy("point", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: docSnap.id,
        name: data.name || "শিক্ষার্থী",
        email: data.email || "",
        point: data.point || 0,
        totalExam: data.totalExam || 0,
        streak: data.streak || 1,
        level: data.level || Math.floor((data.point || 0) / 100) + 1,
        avatarUrl: data.avatarUrl || null,
        classId: data.classId || "class6",
      };
    });
  } catch (error) {
    console.error("Error fetching top students:", error);
    return [];
  }
}