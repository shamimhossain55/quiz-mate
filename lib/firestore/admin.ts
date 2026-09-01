import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { BannerSlide } from "@/lib/firestore/banners";

// ===== TYPES =====
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  class?: string;
  xp?: number;
  streak?: number;
  status: "active" | "inactive" | "banned";
  role?: "super_admin" | "admin" | "moderator" | "content_creator" | "user";
  createdAt?: any;
  avatarUrl?: string | null;
};

// ===== CACHING LAYER =====
const ADMIN_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache
let classesCache: { data: AdminClass[]; timestamp: number } | null = null;
let chaptersCache: { data: AdminChapter[]; timestamp: number } | null = null;
let studentsCache: { data: AdminUser[]; timestamp: number } | null = null;
let subjectsCache: { data: AdminSubject[]; timestamp: number } | null = null;
let quizzesCache: { data: AdminQuiz[]; timestamp: number } | null = null;
let questionsCache: { data: AdminQuestion[]; timestamp: number } | null = null;
let bannersCache: { data: BannerSlide[]; timestamp: number } | null = null;

export function invalidateAdminCache(
  key?: "classes" | "chapters" | "students" | "subjects" | "quizzes" | "questions" | "banners"
) {
  if (!key) {
    classesCache = null;
    chaptersCache = null;
    studentsCache = null;
    subjectsCache = null;
    quizzesCache = null;
    questionsCache = null;
    bannersCache = null;
    return;
  }
  if (key === "classes") classesCache = null;
  if (key === "chapters") chaptersCache = null;
  if (key === "students") studentsCache = null;
  if (key === "subjects") subjectsCache = null;
  if (key === "quizzes") quizzesCache = null;
  if (key === "questions") questionsCache = null;
  if (key === "banners") bannersCache = null;
}

export type AdminClass = {
  id: string;
  name: string;
  order: number;
};

export type AdminSubject = {
  id: string;
  name: string;
  slug: string;
  classId: string;
  group?: string;
  totalQuizzes?: number;
  totalStudents?: number;
  color?: string;
  order?: number;
  imageUrl?: string;
  sections?: string[];
};

export type AdminChapter = {
  id: string;
  name: string;
  subjectId: string;
  chapterNo: number;
  order: number;
  sectionName?: string;
};

export type AdminQuiz = {
  id: string;
  name: string;
  title?: string;
  classId?: string;
  subjectId?: string;
  subject?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
  duration?: number;
  questionsCount?: number;
  totalQuestions?: number;
  negativeMarking?: boolean;
  attempts?: number;
  avgScore?: string;
  status: "live" | "scheduled" | "published" | "draft" | "completed";
  isLive?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  questions?: Array<{
    id?: string;
    questionText?: string;
    question?: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
  createdAt?: any;
  updatedAt?: any;
};

export type AdminQuestion = {
  id: string;
  quizId?: string;
  classId?: string;
  subjectId?: string;
  chapterId?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

// ===== CLASS & CHAPTER OPERATIONS =====
export async function getAllClasses(force = false): Promise<AdminClass[]> {
  if (!force && classesCache && Date.now() - classesCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return classesCache.data;
  }
  try {
    const querySnapshot = await getDocs(collection(db, "classes"));
    if (querySnapshot.empty) {
      const fallback = [
        { id: "class6", name: "ষষ্ঠ শ্রেণী (Class 6)", order: 1 },
        { id: "class7", name: "সপ্তম শ্রেণী (Class 7)", order: 2 },
        { id: "class8", name: "অষ্টম শ্রেণী (Class 8)", order: 3 },
        { id: "class9_10", name: "নবম-দশম শ্রেণী (Class 9-10 / SSC)", order: 4 },
        { id: "class11_12", name: "একাদশ-দ্বাদশ শ্রেণী (Class 11-12 / HSC)", order: 5 },
      ];
      classesCache = { data: fallback, timestamp: Date.now() };
      return fallback;
    }
    const list = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || docSnap.id,
      order: docSnap.data().order || 1,
    }));
    classesCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching classes:", err);
    return [
      { id: "class6", name: "ষষ্ঠ শ্রেণী (Class 6)", order: 1 },
      { id: "class7", name: "সপ্তম শ্রেণী (Class 7)", order: 2 },
      { id: "class8", name: "অষ্টম শ্রেণী (Class 8)", order: 3 },
      { id: "class9_10", name: "নবম-দশম শ্রেণী (Class 9-10 / SSC)", order: 4 },
      { id: "class11_12", name: "একাদশ-দ্বাদশ শ্রেণী (Class 11-12 / HSC)", order: 5 },
    ];
  }
}

