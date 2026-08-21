import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase-client";
import { Quiz, QuizQuestionItem } from "@/types/firestore";

/**
 * Checks if quiz class matches the student's class
 */
export function isQuizClassMatching(quizClassId?: string, studentClassId?: string): boolean {
  if (!quizClassId || quizClassId === "all") return true;
  if (!studentClassId) return true;
  if (quizClassId === studentClassId) return true;

  // SSC Class 9/10
  if (
    quizClassId === "class9_10" &&
    (studentClassId === "class9" || studentClassId === "class10" || studentClassId === "class9_10")
  ) {
    return true;
  }

  // HSC Class 11/12
  if (
    quizClassId === "class11_12" &&
    (studentClassId === "class11" || studentClassId === "class12" || studentClassId === "class11_12")
  ) {
    return true;
  }

  return false;
}

export function parseQuizDoc(docSnap: any): Quiz {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    name: d.title || d.name || "কুইজ",
    title: d.title || d.name || "কুইজ",
    classId: d.classId || "all",
    subjectId: d.subjectId || "",
    subjectName: d.subjectName || d.subject || "সাধারণ",
    subject: d.subject || d.subjectName || "সাধারণ",
    chapterId: d.chapterId || "",
    chapterName: d.chapterName || "",
    duration: d.duration || 10,
    totalQuestions: d.totalQuestions || d.questionsCount || (d.questions?.length || 10),
    questionsCount: d.questionsCount || d.totalQuestions || (d.questions?.length || 10),
    negativeMarking: d.negativeMarking || false,
    status: d.status || "published",
    isLive: d.isLive || d.status === "live",
    startTime: d.startTime || null,
    endTime: d.endTime || null,
    questions: d.questions || [],
    attempts: d.attempts || 0,
    avgScore: d.avgScore || "০%",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function getQuizByChapterId(chapterId: string): Promise<Quiz | null> {
  try {
    const q = query(collection(db, "quizzes"), where("chapterId", "==", chapterId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return parseQuizDoc(snapshot.docs[0]);
  } catch (err) {
    console.error("Error getQuizByChapterId:", err);
    return null;
  }
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return parseQuizDoc(docSnap);
  } catch (err) {
    console.error("Error getQuizById:", err);
    return null;
  }
}

/**
 * Finds the currently active live quiz for a student's class
 */
export async function getActiveLiveQuiz(studentClassId?: string): Promise<Quiz | null> {
  try {
    const snapshot = await getDocs(collection(db, "quizzes"));
    if (snapshot.empty) return null;

    const now = Date.now();
    const liveQuizzes: Quiz[] = [];

    for (const docSnap of snapshot.docs) {
      const quiz = parseQuizDoc(docSnap);

      // Check class match
      if (!isQuizClassMatching(quiz.classId, studentClassId)) {
        continue;
      }

      // Check if explicitly live
      if (quiz.status === "live" || quiz.isLive) {
        // If endTime is set and passed, auto-complete
        if (quiz.endTime) {
          const endMs = new Date(quiz.endTime).getTime();
          if (endMs <= now) {
            // Expired live quiz
            updateDoc(doc(db, "quizzes", quiz.id), { status: "completed", isLive: false }).catch(() => {});
            continue;
          }
        }
        liveQuizzes.push(quiz);
        continue;
      }

      // Check if scheduled and currently within time window
      if (quiz.status === "scheduled" && quiz.startTime && quiz.endTime) {
        const startMs = new Date(quiz.startTime).getTime();
        const endMs = new Date(quiz.endTime).getTime();
        if (now >= startMs && now <= endMs) {
          liveQuizzes.push({ ...quiz, status: "live", isLive: true });
        }
      }
    }

    // Return the most recent live quiz if any
    return liveQuizzes.length > 0 ? liveQuizzes[0] : null;
  } catch (err) {
    console.error("Error getActiveLiveQuiz:", err);
    return null;
  }
}

let allQuizzesCache: { data: Quiz[]; timestamp: number } | null = null;
const QUIZZES_CACHE_TTL_MS = 10 * 60 * 1000;

export function clearQuizzesCache() {
  allQuizzesCache = null;
}

/**
 * Real-time listener for active live quizzes for a student's class
 * Filters by status ('live' or 'scheduled') instead of listening to the whole collection
 */
export function listenToActiveLiveQuiz(
  studentClassId: string | undefined,
  callback: (quiz: Quiz | null) => void
): () => void {
  try {
    const q = query(
      collection(db, "quizzes"),
      where("status", "in", ["live", "scheduled"])
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const liveQuizzes: Quiz[] = [];

        snapshot.docs.forEach((docSnap) => {
          const quiz = parseQuizDoc(docSnap);
          if (!isQuizClassMatching(quiz.classId, studentClassId)) return;

          if (quiz.status === "live" || quiz.isLive) {
            if (quiz.endTime) {
              const endMs = new Date(quiz.endTime).getTime();
              if (endMs <= now) {
                return;
              }
            }
            liveQuizzes.push(quiz);
          } else if (quiz.status === "scheduled" && quiz.startTime && quiz.endTime) {
            const startMs = new Date(quiz.startTime).getTime();
            const endMs = new Date(quiz.endTime).getTime();
            if (now >= startMs && now <= endMs) {
              liveQuizzes.push({ ...quiz, status: "live", isLive: true });
            }
          }
        });

        callback(liveQuizzes.length > 0 ? liveQuizzes[0] : null);
      },
      (err) => {
        console.error("Quiz listener error:", err);
        callback(null);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.error("Failed to setup listenToActiveLiveQuiz", e);
    return () => {};
  }
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  if (allQuizzesCache && Date.now() - allQuizzesCache.timestamp < QUIZZES_CACHE_TTL_MS) {
    return allQuizzesCache.data;
  }
  try {
    const snapshot = await getDocs(collection(db, "quizzes"));
    if (snapshot.empty) return [];
    const quizzes = snapshot.docs.map((docSnap) => parseQuizDoc(docSnap));
    allQuizzesCache = { data: quizzes, timestamp: Date.now() };
    return quizzes;
  } catch (err) {
    console.error("Error getAllQuizzes:", err);
    return [];
  }
}

export async function saveQuizDoc(quiz: Partial<Quiz>): Promise<string> {
  const isNew = !quiz.id;
  const docRef = isNew ? doc(collection(db, "quizzes")) : doc(db, "quizzes", quiz.id!);

  const questionsCount = quiz.questions?.length || quiz.totalQuestions || quiz.questionsCount || 10;
  const duration = Number(quiz.duration) || 10;

  let startTime = quiz.startTime || null;
  let endTime = quiz.endTime || null;

  if (quiz.status === "live") {
    if (!startTime) startTime = new Date().toISOString();
    if (!endTime) endTime = new Date(Date.now() + duration * 60 * 1000).toISOString();
  }

  const payload: Record<string, any> = {
    title: quiz.title || quiz.name || "নতুন কুইজ",
    name: quiz.title || quiz.name || "নতুন কুইজ",
    classId: quiz.classId || "all",
    subjectId: quiz.subjectId || "",
    subjectName: quiz.subjectName || quiz.subject || "সাধারণ",
    subject: quiz.subjectName || quiz.subject || "সাধারণ",
    chapterId: quiz.chapterId || "",
    chapterName: quiz.chapterName || "",
    duration,
    totalQuestions: questionsCount,
    questionsCount,
    negativeMarking: !!quiz.negativeMarking,
    status: quiz.status || "published",
    isLive: quiz.status === "live",
    startTime,
    endTime,
    questions: quiz.questions || [],
    attempts: quiz.attempts ?? 0,
    avgScore: quiz.avgScore || "০%",
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
    await setDoc(docRef, payload);
  } else {
    await updateDoc(docRef, payload);
  }

  return docRef.id;
}

export async function toggleQuizLiveStatus(
  quizId: string,
  isLive: boolean,
  durationMinutes = 15
): Promise<void> {
  const docRef = doc(db, "quizzes", quizId);
  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

  if (isLive) {
    await updateDoc(docRef, {
      status: "live",
      isLive: true,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(docRef, {
      status: "completed",
      isLive: false,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteQuizDoc(quizId: string): Promise<void> {
  await deleteDoc(doc(db, "quizzes", quizId));
}