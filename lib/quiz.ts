import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "./firebase-client";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
 order: number;
}

export async function getQuizQuestions(
  classId: string,
  subjectId: string,
  chapterId: string,
  quizId: string
): Promise<QuizQuestion[]> {
  const ref = collection(
    db,
    "classes",
    classId,
    "subjects",
    subjectId,
    "chapters",
    chapterId,
    "quizzes",
    quizId,
    "questions"
  );

  const q = query(ref, orderBy("order"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<QuizQuestion, "id">),
  }));
}