export async function getChaptersBySubject(subjectId: string): Promise<AdminChapter[]> {
  try {
    if (chaptersCache && Date.now() - chaptersCache.timestamp < ADMIN_CACHE_TTL_MS) {
      const filtered = chaptersCache.data.filter((c) => c.subjectId === subjectId);
      if (filtered.length > 0) return filtered;
    }

    const q = query(collection(db, "chapters"), where("subjectId", "==", subjectId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [
        { id: `${subjectId}_ch1`, name: "অধ্যায় ১: মৌলিক ধারণা", subjectId, chapterNo: 1, order: 1 },
        { id: `${subjectId}_ch2`, name: "অধ্যায় ২: বিস্তারিত আলোচনা", subjectId, chapterNo: 2, order: 2 },
        { id: `${subjectId}_ch3`, name: "অধ্যায় ৩: অনুশীলন ও সমাধান", subjectId, chapterNo: 3, order: 3 },
      ];
    }
    const docs = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const numNo = Number(data.chapterNo ?? data.order) || 1;
      return {
        id: docSnap.id,
        name: data.name || data.title || docSnap.id,
        subjectId: data.subjectId || subjectId,
        chapterNo: numNo,
        order: Number(data.order ?? numNo) || 1,
        sectionName: data.sectionName || undefined,
      };
    });
    return docs.sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0));
  } catch (err) {
    console.error("Error fetching chapters:", err);
    return [
      { id: `${subjectId}_ch1`, name: "অধ্যায় ১: মৌলিক ধারণা", subjectId, chapterNo: 1, order: 1 },
      { id: `${subjectId}_ch2`, name: "অধ্যায় ২: বিস্তারিত আলোচনা", subjectId, chapterNo: 2, order: 2 },
    ];
  }
}

export async function getAllChapters(force = false): Promise<AdminChapter[]> {
  if (!force && chaptersCache && Date.now() - chaptersCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return chaptersCache.data;
  }
  try {
    const querySnapshot = await getDocs(collection(db, "chapters"));
    if (querySnapshot.empty) return [];
    const docs = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const numNo = Number(data.chapterNo ?? data.order) || 1;
      return {
        id: docSnap.id,
        name: data.name || data.title || docSnap.id,
        subjectId: data.subjectId || "",
        chapterNo: numNo,
        order: Number(data.order ?? numNo) || 1,
        sectionName: data.sectionName || undefined,
      };
    });
    const sorted = docs.sort((a, b) => {
      const diff = (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0);
      if (diff !== 0) return diff;
      return (a.name || "").localeCompare(b.name || "", "bn", { numeric: true });
    });
    chaptersCache = { data: sorted, timestamp: Date.now() };
    return sorted;
  } catch (err) {
    console.error("Error fetching all chapters:", err);
    return [];
  }
}

export async function addChapter(chapter: Omit<AdminChapter, "id">): Promise<string> {
  const docRef = doc(collection(db, "chapters"));
  const cleanChapter: Record<string, any> = {};
  Object.keys(chapter).forEach((key) => {
    const val = (chapter as any)[key];
    if (val !== undefined) {
      cleanChapter[key] = val;
    }
  });
  await setDoc(docRef, {
    ...cleanChapter,
    createdAt: new Date(),
  });
  invalidateAdminCache("chapters");
  return docRef.id;
}

export async function updateChapter(id: string, chapter: Partial<AdminChapter>): Promise<void> {
  const cRef = doc(db, "chapters", id);
  const cleanChapter: Record<string, any> = {};
  Object.keys(chapter).forEach((key) => {
    const val = (chapter as any)[key];
    if (val !== undefined) {
      cleanChapter[key] = val;
    }
  });
  await updateDoc(cRef, cleanChapter);
  invalidateAdminCache("chapters");
}

export async function deleteChapter(id: string): Promise<void> {
  await deleteDoc(doc(db, "chapters", id));
  invalidateAdminCache("chapters");
}

