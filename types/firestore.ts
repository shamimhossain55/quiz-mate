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
  sections?: string[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  author?: string;
  order: number;
  sectionName?: string;
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
  customUid?: string;
  customUidLower?: string;
  name: string;
  email: string;
  division?: string;
  district?: string;
  upazila?: string;
  classId?: string;
  className?: string;
  group?: string;
  language?: string;
  profileComplete?: boolean;
  point: number;
  totalExam: number;
  streak?: number;
  level?: number;
  avatarUrl?: string | null;
  bio?: string | null;
  isPro?: boolean;
  likesCount?: number;
  friendsCount?: number;
  achievementsCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface FriendRequest {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string | null;
  senderUid: string;
  receiverEmail: string;
  receiverName: string;
  receiverAvatar?: string | null;
  receiverUid: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  user1Email: string;
  user2Email: string;
  createdAt: string;
}

export interface ProfileLike {
  id: string;
  targetEmail: string;
  likerEmail: string;
  createdAt: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "quiz" | "social" | "streak" | "xp";
  requiredCount?: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}