"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Camera, User, Mail, Lock, LogOut, ChevronRight,
  Settings, Sparkles, Crown, Flame, GraduationCap,
  Check, Loader2, Copy, UserPlus, Users, Heart,
  Trophy, Target, UserCheck, UserX, Edit3, Share2,
  Shield, HelpCircle, Globe, Zap, Star, Award,
  BookOpen, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/layout/BottomNav";
import AchievementModal from "@/components/profile/AchievementModal";
import FriendSearchModal from "@/components/profile/FriendSearchModal";
import ProfileShareModal from "@/components/profile/ProfileShareModal";
import { Student, AchievementItem, FriendRequest } from "@/types/firestore";
import { useLanguage } from "@/context/LanguageContext";
import { Language } from "@/lib/translations";

/* ─── Constants ─────────────────────────────────────── */
const CLASSES_LIST = [
  { id: "class6", name: "ষষ্ঠ শ্রেণী (Class 6)" },
  { id: "class7", name: "সপ্তম শ্রেণী (Class 7)" },
  { id: "class8", name: "অষ্টম শ্রেণী (Class 8)" },
  { id: "class9", name: "নবম শ্রেণী (Class 9)" },
  { id: "class10", name: "দশম শ্রেণী (Class 10)" },
  { id: "class11", name: "একাদশ শ্রেণী (Class 11)" },
  { id: "class12", name: "দ্বাদশ শ্রেণী (Class 12)" },
];

const GROUPS_LIST = [
  { id: "all", name: "সাধারণ (General)" },
  { id: "science", name: "বিজ্ঞান (Science)" },
  { id: "commerce", name: "ব্যবসায় শিক্ষা (Commerce)" },
  { id: "arts", name: "মানবিক (Arts)" },
];

const BIO_PRESETS = [
  "কুইজ মেটে বিজয়ী শিক্ষার্থী! ⚡",
  "জ্ঞান অর্জনই আসল ক্ষমতা! 💡",
  "প্রতিদিন নতুন কিছু শিখছি 📚",
  "পড়ালেখায় সবার সেরা হতে চাই 🏆",
];

type TabId = "badges" | "friends" | "settings";
const spring = { type: "spring" as const, stiffness: 450, damping: 32 };

