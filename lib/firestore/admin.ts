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
  classId?: string;
  subjectId?: string;
  chapterId?: string;
  subject?: string;
  questionsCount?: number;
  attempts?: number;
  avgScore?: string;
  status: "published" | "draft";
  createdAt?: any;
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
export async function getAllClasses(): Promise<AdminClass[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "classes"));
    if (querySnapshot.empty) {
      return [
        { id: "class6", name: "ষষ্ঠ শ্রেণী (Class 6)", order: 1 },
        { id: "class7", name: "সপ্তম শ্রেণী (Class 7)", order: 2 },
        { id: "class8", name: "অষ্টম শ্রেণী (Class 8)", order: 3 },
        { id: "class9", name: "নবম শ্রেণী (Class 9)", order: 4 },
        { id: "class10", name: "দশম শ্রেণী (Class 10)", order: 5 },
      ];
    }
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || docSnap.id,
      order: docSnap.data().order || 1,
    }));
  } catch (err) {
    console.error("Error fetching classes:", err);
    return [
      { id: "class6", name: "ষষ্ঠ শ্রেণী (Class 6)", order: 1 },
      { id: "class7", name: "সপ্তম শ্রেণী (Class 7)", order: 2 },
      { id: "class8", name: "অষ্টম শ্রেণী (Class 8)", order: 3 },
      { id: "class9", name: "নবম শ্রেণী (Class 9)", order: 4 },
      { id: "class10", name: "দশম শ্রেণী (Class 10)", order: 5 },
    ];
  }
}

export async function getChaptersBySubject(subjectId: string): Promise<AdminChapter[]> {
  try {
    const q = query(collection(db, "chapters"), where("subjectId", "==", subjectId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [
        { id: `${subjectId}_ch1`, name: "অধ্যায় ১: মৌলিক ধারণা", subjectId, chapterNo: 1, order: 1 },
        { id: `${subjectId}_ch2`, name: "অধ্যায় ২: বিস্তারিত আলোচনা", subjectId, chapterNo: 2, order: 2 },
        { id: `${subjectId}_ch3`, name: "অধ্যায় ৩: অনুশীলন ও সমাধান", subjectId, chapterNo: 3, order: 3 },
      ];
    }
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || docSnap.data().title || docSnap.id,
      subjectId: docSnap.data().subjectId || subjectId,
      chapterNo: docSnap.data().chapterNo || 1,
      order: docSnap.data().order || 1,
      sectionName: docSnap.data().sectionName || undefined,
    }));
  } catch (err) {
    console.error("Error fetching chapters:", err);
    return [
      { id: `${subjectId}_ch1`, name: "অধ্যায় ১: মৌলিক ধারণা", subjectId, chapterNo: 1, order: 1 },
      { id: `${subjectId}_ch2`, name: "অধ্যায় ২: বিস্তারিত আলোচনা", subjectId, chapterNo: 2, order: 2 },
    ];
  }
}

export async function getAllChapters(): Promise<AdminChapter[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "chapters"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || docSnap.data().title || docSnap.id,
      subjectId: docSnap.data().subjectId || "",
      chapterNo: docSnap.data().chapterNo || 1,
      order: docSnap.data().order || 1,
      sectionName: docSnap.data().sectionName || undefined,
    }));
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
}

export async function deleteChapter(id: string): Promise<void> {
  await deleteDoc(doc(db, "chapters", id));
}

// ===== USER OPERATIONS =====
export async function getAllStudents(): Promise<AdminUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => {
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
  return docRef.id;
}

export async function updateStudentStatus(id: string, status: "active" | "inactive" | "banned") {
  const userRef = doc(db, "students", id);
  await updateDoc(userRef, { status });
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
}

export async function deleteStudent(id: string) {
  await deleteDoc(doc(db, "students", id));
}

// ===== SUBJECT OPERATIONS =====
export async function getAllSubjects(): Promise<AdminSubject[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "subjects"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
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
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
}

import { clearSubjectCache } from "@/lib/firestore/subjects";

function notifySubjectsUpdated() {
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
export async function getAllQuizzes(): Promise<AdminQuiz[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "quizzes"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().title || docSnap.data().name || docSnap.id,
      subject: docSnap.data().subject || "সাধারণ",
      classId: docSnap.data().classId,
      subjectId: docSnap.data().subjectId,
      chapterId: docSnap.data().chapterId,
      questionsCount: docSnap.data().questionsCount || (docSnap.data().questions?.length || 10),
      attempts: docSnap.data().attempts || 0,
      avgScore: docSnap.data().avgScore || "৭৫%",
      status: docSnap.data().status || "published",
    }));
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    return [];
  }
}

export async function addQuiz(quiz: Omit<AdminQuiz, "id">): Promise<string> {
  const docRef = doc(collection(db, "quizzes"));
  await setDoc(docRef, {
    title: quiz.name,
    subject: quiz.subject,
    classId: quiz.classId,
    subjectId: quiz.subjectId,
    chapterId: quiz.chapterId,
    questionsCount: quiz.questionsCount || 10,
    attempts: 0,
    avgScore: "0%",
    status: quiz.status,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function deleteQuizDoc(id: string) {
  await deleteDoc(doc(db, "quizzes", id));
}

// ===== QUESTION OPERATIONS (SINGLE & BULK JSON) =====
export async function getAllQuestions(): Promise<AdminQuestion[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      quizId: docSnap.data().quizId,
      classId: docSnap.data().classId,
      subjectId: docSnap.data().subjectId,
      chapterId: docSnap.data().chapterId,
      questionText: docSnap.data().questionText || docSnap.data().question || "প্রশ্ন",
      options: docSnap.data().options || [],
      correctAnswer: docSnap.data().correctAnswer ?? 0,
      explanation: docSnap.data().explanation || "",
    }));
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
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
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, "questions", id));
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
  return count;
}

// ===== BANNER CAROUSEL OPERATIONS =====
export async function getAllBanners(): Promise<BannerSlide[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "banners"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
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
}

export async function deleteBannerDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, "banners", id));
}


