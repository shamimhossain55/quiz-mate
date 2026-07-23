import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { Quiz } from "@/types/firestore";

export async function getQuizByChapterId(
  chapterId: string
): Promise<Quiz | null> {
  const q = query(
    collection(db, "quizzes"),
    where("chapterId", "==", chapterId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const quiz = snapshot.docs[0];

  return {
    id: quiz.id,
    ...(quiz.data() as Omit<Quiz, "id">),
  };
}