/* ─── Rank Helper ──────────────────────────────────── */
function getRankLabel(lvl: number) {
  if (lvl >= 20) return { title: "Legend", emoji: "👑", color: "#F59E0B", gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" };
  if (lvl >= 15) return { title: "Master", emoji: "💎", color: "#6366F1", gradient: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" };
  if (lvl >= 10) return { title: "Expert", emoji: "⚡", color: "#0D9488", gradient: "from-teal-500 to-teal-600", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" };
  if (lvl >= 5)  return { title: "Scholar", emoji: "⭐", color: "#EC4899", gradient: "from-pink-500 to-pink-600", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" };
  return { title: "Rookie", emoji: "🌱", color: "#10B981", gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" };
}

/* ─── useCountUp ──────────────────────────────────── */
function useCountUp(target: number, delay = 0): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    t = setTimeout(() => {
      if (!target) { setV(0); return; }
      let s: number | null = null;
      const dur = 800;
      const tick = (ts: number) => {
        if (!s) s = ts;
        const p = Math.min((ts - s) / dur, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return v;
}

/* ─── Metric Card Component ──────────────────────── */
function MetricCard({
  icon: Icon,
  label,
  value,
  accentColor,
  iconBg,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accentColor: string;
  iconBg: string;
  delay?: number;
}) {
  const displayed = useCountUp(value, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.1, ...spring }}
      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow"
    >
      <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center mb-1.5`}>
        <Icon size={16} style={{ color: accentColor }} />
      </div>
      <span className="text-base font-black text-slate-900 tracking-tight tabular-nums">
        {displayed}
      </span>
      <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
        {label}
      </span>
    </motion.div>
  );
}

/* ─── Badge Card ──────────────────────────────────── */
const BADGE_THEMES = [
  { from: "#F59E0B", to: "#D97706", light: "bg-amber-50", border: "border-amber-200/80", text: "text-amber-700" },
  { from: "#6366F1", to: "#4F46E5", light: "bg-indigo-50", border: "border-indigo-200/80", text: "text-indigo-700" },
  { from: "#0D9488", to: "#0F766E", light: "bg-teal-50", border: "border-teal-200/80", text: "text-teal-700" },
  { from: "#EC4899", to: "#DB2777", light: "bg-pink-50", border: "border-pink-200/80", text: "text-pink-700" },
  { from: "#10B981", to: "#059669", light: "bg-emerald-50", border: "border-emerald-200/80", text: "text-emerald-700" },
  { from: "#3B82F6", to: "#2563EB", light: "bg-blue-50", border: "border-blue-200/80", text: "text-blue-700" },
];

function BadgeItemCard({
  ach,
  idx,
  onClick,
}: {
  ach: AchievementItem;
  idx: number;
  onClick: () => void;
}) {
  const theme = BADGE_THEMES[idx % BADGE_THEMES.length];
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      onClick={onClick}
      className={`relative w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
        ach.unlocked
          ? "bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
          : "bg-slate-50/70 border-slate-200/60 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon Emblem */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative shadow-sm ${
            ach.unlocked
              ? `bg-gradient-to-br ${theme.from} ${theme.to} text-white`
              : "bg-slate-200/80 text-slate-400"
          }`}
          style={ach.unlocked ? { background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` } : {}}
        >
          {ach.unlocked ? (
            <Star size={19} className="text-white fill-white" />
          ) : (
            <Lock size={16} className="text-slate-400" />
          )}

          {ach.unlocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
              <Check size={9} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-[12.5px] font-bold text-slate-900 truncate">
              {ach.title}
            </h4>
            {ach.unlocked && (
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex-shrink-0">
                আনলকড
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
            {ach.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Friend Card Row ─────────────────────────────── */
function FriendRowCard({
  friend,
  onRemove,
  isRemoving,
}: {
  friend: any;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={spring}
      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
          {friend.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
          ) : (
            friend.name?.charAt(0)?.toUpperCase() || "F"
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-slate-900 truncate">{friend.name}</p>
            <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
              Lv.{friend.level || 1}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            UID: #{friend.customUid || "—"}
          </p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onRemove}
        disabled={isRemoving}
        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/80 transition-colors flex-shrink-0 cursor-pointer"
      >
        {isRemoving ? <Loader2 size={12} className="animate-spin" /> : "সরান"}
      </motion.button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════ */
/*  MAIN PROFILE PAGE                                  */
/* ══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { data: session } = useSession();
  const { setLanguage: setGlobalLanguage, t } = useLanguage();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("badges");

  // Bio state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Settings form states
  const [nameInput, setNameInput] = useState("");
  const [classId, setClassId] = useState("class6");
  const [group, setGroup] = useState("all");
  const [language, setLanguage] = useState("bn");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Badges & Friends
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [uidCopied, setUidCopied] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Load Data ──────────────────────────────────── */
  const loadData = async () => {
    try {
      const [pRes, aRes, fRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/achievements"),
        fetch("/api/friends"),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json().catch(() => ({}));
        if (pData?.student) {
          setStudent(pData.student);
          setNameInput(pData.student.name || session?.user?.name || "");
          setBioInput(pData.student.bio || "");
          setClassId(pData.student.classId || "class6");
          setGroup(pData.student.group || "all");
          const studentLang = (pData.student.language as Language) || "bn";
          setLanguage(studentLang);
          setGlobalLanguage(studentLang);
          setDivision(pData.student.division || "");
          setDistrict(pData.student.district || "");
        }
      }

      if (aRes.ok) {
        const aData = await aRes.json().catch(() => ({}));
        setAchievements(aData?.achievements || []);
      }

      if (fRes.ok) {
        const fData = await fRes.json().catch(() => ({}));
        setFriends(fData?.friends || []);
        setIncomingRequests(fData?.incomingRequests || []);
      }
    } catch (e) {
      console.error("Profile loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ── Photo Upload ──────────────────────────────── */
  const compress = (file: File): Promise<string> =>
    new Promise((res) => {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const MAX = 260;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; } }
          else { if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; } }
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = c.toDataURL("image/jpeg", 0.88);
            URL.revokeObjectURL(url);
            res(dataUrl);
          } else {
            URL.revokeObjectURL(url);
            res("");
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          const reader = new FileReader();
          reader.onload = (e) => res((e.target?.result as string) || "");
          reader.onerror = () => res("");
          reader.readAsDataURL(file);
        };
        img.src = url;
      } catch {
        const reader = new FileReader();
        reader.onload = (e) => res((e.target?.result as string) || "");
        reader.onerror = () => res("");
        reader.readAsDataURL(file);
      }
    });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      showToast("সঠিক ছবি নির্বাচন করুন", "error");
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const b64 = await compress(file);
      if (!b64) {
        showToast("ছবি প্রসেস করা যায়নি", "error");
        return;
      }
      const userEmail = session?.user?.email?.toLowerCase();
      if (userEmail) {
        localStorage.setItem(`qm_avatar_${userEmail}`, b64);
        window.dispatchEvent(new Event("qm_avatar_updated"));
      }
      setStudent((p) => (p ? { ...p, avatarUrl: b64 } : null));

      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: b64 }),
      });
      if (r.ok) {
        showToast("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে! 🎉");
      } else {
        showToast("সার্ভারে ছবি সেভ করতে সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("আপলোডে সমস্যা হয়েছে", "error");
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  /* ── Bio Save ──────────────────────────────────── */
  const saveBio = async (text?: string) => {
    const bio = text ?? bioInput;
    setIsSavingBio(true);
    try {
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (r.ok) {
        setStudent((p) => (p ? { ...p, bio } : null));
        setBioInput(bio);
        setIsEditingBio(false);
        showToast("বায়ো সেভ হয়েছে ✨");
      }
    } finally {
      setIsSavingBio(false);
    }
  };

  /* ── Settings Save ─────────────────────────────── */
  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const className = CLASSES_LIST.find((c) => c.id === classId)?.name || classId;
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          bio: bioInput,
          classId,
          className,
          group,
          language,
          division,
          district,
        }),
      });
      if (r.ok) {
        const data = await r.json();
        if (data.student) {
          setStudent(data.student);
        } else {
          setStudent((p) =>
            p
              ? {
                  ...p,
                  name: nameInput,
                  bio: bioInput,
                  classId,
                  className,
                  group,
                  language,
                  division,
                  district,
                }
              : null
          );
        }
        localStorage.setItem("qm_language", language);
        setGlobalLanguage(language as Language);
        showToast(t("settings_save_success"));
      } else {
        showToast(t("settings_save_error"), "error");
      }
    } catch {
      showToast("নেটওয়ার্ক ত্রুটি ঘটেছে", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  /* ── Friend Actions ────────────────────────────── */
  const respondReq = async (id: string, action: "accept" | "decline") => {
    setRespondingReqId(id);
    try {
      const r = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action }),
      });
      const d = await r.json().catch(() => ({}));
      showToast(d?.message || "সম্পন্ন!");
      if (r.ok) loadData();
    } finally {
      setRespondingReqId(null);
    }
  };

  const removeFriend = async (email: string) => {
    setRemovingEmail(email);
    try {
      const r = await fetch("/api/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: email }),
      });
      const d = await r.json().catch(() => ({}));
      showToast(d?.message || "সরানো হয়েছে");
      if (r.ok) loadData();
    } finally {
      setRemovingEmail(null);
    }
  };

  /* ── Computed Values ───────────────────────────── */
  const lvl = student?.level || 1;
  const pts = student?.point || 0;
  const xpPct = Math.min(100, Math.round(((pts % 250) / 250) * 100));
  const rank = getRankLabel(lvl);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const userEmail = session?.user?.email?.toLowerCase();
  const cachedAvatar =
    typeof window !== "undefined" && userEmail
      ? localStorage.getItem(`qm_avatar_${userEmail}`)
      : null;
  const avatarSrc = student?.avatarUrl || cachedAvatar || null;
  const displayName = student?.name || session?.user?.name || "শিক্ষার্থী";
  const initials = displayName.charAt(0).toUpperCase();

  const currentClassName =
    CLASSES_LIST.find((c) => c.id === (student?.classId || classId))?.name?.split("(")[0]?.trim() ||
    student?.className ||
    "শ্রেণী নির্ধারণ নেই";

  /* ─────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* ── Toast Feedback ────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: -24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={spring}
            className={`fixed top-4 left-4 right-4 z-50 py-3 px-4 rounded-2xl text-white text-[13px] font-bold text-center shadow-xl border backdrop-blur-md flex items-center justify-center gap-2 max-w-sm mx-auto ${
              toast.type === "error"
                ? "bg-rose-600/95 border-rose-400/30"
                : "bg-slate-900/95 border-teal-500/30"
            }`}
          >
            {toast.type === "error" ? "❌" : "✅"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-md flex flex-col flex-1 min-h-0 relative z-10">
        {/* ── Top Bar Header ────────────────────────── */}
        <header className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {t("profile_title")}
            </h1>
            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("profile_active_now")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsShareModalOpen(true)}
              title="প্রোফাইল শেয়ার করুন"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            >
              <Share2 size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTab("settings")}
              title="সেটিংস"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            >
              <Settings size={15} />
            </motion.button>
          </div>
        </header>

        {/* ── Scrollable Body ───────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-24">
          {isLoading ? (
            /* Elegant Skeleton Loader */
            <div className="p-4 space-y-4">
              <div className="h-56 rounded-3xl bg-slate-200/70 animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-slate-200/60 animate-pulse" />
                ))}
              </div>
              <div className="h-12 rounded-2xl bg-slate-200/60 animate-pulse" />
              <div className="h-44 rounded-2xl bg-slate-200/40 animate-pulse" />
            </div>
          ) : (
            <div className="p-4 space-y-4">

              {/* ════════════════════════════════════ */}
              {/* 1. HERO IDENTITY CARD — Clean Luxury */}
              {/* ════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden relative"
              >
                {/* Subtle Modern Header Accent */}
                <div className="h-20 bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-600 relative">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                </div>

                {/* Profile Details Container */}
                <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center relative z-10">
                  {/* Avatar Frame with Upload Button */}
                  <div className="relative mb-2.5">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-full ring-4 ring-white bg-slate-900 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer group hover:opacity-95 transition-opacity"
                    >
                      {avatarSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-white">{initials}</span>
                      )}

                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
                          <Loader2 size={20} className="text-teal-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Camera Badge */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => fileInputRef.current?.click()}
                      title="ছবি পরিবর্তন করুন"
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center ring-2 ring-white shadow-md cursor-pointer hover:bg-teal-600 transition-colors"
                    >
                      <Camera size={13} />
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  {/* Name & Academic Tag */}
                  <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                    {displayName}
                  </h2>
                  <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
                    {currentClassName}
                    {student?.district ? ` • ${student.district}` : ""}
                  </p>

                  {/* Rank & UID Chips */}
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border ${rank.bg} ${rank.border} ${rank.text} shadow-xs`}
                    >
                      <span>{rank.emoji}</span>
                      <span>{rank.title} • Lv.{lvl}</span>
                    </span>

                    <button
                      onClick={() => {
                        if (student?.customUid) {
                          navigator.clipboard.writeText(student.customUid);
                          setUidCopied(true);
                          showToast(t("profile_uid_copy_success"));
                          setTimeout(() => setUidCopied(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                      title="UID কপি করুন"
                    >
                      <span>UID:</span>
                      <span className="text-slate-900 font-extrabold">#{student?.customUid || "000000"}</span>
                      {uidCopied ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} className="text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Interactive Bio Statement */}
                  <div className="mt-3.5 w-full">
                    <AnimatePresence mode="wait">
                      {isEditingBio ? (
                        <motion.div
                          key="bio-editing"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shadow-inner"
                        >
                          <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            maxLength={80}
                            rows={2}
                            placeholder="আপনার সম্পর্কে লিখুন..."
                            className="w-full bg-transparent text-slate-800 text-[12px] font-medium placeholder:text-slate-400 focus:outline-none resize-none text-center leading-relaxed"
                          />
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/70">
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              {bioInput.length}/80
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setIsEditingBio(false)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer hover:bg-slate-300 transition-colors"
                              >
                                বাতিল
                              </button>
                              <button
                                onClick={() => saveBio()}
                                disabled={isSavingBio}
                                className="px-3 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold cursor-pointer hover:bg-teal-700 transition-colors flex items-center gap-1"
                              >
                                {isSavingBio ? <Loader2 size={11} className="animate-spin" /> : "সেভ"}
                              </button>
                            </div>
                          </div>
                          {/* Quick Presets */}
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1 justify-center">
                            {BIO_PRESETS.map((bp) => (
                              <span
                                key={bp}
                                onClick={() => {
                                  setBioInput(bp);
                                  saveBio(bp);
                                }}
                                className="text-[9.5px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full cursor-pointer hover:border-teal-500 hover:text-teal-700 transition-colors"
                              >
                                {bp}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="bio-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingBio(true)}
                          className="w-full text-center px-4 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 text-slate-600 text-[12px] font-medium leading-snug cursor-pointer flex items-center justify-center gap-1.5 transition-colors group"
                        >
                          <span className="italic">
                            &ldquo;{student?.bio || "কুইজ মেটে স্বাগতম! প্রতিদিন নতুন শিখি 🚀"}&rdquo;
                          </span>
                          <Edit3
                            size={12}
                            className="text-slate-400 group-hover:text-teal-600 transition-colors flex-shrink-0 not-italic"
                          />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* ════════════════════════════════════ */}
              {/* 2. STATS OVERVIEW BENTO GRID         */}
              {/* ════════════════════════════════════ */}
              <div className="grid grid-cols-4 gap-2">
                <MetricCard
                  icon={Zap}
                  label={t("profile_xp")}
                  value={pts}
                  accentColor="#D97706"
                  iconBg="bg-amber-50"
                  delay={0}
                />
                <MetricCard
                  icon={Flame}
                  label={t("profile_streak")}
                  value={student?.streak || 0}
                  accentColor="#EA580C"
                  iconBg="bg-orange-50"
                  delay={60}
                />
                <MetricCard
                  icon={Trophy}
                  label={t("profile_quiz")}
                  value={student?.totalExam || 0}
                  accentColor="#0D9488"
                  iconBg="bg-teal-50"
                  delay={120}
                />
                <MetricCard
                  icon={Heart}
                  label={t("profile_likes")}
                  value={student?.likesCount || 0}
                  accentColor="#E11D48"
                  iconBg="bg-rose-50"
                  delay={180}
                />
              </div>

              {/* ════════════════════════════════════ */}
              {/* 3. LEVEL & MILESTONE PROGRESS        */}
              {/* ════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ...spring }}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crown size={15} style={{ color: rank.color }} />
                    <span className="text-[12.5px] font-bold text-slate-800">
                      Level {lvl} &rarr; Level {lvl + 1}
                    </span>
                  </div>
                  <span className="text-[12px] font-extrabold text-slate-900 tabular-nums">
                    {pts % 250} / 250 XP
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1, ease: [0.34, 1.04, 0.64, 1], delay: 0.2 }}
                    style={{ background: `linear-gradient(90deg, ${rank.color}, #6366F1)` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-medium">
                  <span>
                    {t("profile_next_level")}{" "}
                    <strong className="text-slate-700 font-bold tabular-nums">
                      {Math.max(0, (lvl * 250) - pts)} XP
                    </strong>{" "}
                    {t("profile_xp_needed")}
                  </span>
                  <span className="font-extrabold text-teal-600">{xpPct}%</span>
                </div>
              </motion.div>

              {/* ════════════════════════════════════ */}
              {/* 4. SEGMENTED TABS                    */}
              {/* ════════════════════════════════════ */}
              <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
                {[
                  { id: "badges" as TabId, label: t("tab_badges"), icon: Award, count: unlockedCount },
                  { id: "friends" as TabId, label: t("tab_friends"), icon: Users, count: friends.length, dot: incomingRequests.length > 0 },
                  { id: "settings" as TabId, label: t("tab_settings"), icon: Settings, count: null },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex-1 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeProfileTab"
                          className="absolute inset-0 bg-white rounded-xl shadow-xs"
                          transition={spring}
                        />
                      )}
                      <Icon size={14} className="relative z-10" />
                      <span className="relative z-10">{tab.label}</span>

                      {tab.count !== null && (
                        <span
                          className={`relative z-10 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? "bg-slate-100 text-slate-700"
                              : "bg-slate-300/60 text-slate-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}

                      {"dot" in tab && tab.dot && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping z-20" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* ════════════════════════════════════ */}
              {/* 5. TAB CONTENT PANELS                */}
              {/* ════════════════════════════════════ */}
              <AnimatePresence mode="wait">

                {/* ── TAB 1: BADGES ────────────────── */}
                {activeTab === "badges" && (
                  <motion.div
                    key="badges-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[12.5px] font-extrabold text-slate-800">
                        {t("badges_title")}
                      </h3>
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                        {unlockedCount}/{achievements.length} {t("badges_unlocked")}
                      </span>
                    </div>

                    {achievements.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-2xl border border-slate-200/80 p-6">
                        <Award size={32} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-[13px] font-bold text-slate-700">{t("badges_no_badges")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {achievements.map((ach, i) => (
                          <BadgeItemCard
                            key={ach.id}
                            ach={ach}
                            idx={i}
                            onClick={() => setSelectedAchievement(ach)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── TAB 2: FRIENDS ───────────────── */}
                {activeTab === "friends" && (
                  <motion.div
                    key="friends-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {/* Add Friend CTA */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      transition={spring}
                      onClick={() => setIsSearchModalOpen(true)}
                      className="w-full py-3 rounded-2xl font-bold text-[13px] text-white flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 shadow-md shadow-teal-600/20 cursor-pointer transition-all"
                    >
                      <UserPlus size={16} />
                      {t("friends_add_new")}
                    </motion.button>

                    {/* Pending Requests Banner */}
                    {incomingRequests.length > 0 && (
                      <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider">
                          <span>⏳</span>
                          <span>{t("friends_pending_requests")} ({incomingRequests.length})</span>
                        </div>

                        {incomingRequests.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-amber-200/60 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                                {req.senderAvatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={req.senderAvatar} alt={req.senderName} className="h-full w-full object-cover" />
                                ) : (
                                  req.senderName?.charAt(0) || "U"
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12.5px] font-bold text-slate-900 truncate">
                                  {req.senderName}
                                </p>
                                <p className="text-[10.5px] text-amber-700 font-mono">
                                  #{req.senderUid}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-1.5 flex-shrink-0">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => respondReq(req.id, "accept")}
                                disabled={respondingReqId === req.id}
                                className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                title={t("friends_accept")}
                              >
                                {respondingReqId === req.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <UserCheck size={14} />
                                )}
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => respondReq(req.id, "decline")}
                                disabled={respondingReqId === req.id}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                                title={t("friends_decline")}
                              >
                                <UserX size={14} />
                              </motion.button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Friends List */}
                    {friends.length === 0 ? (
                      <div className="rounded-2xl bg-white border border-slate-200/80 p-8 text-center flex flex-col items-center shadow-xs">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2.5">
                          <Users size={22} className="text-slate-400" />
                        </div>
                        <h4 className="text-[13px] font-bold text-slate-800">
                          {t("friends_no_friends")}
                        </h4>
                        <p className="text-[11.5px] text-slate-400 mt-0.5 max-w-[200px]">
                          {t("friends_search_hint")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {friends.map((f) => (
                          <FriendRowCard
                            key={f.email}
                            friend={f}
                            onRemove={() => removeFriend(f.email)}
                            isRemoving={removingEmail === f.email}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── TAB 3: SETTINGS ──────────────── */}
                {activeTab === "settings" && (
                  <motion.div
                    key="settings-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    {/* Personal Info Group */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <User size={15} className="text-teal-600" />
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          {t("settings_personal_info")}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_name_label")}
                        </label>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder={t("settings_name_placeholder")}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_bio_label")}
                        </label>
                        <input
                          type="text"
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          maxLength={80}
                          placeholder={t("settings_bio_placeholder")}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_email_label")}
                        </label>
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-500">
                          <span className="truncate">{student?.email || session?.user?.email || "—"}</span>
                          <Lock size={13} className="text-slate-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* Academic Info Group */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <GraduationCap size={15} className="text-indigo-600" />
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          {t("settings_academic_info")}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_class_label")}
                        </label>
                        <select
                          value={classId}
                          onChange={(e) => setClassId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                        >
                          {CLASSES_LIST.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_group_label")}
                        </label>
                        <select
                          value={group}
                          onChange={(e) => setGroup(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                        >
                          {GROUPS_LIST.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* App & Location Group */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Globe size={15} className="text-amber-600" />
                        <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                          {t("settings_app_location_info")}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t("settings_language_label")}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            const newLang = e.target.value as Language;
                            setLanguage(newLang);
                            setGlobalLanguage(newLang);
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                        >
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="en">English (ইংরেজি)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {t("settings_district_label")}
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder={t("settings_district_placeholder")}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            {t("settings_division_label")}
                          </label>
                          <input
                            type="text"
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            placeholder={t("settings_division_placeholder")}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
                      onClick={saveSettings}
                      disabled={isSavingSettings}
                      className="w-full py-3.5 rounded-2xl font-black text-[13.5px] text-white flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/15 cursor-pointer transition-all"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {t("settings_saving")}
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          {t("settings_save_btn")}
                        </>
                      )}
                    </motion.button>

                    {/* Support Links */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden divide-y divide-slate-100 shadow-xs">
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <HelpCircle size={16} className="text-slate-500" />
                          <div>
                            <p className="text-[12px] font-bold text-slate-800">{t("settings_help_center")}</p>
                            <p className="text-[10px] text-slate-400">{t("settings_help_center_val")}</p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400" />
                      </div>

                      <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Shield size={16} className="text-slate-500" />
                          <div>
                            <p className="text-[12px] font-bold text-slate-800">{t("settings_privacy_policy")}</p>
                            <p className="text-[10px] text-slate-400">{t("settings_privacy_policy_val")}</p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-400" />
                      </div>
                    </div>

                    {/* App Version Info */}
                    <div className="text-center py-1">
                      <p className="text-[11px] text-slate-400 font-medium">
                        QuizMate v1.2.0 • Made with ❤️ for Students
                      </p>
                    </div>

                    {/* Log Out */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full py-3 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50/80 flex items-center justify-center gap-2 text-rose-600 font-bold text-[13px] cursor-pointer transition-colors shadow-xs"
                    >
                      <LogOut size={16} />
                      {t("settings_logout")}
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          )}
        </div>
      </div>

      {/* Modals & Bottom Navigation */}
      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
      <FriendSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onRefreshFriends={loadData}
      />
      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        student={student}
      />
      <BottomNav activeTab="profile" />
    </div>
  );
}
