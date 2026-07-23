import {
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";

interface UpdateStudentStatsParams {
  studentId: string;
  point: number;
}

export async function updateStudentStats({
  studentId,
  point,
}: UpdateStudentStatsParams) {
  const studentRef = doc(db, "students", studentId);

  await updateDoc(studentRef, {
    point: increment(point),
    totalExam: increment(1),
  });
}