// ===== USER OPERATIONS =====
export async function getAllStudents(force = false): Promise<AdminUser[]> {
  if (!force && studentsCache && Date.now() - studentsCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return studentsCache.data;
  }
  try {
    const q = query(collection(db, "students"), limit(60));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];
    const list = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || "নামহীন ইউজার",
        email: data.email || "email@domain.com",
        class: data.className || data.class || "ক্লাস ৯",
        xp: data.point || data.xp || 0,
        streak: data.streak || 0,
        status: data.status || "active",
        role: data.role || (data.isAdmin ? "admin" : "user"),
        avatarUrl: data.avatarUrl || null,
      };
    });
    studentsCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching students:", err);
    return [];
  }
}

export async function addStudent(user: Omit<AdminUser, "id">): Promise<string> {
  const docRef = doc(collection(db, "students"));
  await setDoc(docRef, {
    ...user,
    createdAt: new Date(),
  });
  invalidateAdminCache("students");
  return docRef.id;
}

export async function updateStudentStatus(id: string, status: "active" | "inactive" | "banned") {
  const userRef = doc(db, "students", id);
  await updateDoc(userRef, { status });
  invalidateAdminCache("students");
}

export async function updateStudentRole(
  id: string,
  role: "super_admin" | "admin" | "moderator" | "content_creator" | "user",
  email?: string
) {
  const res = await fetch("/api/admin/users/role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id, email: email || id, role }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || " Failed to update user role");
  }
  invalidateAdminCache("students");
}

export async function deleteStudent(id: string) {
  await deleteDoc(doc(db, "students", id));
  invalidateAdminCache("students");
}

// ===== SUBJECT OPERATIONS =====
export async function getAllSubjects(force = false): Promise<AdminSubject[]> {
  if (!force && subjectsCache && Date.now() - subjectsCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return subjectsCache.data;
  }
  try {
    const querySnapshot = await getDocs(collection(db, "subjects"));
    if (querySnapshot.empty) return [];
    const list = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || docSnap.id,
      slug: docSnap.data().slug || docSnap.id,
      classId: docSnap.data().classId || "class6",
      group: docSnap.data().group || "all",
      totalQuizzes: docSnap.data().totalQuizzes || 10,
      totalStudents: docSnap.data().totalStudents || 350,
      color: docSnap.data().color || "#0D9488",
      imageUrl: docSnap.data().imageUrl || undefined,
      sections: docSnap.data().sections || undefined,
    }));
    subjectsCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
}

import { clearSubjectCache } from "@/lib/firestore/subjects";

function notifySubjectsUpdated() {
  invalidateAdminCache("subjects");
  clearSubjectCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("qm_subjects_updated"));
    localStorage.removeItem("qm_cached_dashboard_subjects");
  }
}

export async function addSubject(subject: AdminSubject): Promise<void> {
  const subjectId = subject.id || `${subject.classId}_${subject.slug}`;
  await setDoc(doc(db, "subjects", subjectId), {
    name: subject.name,
    slug: subject.slug,
    classId: subject.classId,
    group: subject.group || "all",
    color: subject.color || "#0D9488",
    order: subject.order || 1,
    imageUrl: subject.imageUrl || "",
    sections: subject.sections || [],
  });
  notifySubjectsUpdated();
}

export async function updateSubject(id: string, subject: Partial<AdminSubject>): Promise<void> {
  const subRef = doc(db, "subjects", id);
  const cleanData: Record<string, any> = {};
  if (subject.name !== undefined) cleanData.name = subject.name;
  if (subject.slug !== undefined) cleanData.slug = subject.slug;
  if (subject.classId !== undefined) cleanData.classId = subject.classId;
  if (subject.group !== undefined) cleanData.group = subject.group;
  if (subject.color !== undefined) cleanData.color = subject.color;
  if (subject.imageUrl !== undefined) cleanData.imageUrl = subject.imageUrl;
  if (subject.sections !== undefined) cleanData.sections = subject.sections;
  await updateDoc(subRef, cleanData);
  notifySubjectsUpdated();
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, "subjects", id));
  notifySubjectsUpdated();
}


