export type SubjectGroup =
  | "all"
  | "science"
  | "commerce"
  | "arts";

export interface FirestoreSubject {
  id: string;
  classId: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  group?: SubjectGroup;
  order: number;
  imageUrl?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  author?: string;
  order: number;
}

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  duration: number;
  totalQuestions: number;
}

export interface Question {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  order: number;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  chapterId?: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage?: number;
  negativeMarking?: boolean;
  timeTaken?: number;
  createdAt?: any;
}

export interface Student {
  id: string;
  uid?: string;
  name: string;
  email: string;
  classId?: string;
  point: number;
  totalExam: number;
  streak?: number;
  level?: number;
  avatarUrl?: string | null;
}