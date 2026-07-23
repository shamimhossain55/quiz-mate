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

// ===== TYPES =====
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  class?: string;
  xp?: number;
  streak?: number;
  status: "active" | "inactive" | "banned";
  createdAt?: any;
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
  totalQuizzes?: number;
  totalStudents?: number;
  color?: string;
  order?: number;
};

export type AdminChapter = {
  id: string;
  name: string;
  subjectId: string;
  chapterNo: number;
  order: number;
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
    }));
  } catch (err) {
    console.error("Error fetching chapters:", err);
    return [
      { id: `${subjectId}_ch1`, name: "অধ্যায় ১: মৌলিক ধারণা", subjectId, chapterNo: 1, order: 1 },
      { id: `${subjectId}_ch2`, name: "অধ্যায় ২: বিস্তারিত আলোচনা", subjectId, chapterNo: 2, order: 2 },
    ];
  }
}

// ===== USER OPERATIONS =====
export async function getAllStudents(): Promise<AdminUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    if (querySnapshot.empty) return [];
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      name: docSnap.data().name || "নামহীন ইউজার",
      email: docSnap.data().email || "email@domain.com",
      class: docSnap.data().className || docSnap.data().class || "ক্লাস ৯",
      xp: docSnap.data().point || docSnap.data().xp || 0,
      streak: docSnap.data().streak || 0,
      status: docSnap.data().status || "active",
    }));
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
      totalQuizzes: docSnap.data().totalQuizzes || 10,
      totalStudents: docSnap.data().totalStudents || 350,
      color: docSnap.data().color || "#0D9488",
    }));
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
}

export async function addSubject(subject: AdminSubject): Promise<void> {
  const subjectId = subject.id || `${subject.classId}_${subject.slug}`;
  await setDoc(doc(db, "subjects", subjectId), {
    name: subject.name,
    slug: subject.slug,
    classId: subject.classId,
    color: subject.color || "#0D9488",
    order: subject.order || 1,
  });
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
  await setDoc(docRef, {
    ...q,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateQuestion(id: string, q: Partial<AdminQuestion>): Promise<void> {
  const qRef = doc(db, "questions", id);
  await updateDoc(qRef, q);
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