// ===== QUIZ OPERATIONS =====
export async function getAllQuizzes(force = false): Promise<AdminQuiz[]> {
  if (!force && quizzesCache && Date.now() - quizzesCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return quizzesCache.data;
  }
  try {
    const q = query(collection(db, "quizzes"), limit(60));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];
    const list = querySnapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      const questionsCount = d.questions?.length || d.totalQuestions || d.questionsCount || 0;
      return {
        id: docSnap.id,
        name: d.title || d.name || "কুইজ",
        title: d.title || d.name || "কুইজ",
        subject: d.subject || d.subjectName || "সাধারণ",
        subjectName: d.subjectName || d.subject || "সাধারণ",
        classId: d.classId || "all",
        subjectId: d.subjectId || "",
        chapterId: d.chapterId || "",
        chapterName: d.chapterName || "",
        duration: d.duration || 10,
        questionsCount,
        totalQuestions: questionsCount,
        negativeMarking: !!d.negativeMarking,
        attempts: d.attempts || 0,
        avgScore: d.avgScore || "০%",
        status: d.status || "published",
        isLive: d.status === "live" || !!d.isLive,
        startTime: d.startTime || null,
        endTime: d.endTime || null,
        questions: d.questions || [],
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      };
    });
    quizzesCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    return [];
  }
}

