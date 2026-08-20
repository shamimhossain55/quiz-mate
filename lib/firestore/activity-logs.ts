import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";

// ===== TYPES =====

export type ActivityEntityType =
  | "quiz"
  | "question"
  | "subject"
  | "chapter"
  | "user"
  | "mission"
  | "banner"
  | "settings";

export type ActivityActionType =
  | "create"
  | "update"
  | "delete"
  | "role_change"
  | "status_change"
  | "bulk_upload"
  | "toggle_live"
  | "reset";

export type AdminActivityLog = {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  action: ActivityActionType;
  entityType: ActivityEntityType;
  entityName: string;
  details?: string;
  timestamp: any;
};

// ===== DISPLAY HELPERS =====

export const ACTION_LABELS: Record<ActivityActionType, string> = {
  create: "যোগ করেছেন",
  update: "আপডেট করেছেন",
  delete: "মুছে ফেলেছেন",
  role_change: "রোল পরিবর্তন করেছেন",
  status_change: "স্ট্যাটাস পরিবর্তন করেছেন",
  bulk_upload: "বাল্ক আপলোড করেছেন",
  toggle_live: "লাইভ টগল করেছেন",
  reset: "রিসেট করেছেন",
};

export const ENTITY_LABELS: Record<ActivityEntityType, string> = {
  quiz: "কুইজ",
  question: "প্রশ্ন",
  subject: "বিষয়",
  chapter: "অধ্যায়",
  user: "ইউজার",
  mission: "মিশন",
  banner: "ব্যানার",
  settings: "সেটিংস",
};

export const ACTION_COLORS: Record<ActivityActionType, string> = {
  create: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  update: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  delete: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  role_change: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  status_change: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  bulk_upload: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  toggle_live: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  reset: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

export const ENTITY_COLORS: Record<ActivityEntityType, string> = {
  quiz: "text-indigo-400",
  question: "text-teal-400",
  subject: "text-amber-400",
  chapter: "text-cyan-400",
  user: "text-purple-400",
  mission: "text-emerald-400",
  banner: "text-pink-400",
  settings: "text-slate-400",
};

export const ENTITY_ICONS: Record<ActivityEntityType, string> = {
  quiz: "📝",
  question: "❓",
  subject: "📚",
  chapter: "📖",
  user: "👤",
  mission: "🎯",
  banner: "🖼️",
  settings: "⚙️",
};

// ===== FUNCTIONS =====

/**
 * Log an admin activity to Firestore.
 * Non-critical: failures are caught and warned, never thrown.
 */
export async function logAdminActivity(
  log: Omit<AdminActivityLog, "id" | "timestamp">
): Promise<void> {
  try {
    await addDoc(collection(db, "admin_activity_logs"), {
      ...log,
      timestamp: Timestamp.now(),
    });
  } catch (err) {
    console.warn("Failed to log admin activity:", err);
  }
}

/**
 * Fetch recent admin activity logs (default: last 100).
 */
export async function getAdminActivityLogs(
  maxDocs = 100
): Promise<AdminActivityLog[]> {
  try {
    const q = query(
      collection(db, "admin_activity_logs"),
      orderBy("timestamp", "desc"),
      limit(maxDocs)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AdminActivityLog, "id">),
    }));
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    return [];
  }
}

/**
 * Fetch activity logs for a specific admin.
 */
export async function getActivityLogsByAdmin(
  adminId: string,
  maxDocs = 50
): Promise<AdminActivityLog[]> {
  try {
    const q = query(
      collection(db, "admin_activity_logs"),
      where("adminId", "==", adminId),
      orderBy("timestamp", "desc"),
      limit(maxDocs)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AdminActivityLog, "id">),
    }));
  } catch (err) {
    console.error("Error fetching logs by admin:", err);
    return [];
  }
}

/**
 * Format a Firestore Timestamp or Date to a Bengali relative time string.
 */
export function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return "এইমাত্র";
  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "এইমাত্র";
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHr < 24) return `${diffHr} ঘণ্টা আগে`;
  if (diffDay === 1) return "গতকাল";
  if (diffDay < 7) return `${diffDay} দিন আগে`;
  return date.toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
}

/**
 * Format a Firestore Timestamp or Date to a full Bengali date-time string.
 */
export function formatFullDateTime(timestamp: any): string {
  if (!timestamp) return "";
  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);
  return date.toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
