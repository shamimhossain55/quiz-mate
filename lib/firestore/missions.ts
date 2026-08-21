import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export type MissionTargetType =
  | "quiz_count"
  | "correct_answers"
  | "min_score_percent"
  | "battle_count";

export interface DailyMissionConfig {
  id: string;
  title: string;
  desc: string;
  targetType: MissionTargetType;
  target: number;
  rewardXP: number;
  icon: string;
  color: string;
  bg: string;
  actionText: string;
  active: boolean;
  order: number;
}

export interface DailyMissionsGlobalSettings {
  allClearBonusXP: number;
  enabled: boolean;
}

export const DEFAULT_DAILY_MISSIONS: DailyMissionConfig[] = [
  {
    id: "m_daily_quiz",
    title: "১টি কুইজ খেলুন",
    desc: "আজকে যেকোনো বিষয়ে অন্তত ১টি পূর্ণাঙ্গ কুইজ দিন",
    targetType: "quiz_count",
    target: 1,
    rewardXP: 50,
    icon: "Target",
    color: "#0F766E",
    bg: "bg-teal-50 border-teal-200/80 text-teal-700",
    actionText: "কুইজ খেলুন",
    active: true,
    order: 1,
  },
  {
    id: "m_daily_correct",
    title: "১০টি সঠিক উত্তর দিন",
    desc: "আজকের কুইজে ১০টি প্রশ্নের সঠিক উত্তর দিন",
    targetType: "correct_answers",
    target: 10,
    rewardXP: 75,
    icon: "Sparkles",
    color: "#D97706",
    bg: "bg-amber-50 border-amber-200/80 text-amber-700",
    actionText: "অনুশীলন করুন",
    active: true,
    order: 2,
  },
  {
    id: "m_daily_high_score",
    title: "৮০%+ স্কোর অর্জন",
    desc: "আজকের যেকোনো কুইজে ৮০% বা তার বেশি স্কোর করুন",
    targetType: "min_score_percent",
    target: 80,
    rewardXP: 100,
    icon: "Trophy",
    color: "#6366F1",
    bg: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
    actionText: "চ্যালেঞ্জ নিন",
    active: true,
    order: 3,
  },
];

export const DEFAULT_GLOBAL_SETTINGS: DailyMissionsGlobalSettings = {
  allClearBonusXP: 100,
  enabled: true,
};

let missionsConfigCache: { data: DailyMissionConfig[]; timestamp: number } | null = null;
let missionsSettingsCache: { data: DailyMissionsGlobalSettings; timestamp: number } | null = null;
const MISSIONS_CACHE_TTL_MS = 15 * 60 * 1000;

export function clearMissionsCache(): void {
  missionsConfigCache = null;
  missionsSettingsCache = null;
}

/**
 * Fetch all daily mission configurations from Firestore.
 * If empty in Firestore, falls back to default missions.
 */
export async function getDailyMissionsConfig(): Promise<DailyMissionConfig[]> {
  if (missionsConfigCache && Date.now() - missionsConfigCache.timestamp < MISSIONS_CACHE_TTL_MS) {
    return missionsConfigCache.data;
  }
  try {
    const colRef = collection(db, "daily_missions_config");
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      missionsConfigCache = { data: DEFAULT_DAILY_MISSIONS, timestamp: Date.now() };
      return DEFAULT_DAILY_MISSIONS;
    }

    const docs: DailyMissionConfig[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || "মিশন",
        desc: data.desc || "",
        targetType: data.targetType || "quiz_count",
        target: Number(data.target ?? 1),
        rewardXP: Number(data.rewardXP ?? 50),
        icon: data.icon || "Target",
        color: data.color || "#0F766E",
        bg: data.bg || "bg-teal-50 border-teal-200/80 text-teal-700",
        actionText: data.actionText || "কুইজ খেলুন",
        active: data.active !== false,
        order: Number(data.order ?? 99),
      };
    });

    docs.sort((a, b) => a.order - b.order);
    missionsConfigCache = { data: docs, timestamp: Date.now() };
    return docs;
  } catch (err) {
    console.error("Error fetching daily missions config:", err);
    return DEFAULT_DAILY_MISSIONS;
  }
}

/**
 * Fetch global daily mission settings (e.g. all-clear bonus XP, enabled state).
 */
export async function getDailyMissionsSettings(): Promise<DailyMissionsGlobalSettings> {
  if (missionsSettingsCache && Date.now() - missionsSettingsCache.timestamp < MISSIONS_CACHE_TTL_MS) {
    return missionsSettingsCache.data;
  }
  try {
    const docRef = doc(db, "system_settings", "daily_missions");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      missionsSettingsCache = { data: DEFAULT_GLOBAL_SETTINGS, timestamp: Date.now() };
      return DEFAULT_GLOBAL_SETTINGS;
    }

    const data = docSnap.data();
    const result = {
      allClearBonusXP: Number(data.allClearBonusXP ?? 100),
      enabled: data.enabled !== false,
    };
    missionsSettingsCache = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.error("Error fetching daily missions settings:", err);
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

/**
 * Save / Update global daily mission settings in Firestore.
 */
export async function saveDailyMissionsSettings(
  settings: Partial<DailyMissionsGlobalSettings>
): Promise<void> {
  try {
    clearMissionsCache();
    const docRef = doc(db, "system_settings", "daily_missions");
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Error saving daily missions settings:", err);
    throw err;
  }
}

/**
 * Add a new mission document to Firestore.
 */
export async function addDailyMissionDoc(
  mission: Omit<DailyMissionConfig, "id">
): Promise<string> {
  try {
    clearMissionsCache();
    const colRef = collection(db, "daily_missions_config");
    const docRef = await addDoc(colRef, {
      ...mission,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error adding daily mission:", err);
    throw err;
  }
}

/**
 * Update an existing mission document in Firestore.
 */
export async function updateDailyMissionDoc(
  id: string,
  updates: Partial<DailyMissionConfig>
): Promise<void> {
  try {
    clearMissionsCache();
    const docRef = doc(db, "daily_missions_config", id);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Error updating daily mission:", err);
    throw err;
  }
}

/**
 * Delete a mission document from Firestore.
 */
export async function deleteDailyMissionDoc(id: string): Promise<void> {
  try {
    clearMissionsCache();
    const docRef = doc(db, "daily_missions_config", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting daily mission:", err);
    throw err;
  }
}

/**
 * Restore default missions in Firestore.
 */
export async function resetDefaultDailyMissions(): Promise<DailyMissionConfig[]> {
  try {
    clearMissionsCache();
    // 1. Delete existing custom missions
    const colRef = collection(db, "daily_missions_config");
    const snapshot = await getDocs(colRef);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    // 2. Insert standard default missions
    for (const m of DEFAULT_DAILY_MISSIONS) {
      const docRef = doc(db, "daily_missions_config", m.id);
      await setDoc(docRef, {
        title: m.title,
        desc: m.desc,
        targetType: m.targetType,
        target: m.target,
        rewardXP: m.rewardXP,
        icon: m.icon,
        color: m.color,
        bg: m.bg,
        actionText: m.actionText,
        active: m.active,
        order: m.order,
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Reset settings
    await saveDailyMissionsSettings(DEFAULT_GLOBAL_SETTINGS);

    return DEFAULT_DAILY_MISSIONS;
  } catch (err) {
    console.error("Error resetting default daily missions:", err);
    throw err;
  }
}
