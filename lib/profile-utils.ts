import { adminDb } from "@/lib/firebase-admin";

/**
 * Generate a unique 8-character uppercase alphanumeric handle e.g. "QM78X9A2"
 */
export async function generateUniqueCustomUid(): Promise<string> {
  let isUnique = false;
  let uid = "";

  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    uid = randomNum;

    const snap = await adminDb
      .collection("students")
      .where("customUid", "==", uid)
      .limit(1)
      .get();

    if (snap.empty) {
      isUnique = true;
    }
  }

  return uid;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "quiz" | "social" | "streak" | "xp";
  check: (stats: {
    totalExam: number;
    point: number;
    streak: number;
    friendsCount: number;
    likesCount: number;
  }) => boolean;
}

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    id: "first_quiz",
    title: "প্রথম পদক্ষেপ",
    description: "অন্তত ১টি কুইজ সম্পন্ন করেছেন",
    icon: "Target",
    category: "quiz",
    check: (s) => s.totalExam >= 1,
  },
  {
    id: "quiz_5",
    title: "কুইজ বীর",
    description: "৫টি কুইজ সফলভাবে সম্পন্ন করেছেন",
    icon: "Trophy",
    category: "quiz",
    check: (s) => s.totalExam >= 5,
  },
  {
    id: "xp_100",
    title: "উৎসাহী শিক্ষার্থী",
    description: "১০০ XP পয়েন্ট অর্জন করেছেন",
    icon: "Zap",
    category: "xp",
    check: (s) => s.point >= 100,
  },
  {
    id: "xp_500",
    title: "জ্ঞানতাপস",
    description: "৫০০ XP পয়েন্টের মাইলফলক স্পর্শ করেছেন",
    icon: "Crown",
    category: "xp",
    check: (s) => s.point >= 500,
  },
  {
    id: "streak_3",
    title: "ধারাবাহিক বিজয়ী",
    description: "৩ দিনের টানা লার্নিং স্ট্রিক বজায় রেখেছেন",
    icon: "Flame",
    category: "streak",
    check: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    title: "অদম্য যোদ্ধা",
    description: "৭ দিনের টানা স্ট্রিক অর্জন করেছেন",
    icon: "Sparkles",
    category: "streak",
    check: (s) => s.streak >= 7,
  },
  {
    id: "friends_1",
    title: "নতুন সুহৃদ",
    description: "অ্যাপে অন্তত ১ জন বন্ধু তৈরি করেছেন",
    icon: "UserPlus",
    category: "social",
    check: (s) => s.friendsCount >= 1,
  },
  {
    id: "friends_3",
    title: "সামাজিক তারকা",
    description: "৩ জন বন্ধুর সাথে যুক্ত হয়েছেন",
    icon: "Users",
    category: "social",
    check: (s) => s.friendsCount >= 3,
  },
  {
    id: "profile_liked_1",
    title: "প্রথম প্রশংসা",
    description: "প্রোফাইলে ১টি লাইক পেয়েছেন",
    icon: "Heart",
    category: "social",
    check: (s) => s.likesCount >= 1,
  },
  {
    id: "profile_liked_5",
    title: "জনপ্রিয় প্রোফাইল",
    description: "প্রোফাইলে ৫টি লাইক লাভ করেছেন",
    icon: "Star",
    category: "social",
    check: (s) => s.likesCount >= 5,
  },
];
