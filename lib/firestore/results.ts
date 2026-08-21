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

const resultsCache = new Map<string, { data: Result[]; timestamp: number }>();
const RESULTS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function clearResultsCache(userId?: string) {
  if (userId) {
    resultsCache.delete(userId.toLowerCase());
  } else {
    resultsCache.clear();
  }
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
  if (userId) clearResultsCache(userId);
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
  const normalizedId = userId.toLowerCase();
  const cached = resultsCache.get(normalizedId);
  if (cached && Date.now() - cached.timestamp < RESULTS_CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const rawUserIds = Array.from(new Set([userId, userId.toLowerCase()]));
    let docsMap = new Map<string, any>();

    for (const uid of rawUserIds) {
      try {
        const q = query(
          collection(db, "results"),
          where("userId", "==", uid)
        );
        const snap = await getDocs(q);
        snap.docs.forEach((docSnap) => {
          docsMap.set(docSnap.id, docSnap.data());
        });
      } catch (e) {
        console.error(`Error querying results for ${uid}:`, e);
      }
    }

    const results: Result[] = Array.from(docsMap.entries()).map(([docId, data]) => {
      const rawDate = data.createdAt || data.submittedAt;
      const createdAt = rawDate?.toDate
        ? rawDate.toDate()
        : rawDate instanceof Date
        ? rawDate
        : rawDate
        ? new Date(rawDate)
        : new Date();

      const totalMarks = (data.correct || 0) + (data.wrong || 0);
      const calculatedPct = totalMarks > 0 ? Math.round(((data.score || 0) / totalMarks) * 100) : 0;

      return {
        id: docId,
        userId: data.userId || userId,
        quizId: data.quizId || "",
        chapterId: data.chapterId || "",
        score: data.score || 0,
        correct: data.correct || 0,
        wrong: data.wrong || 0,
        skipped: data.skipped || 0,
        percentage: data.percentage !== undefined ? data.percentage : calculatedPct,
        negativeMarking: Boolean(data.negativeMarking),
        timeTaken: data.timeTaken || 0,
        createdAt,
      };
    });

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    resultsCache.set(normalizedId, { data: results, timestamp: Date.now() });
    return results;
  } catch (err) {
    console.error("Error fetching user results:", err);
    return [];
  }
}