import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Result } from "@/types/firestore";

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
    createdAt: serverTimestamp(),
  });
}

export async function getUserResults(userId: string): Promise<Result[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "results"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        quizId: data.quizId,
        chapterId: data.chapterId,
        score: data.score || 0,
        correct: data.correct || 0,
        wrong: data.wrong || 0,
        skipped: data.skipped || 0,
        percentage: data.percentage || 0,
        negativeMarking: Boolean(data.negativeMarking),
        timeTaken: data.timeTaken || 0,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      };
    });
  } catch (err) {
    console.error("Error fetching user results:", err);
    return [];
  }
}