export async function addQuiz(quiz: Omit<AdminQuiz, "id">): Promise<string> {
  const docRef = doc(collection(db, "quizzes"));
  const duration = Number(quiz.duration) || 10;
  const questionsCount = quiz.questions?.length || quiz.questionsCount || 10;

  let startTime = quiz.startTime || null;
  let endTime = quiz.endTime || null;
  if (quiz.status === "live") {
    if (!startTime) startTime = new Date().toISOString();
    if (!endTime) endTime = new Date(Date.now() + duration * 60 * 1000).toISOString();
  }

  await setDoc(docRef, {
    title: quiz.name || quiz.title || "নতুন কুইজ",
    name: quiz.name || quiz.title || "নতুন কুইজ",
    subject: quiz.subject || quiz.subjectName || "সাধারণ",
    subjectName: quiz.subjectName || quiz.subject || "সাধারণ",
    classId: quiz.classId || "all",
    subjectId: quiz.subjectId || "",
    chapterId: quiz.chapterId || "",
    chapterName: quiz.chapterName || "",
    duration,
    questionsCount,
    totalQuestions: questionsCount,
    negativeMarking: !!quiz.negativeMarking,
    attempts: 0,
    avgScore: "০%",
    status: quiz.status || "published",
    isLive: quiz.status === "live",
    startTime,
    endTime,
    questions: quiz.questions || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  invalidateAdminCache("quizzes");
  return docRef.id;
}

export async function updateQuizDoc(id: string, quiz: Partial<AdminQuiz>): Promise<void> {
  const docRef = doc(db, "quizzes", id);
  const cleanData: Record<string, any> = {};
  if (quiz.name !== undefined || quiz.title !== undefined) {
    cleanData.title = quiz.title || quiz.name;
    cleanData.name = quiz.name || quiz.title;
  }
  if (quiz.subject !== undefined || quiz.subjectName !== undefined) {
    cleanData.subject = quiz.subject || quiz.subjectName;
    cleanData.subjectName = quiz.subjectName || quiz.subject;
  }
  if (quiz.classId !== undefined) cleanData.classId = quiz.classId;
  if (quiz.subjectId !== undefined) cleanData.subjectId = quiz.subjectId;
  if (quiz.chapterId !== undefined) cleanData.chapterId = quiz.chapterId;
  if (quiz.chapterName !== undefined) cleanData.chapterName = quiz.chapterName;
  if (quiz.duration !== undefined) cleanData.duration = Number(quiz.duration);
  if (quiz.negativeMarking !== undefined) cleanData.negativeMarking = !!quiz.negativeMarking;
  if (quiz.status !== undefined) {
    cleanData.status = quiz.status;
    cleanData.isLive = quiz.status === "live";
  }
  if (quiz.startTime !== undefined) cleanData.startTime = quiz.startTime;
  if (quiz.endTime !== undefined) cleanData.endTime = quiz.endTime;
  if (quiz.questions !== undefined) {
    cleanData.questions = quiz.questions;
    cleanData.questionsCount = quiz.questions.length;
    cleanData.totalQuestions = quiz.questions.length;
  }
  cleanData.updatedAt = new Date();
  await updateDoc(docRef, cleanData);
  invalidateAdminCache("quizzes");
}

export async function toggleQuizLiveStatus(id: string, isLive: boolean, durationMinutes = 15): Promise<void> {
  const docRef = doc(db, "quizzes", id);
  const now = new Date();
  const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);

  if (isLive) {
    await updateDoc(docRef, {
      status: "live",
      isLive: true,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      updatedAt: new Date(),
    });
  } else {
    await updateDoc(docRef, {
      status: "completed",
      isLive: false,
      updatedAt: new Date(),
    });
  }
  invalidateAdminCache("quizzes");
}

export async function deleteQuizDoc(id: string) {
  await deleteDoc(doc(db, "quizzes", id));
  invalidateAdminCache("quizzes");
}

export function parseAdminQuestionDoc(docSnap: any): AdminQuestion {
  const data = docSnap.data() || {};
  let rawOptions = data.options;
  let safeOptions: string[] = [];

  if (Array.isArray(rawOptions)) {
    safeOptions = rawOptions.map((opt) =>
      typeof opt === "object" && opt !== null
        ? String((opt as any).text || (opt as any).title || (opt as any).value || JSON.stringify(opt))
        : String(opt ?? "")
    );
  } else if (typeof rawOptions === "object" && rawOptions !== null) {
    safeOptions = Object.values(rawOptions).map((opt) =>
      typeof opt === "object" && opt !== null
        ? String((opt as any).text || (opt as any).title || (opt as any).value || JSON.stringify(opt))
        : String(opt ?? "")
    );
  } else if (typeof rawOptions === "string" && rawOptions.trim()) {
    try {
      const parsed = JSON.parse(rawOptions);
      if (Array.isArray(parsed)) {
        safeOptions = parsed.map((opt) => String(opt ?? ""));
      } else {
        safeOptions = [rawOptions];
      }
    } catch {
      safeOptions = [rawOptions];
    }
  }

  if (safeOptions.length === 0) {
    safeOptions = [
      String(data.option1 || data.opt1 || data.a || "অপশন ১"),
      String(data.option2 || data.opt2 || data.b || "অপশন ২"),
      String(data.option3 || data.opt3 || data.c || "অপশন ৩"),
      String(data.option4 || data.opt4 || data.d || "অপশন ৪"),
    ];
  }

  const qText = String(data.questionText || data.question || data.title || "প্রশ্ন");
  const numCorrect = Number(data.correctAnswer);
  const correctAnswer = isNaN(numCorrect) ? 0 : Math.max(0, Math.min(safeOptions.length - 1, numCorrect));

  return {
    id: docSnap.id,
    quizId: String(data.quizId || ""),
    classId: String(data.classId || ""),
    subjectId: String(data.subjectId || ""),
    chapterId: String(data.chapterId || ""),
    questionText: qText,
    options: safeOptions,
    correctAnswer,
    explanation: String(data.explanation || data.desc || ""),
  };
}

export async function getAllQuestions(force = false): Promise<AdminQuestion[]> {
  if (!force && questionsCache && Date.now() - questionsCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return questionsCache.data;
  }
  try {
    const q = query(collection(db, "questions"), limit(60));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return [];
    const list: AdminQuestion[] = querySnapshot.docs.map((docSnap) => parseAdminQuestionDoc(docSnap));
    questionsCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
}

export async function getPaginatedQuestions(
  limitCount = 20,
  lastDocId?: string | null,
  filters?: { classId?: string; subjectId?: string; chapterId?: string }
): Promise<{ questions: AdminQuestion[]; lastDocId: string | null; hasMore: boolean }> {
  try {
    const constraints: any[] = [];

    if (filters?.chapterId && filters.chapterId !== "all") {
      constraints.push(where("chapterId", "==", filters.chapterId));
    } else if (filters?.subjectId && filters.subjectId !== "all") {
      const subId = filters.subjectId;
      const cleanSub = subId.replace(/^class\d+(_\d+)?_/, "");
      const candidates = Array.from(
        new Set([
          subId,
          cleanSub,
          `class6_${cleanSub}`,
          `class7_${cleanSub}`,
          `class8_${cleanSub}`,
          `class9_${cleanSub}`,
          `class10_${cleanSub}`,
          `class9_10_${cleanSub}`,
        ])
      ).filter(Boolean);
      constraints.push(where("subjectId", "in", candidates.slice(0, 10)));
    } else if (filters?.classId && filters.classId !== "all") {
      constraints.push(where("classId", "==", filters.classId));
    }

    if (lastDocId) {
      const lastDocSnap = await getDoc(doc(db, "questions", lastDocId));
      if (lastDocSnap.exists()) {
        constraints.push(startAfter(lastDocSnap));
      }
    }

    constraints.push(limit(limitCount));

    const q = query(collection(db, "questions"), ...constraints);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { questions: [], lastDocId: null, hasMore: false };
    }

    const list: AdminQuestion[] = querySnapshot.docs.map((docSnap) => parseAdminQuestionDoc(docSnap));
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      questions: list,
      lastDocId: lastVisible ? lastVisible.id : null,
      hasMore: querySnapshot.docs.length >= limitCount,
    };
  } catch (err) {
    console.error("Error in getPaginatedQuestions:", err);
    return { questions: [], lastDocId: null, hasMore: false };
  }
}

