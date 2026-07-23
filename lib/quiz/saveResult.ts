import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";

interface SaveResultParams {
  userId: string;

  quizId: string;

  chapterId: string;

  score: number;

  correct: number;

  wrong: number;

  skipped: number;

  percentage: number;

  negativeMarking: boolean;

  timeTaken: number;
}

export async function saveResult({
  userId,
  quizId,
  chapterId,
  score,
  correct,
  wrong,
  skipped,
  percentage,
  negativeMarking,
  timeTaken,
}: SaveResultParams) {
  await addDoc(collection(db, "results"), {
    userId,

    quizId,

    chapterId,

    score,

    correct,

    wrong,

    skipped,

    percentage,

    negativeMarking,

    timeTaken,

    submittedAt: serverTimestamp(),
  });
}