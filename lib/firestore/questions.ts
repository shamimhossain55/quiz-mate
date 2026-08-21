import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { Question } from "@/types/firestore";

// Cache questions in memory for 10 minutes to prevent repeat Firestore reads
const questionsCache = new Map<string, { data: Question[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function clearQuestionsCache(targetKey?: string) {
  if (targetKey) {
    questionsCache.delete(targetKey);
  } else {
    questionsCache.clear();
  }
}

export async function getQuestions(
  chapterIdOrQuizId: string,
  subjectId?: string
): Promise<Question[]> {
  if (!chapterIdOrQuizId && !subjectId) return [];

  const cacheKey = `${chapterIdOrQuizId || ""}_${subjectId || ""}`;
  const cached = questionsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const questionsRef = collection(db, "questions");

    // 1. Query by chapterId (most common)
    if (chapterIdOrQuizId) {
      const q1 = query(questionsRef, where("chapterId", "==", chapterIdOrQuizId), limit(100));
      const snap1 = await getDocs(q1);

      if (!snap1.empty) {
        const questions = snap1.docs.map((docSnap) => parseQuestionDoc(docSnap));
        questionsCache.set(cacheKey, { data: questions, timestamp: Date.now() });
        return questions;
      }

      // 2. Query by quizId
      const q2 = query(questionsRef, where("quizId", "==", chapterIdOrQuizId), limit(100));
      const snap2 = await getDocs(q2);

      if (!snap2.empty) {
        const questions = snap2.docs.map((docSnap) => parseQuestionDoc(docSnap));
        questionsCache.set(cacheKey, { data: questions, timestamp: Date.now() });
        return questions;
      }
    }

    // 3. Query by subjectId
    if (subjectId) {
      const q3 = query(questionsRef, where("subjectId", "==", subjectId), limit(100));
      const snap3 = await getDocs(q3);

      if (!snap3.empty) {
        const questions = snap3.docs.map((docSnap) => parseQuestionDoc(docSnap));
        questionsCache.set(cacheKey, { data: questions, timestamp: Date.now() });
        return questions;
      }
    }

    return [];
  } catch (err) {
    console.error("Error fetching questions from Firestore:", err);
    return [];
  }
}

function parseQuestionDoc(docSnap: any): Question {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    chapterId: d.chapterId || "",
    question: d.questionText || d.question || "প্রশ্ন",
    options: d.options || ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
    correctAnswer: d.correctAnswer ?? 0,
    explanation: d.explanation || "",
    order: d.order || 1,
  } as Question;
}