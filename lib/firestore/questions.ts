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
  chapterIdOrQuizId: string,
  subjectId?: string
): Promise<Question[]> {
  try {
    const questionsRef = collection(db, "questions");

    // 1. Query by chapterId
    const q1 = query(questionsRef, where("chapterId", "==", chapterIdOrQuizId));
    let snapshot = await getDocs(q1);

    // 2. If empty, try querying by quizId
    if (snapshot.empty && chapterIdOrQuizId) {
      const q2 = query(questionsRef, where("quizId", "==", chapterIdOrQuizId));
      snapshot = await getDocs(q2);
    }

    // 3. If empty, try querying by subjectId
    if (snapshot.empty && subjectId) {
      const q3 = query(questionsRef, where("subjectId", "==", subjectId));
      snapshot = await getDocs(q3);
    }

    // 4. Fallback: scan and match client-side if indexes are missing or for complex queries
    if (snapshot.empty) {
      const allSnap = await getDocs(questionsRef);
      if (!allSnap.empty) {
        const matches = allSnap.docs.filter((docSnap) => {
          const d = docSnap.data();
          return (
            d.chapterId === chapterIdOrQuizId ||
            d.quizId === chapterIdOrQuizId ||
            (subjectId && d.subjectId === subjectId)
          );
        });
        if (matches.length > 0) {
          return matches.map((docSnap) => parseQuestionDoc(docSnap));
        }
      }
      return [];
    }

    return snapshot.docs.map((docSnap) => parseQuestionDoc(docSnap));
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