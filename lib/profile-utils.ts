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

/**
 * Returns today's date formatted as "YYYY-MM-DD" in Asia/Dhaka timezone.
 */
export function getDhakaDateStr(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Calculates day difference between two YYYY-MM-DD dates (d2 - d1).
 */
export function getDaysDifference(d1Str: string, d2Str: string): number {
  try {
    const d1 = new Date(`${d1Str}T00:00:00Z`).getTime();
    const d2 = new Date(`${d2Str}T00:00:00Z`).getTime();
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Calculates updated streak value and last streak date based on previous values.
 */
export function calculateUpdatedStreak(
  currentStreak: number | undefined,
  lastStreakDate: string | undefined | null,
  todayStr: string = getDhakaDateStr()
): { streak: number; lastStreakDate: string; isChanged: boolean } {
  const streak = currentStreak && currentStreak > 0 ? currentStreak : 1;

  if (!lastStreakDate) {
    return {
      streak: streak,
      lastStreakDate: todayStr,
      isChanged: true,
    };
  }

  if (lastStreakDate === todayStr) {
    return {
      streak: streak,
      lastStreakDate: todayStr,
      isChanged: false,
    };
  }

  const diff = getDaysDifference(lastStreakDate, todayStr);

  if (diff === 1) {
    // Logged in on consecutive day
    return {
      streak: streak + 1,
      lastStreakDate: todayStr,
      isChanged: true,
    };
  } else if (diff > 1) {
    // Missed one or more days -> reset to 1
    return {
      streak: 1,
      lastStreakDate: todayStr,
      isChanged: true,
    };
  } else {
    // diff <= 0 (e.g. clock change or same day)
    return {
      streak: streak,
      lastStreakDate: todayStr,
      isChanged: false,
    };
  }
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
