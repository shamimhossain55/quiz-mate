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
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  submittedAt: Date;
}

export interface Student {
  id: string;
  uid: string;
  name: string;
  email: string;
  classId: string;
}