export async function addQuestion(q: Omit<AdminQuestion, "id">): Promise<string> {
  const docRef = doc(collection(db, "questions"));
  const cleanData: Record<string, any> = {};
  Object.keys(q).forEach((key) => {
    const val = (q as any)[key];
    if (val !== undefined) {
      cleanData[key] = val;
    }
  });
  await setDoc(docRef, {
    ...cleanData,
    createdAt: new Date(),
  });
  invalidateAdminCache("questions");
  return docRef.id;
}

export async function updateQuestion(id: string, q: Partial<AdminQuestion>): Promise<void> {
  const qRef = doc(db, "questions", id);
  const cleanData: Record<string, any> = {};
  Object.keys(q).forEach((key) => {
    const val = (q as any)[key];
    if (val !== undefined) {
      cleanData[key] = val;
    }
  });
  await updateDoc(qRef, cleanData);
  invalidateAdminCache("questions");
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, "questions", id));
  invalidateAdminCache("questions");
}

export async function addBulkQuestions(
  questionsList: Array<Omit<AdminQuestion, "id">>,
  metaInfo: { classId?: string; subjectId?: string; chapterId?: string; quizId?: string }
): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const q of questionsList) {
    const docRef = doc(collection(db, "questions"));
    batch.set(docRef, {
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || "",
      classId: metaInfo.classId || q.classId || "",
      subjectId: metaInfo.subjectId || q.subjectId || "",
      chapterId: metaInfo.chapterId || q.chapterId || "",
      quizId: metaInfo.quizId || q.quizId || "",
      createdAt: new Date(),
    });
    count++;
  }

  await batch.commit();
  invalidateAdminCache("questions");
  return count;
}

// ===== BANNER CAROUSEL OPERATIONS =====
export async function getAllBanners(force = false): Promise<BannerSlide[]> {
  if (!force && bannersCache && Date.now() - bannersCache.timestamp < ADMIN_CACHE_TTL_MS) {
    return bannersCache.data;
  }
  try {
    const querySnapshot = await getDocs(collection(db, "banners"));
    if (querySnapshot.empty) return [];
    const list = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      title: docSnap.data().title || "",
      subtitle: docSnap.data().subtitle || "",
      badge: docSnap.data().badge || "",
      badgeColor: docSnap.data().badgeColor || "",
      imageUrl: docSnap.data().imageUrl || "",
      linkUrl: docSnap.data().linkUrl || "/",
      ctaText: docSnap.data().ctaText || "",
      bgGradient: docSnap.data().bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
      order: docSnap.data().order || 1,
    }));
    bannersCache = { data: list, timestamp: Date.now() };
    return list;
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}

export async function addBannerDoc(banner: Omit<BannerSlide, "id">): Promise<string> {
  const docRef = doc(collection(db, "banners"));
  const cleanBanner: Record<string, any> = {};
  Object.keys(banner).forEach((key) => {
    const val = (banner as any)[key];
    if (val !== undefined) {
      cleanBanner[key] = val;
    }
  });
  await setDoc(docRef, {
    ...cleanBanner,
    createdAt: new Date(),
  });
  invalidateAdminCache("banners");
  return docRef.id;
}

export async function updateBannerDoc(id: string, banner: Partial<BannerSlide>): Promise<void> {
  const bRef = doc(db, "banners", id);
  const cleanBanner: Record<string, any> = {};
  Object.keys(banner).forEach((key) => {
    const val = (banner as any)[key];
    if (val !== undefined) {
      cleanBanner[key] = val;
    }
  });
  await updateDoc(bRef, cleanBanner);
  invalidateAdminCache("banners");
}

export async function deleteBannerDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, "banners", id));
  invalidateAdminCache("banners");
}



