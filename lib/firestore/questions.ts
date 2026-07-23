import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { Question } from "@/types/firestore";

export async function getQuestions(
  quizId: string
): Promise<Question[]> {
  const q = query(
    collection(db, "questions"),
    where("quizId", "==", quizId),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Question, "id">),
  }));
}