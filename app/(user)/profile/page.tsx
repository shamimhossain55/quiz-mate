"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Camera, User, Mail, Lock, LogOut, ChevronRight,
  Eye, EyeOff, Settings, Sparkles, Crown, Flame,
  GraduationCap, Check, Loader2, Copy, UserPlus,
  Users, Heart, Trophy, Target, UserCheck, UserX,
  Edit3, Share2, Shield, HelpCircle, Globe, BarChart3,
  Zap, Star, Award, ChevronDown, BookOpen, Swords, MapPin,
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
type TabId = "badges" | "friends" | "about";
const spring = { type: "spring" as const, stiffness: 480, damping: 30 };

/* ─── Rank helpers ─────────────────────────────────── */
function getRankLabel(lvl: number) {
  if (lvl >= 20) return { title: "Legend", emoji: "👑", color: "#F59E0B" };
  if (lvl >= 15) return { title: "Master", emoji: "💎", color: "#6366F1" };
  if (lvl >= 10) return { title: "Expert", emoji: "⚡", color: "#0D9488" };
  if (lvl >= 5)  return { title: "Scholar", emoji: "⭐", color: "#EC4899" };
  return { title: "Rookie", emoji: "🌱", color: "#10B981" };
}

/* ─── useCountUp ──────────────────────────────────── */
function useCountUp(target: number, delay = 0): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    t = setTimeout(() => {
      if (!target) { setV(0); return; }
      let s: number | null = null;
      const dur = 900;
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

/* ─── XP Progress Ring ────────────────────────────── */
function XPRing({ pct, size = 64, stroke = 5, color = "#0D9488" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.34, 1.04, 0.64, 1], delay: 0.4 }}
      />
    </svg>
  );
}

/* ─── Stat Pill ───────────────────────────────────── */
function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  const displayed = useCountUp(value, 350);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={13} style={{ color }} />
        <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
          {displayed}
        </span>
      </div>
      <span className="text-[9.5px] font-medium text-white/50 uppercase tracking-[0.08em]">{label}</span>
    </div>
  );
}

/* ─── Badge Card ──────────────────────────────────── */
const BADGE_COLORS = [
  { from: "#F59E0B", to: "#F97316" },
  { from: "#8B5CF6", to: "#6366F1" },
  { from: "#0D9488", to: "#0891B2" },
  { from: "#EC4899", to: "#F43F5E" },
  { from: "#10B981", to: "#059669" },
  { from: "#3B82F6", to: "#6366F1" },
];
function BadgeCard({ ach, idx, onClick }: { ach: AchievementItem; idx: number; onClick: () => void }) {
  const col = BADGE_COLORS[idx % BADGE_COLORS.length];
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={spring}
      onClick={onClick}
      className="relative w-full text-left"
    >
      <div
        className={`rounded-[20px] p-3.5 flex flex-col items-center text-center gap-2 transition-all ${
          ach.unlocked ? "opacity-100" : "opacity-45 grayscale"
        }`}
        style={{
          background: ach.unlocked
            ? `linear-gradient(145deg, ${col.from}18, ${col.to}10)`
            : "rgba(15,23,42,0.04)",
          border: ach.unlocked ? `1.5px solid ${col.from}30` : "1.5px solid rgba(15,23,42,0.08)",
          boxShadow: ach.unlocked
            ? `0 4px 20px ${col.from}14, inset 0 1px 0 ${col.from}20`
            : "none",
        }}
      >
        {/* Icon circle */}
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: ach.unlocked
              ? `linear-gradient(145deg, ${col.from}, ${col.to})`
              : "rgba(15,23,42,0.1)",
            boxShadow: ach.unlocked ? `0 6px 16px ${col.from}40` : "none",
          }}
        >
          {ach.unlocked ? (
            <Star size={20} className="text-white" fill="white" />
          ) : (
            <Lock size={16} className="text-slate-400" />
          )}
          {ach.unlocked && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring, delay: idx * 0.06 + 0.3 }}
            >
              <Check size={8} strokeWidth={3} className="text-white" />
            </motion.div>
          )}
        </div>
        <div className="w-full">
          <p className="text-[11.5px] font-bold text-slate-800 truncate leading-tight">{ach.title}</p>
          <p className="text-[9.5px] text-slate-400 font-medium line-clamp-1 mt-0.5">{ach.description}</p>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Locked placeholder ─────────────────────────── */
function LockedPlaceholder() {
  return (
    <div className="rounded-[20px] p-3.5 flex flex-col items-center gap-2 border border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-11 h-11 rounded-[14px] bg-slate-100 flex items-center justify-center">
        <Lock size={16} className="text-slate-300" />
      </div>
      <div className="w-full space-y-1.5">
        <div className="h-2.5 w-full bg-slate-100 rounded-full" />
        <div className="h-2 w-2/3 mx-auto bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Friend Row ──────────────────────────────────── */
function FriendRow({ f, onRemove, removing }: { f: any; onRemove: () => void; removing: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3.5 rounded-[16px] bg-white border border-slate-100"
      style={{ boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}
    >
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base overflow-hidden flex-shrink-0">
        {f.avatarUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={f.avatarUrl} alt={f.name} className="h-full w-full object-cover" />
          : f.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-bold text-slate-900 truncate">{f.name}</p>
          <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-full bg-teal-100 text-teal-700">Lv.{f.level}</span>
        </div>
        <p className="text-[10.5px] text-slate-400 font-medium tabular-nums">{f.customUid}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.93 }}
        onClick={onRemove}
        disabled={removing}
        className="px-3 py-1.5 rounded-full text-[10.5px] font-bold text-rose-500 bg-rose-50 border border-rose-100 cursor-pointer"
      >
        {removing ? <Loader2 size={11} className="animate-spin" /> : "সরান"}
      </motion.button>
    </motion.div>
  );
}

/* ─── Settings Row ────────────────────────────────── */
function SettingsRow({ icon: Icon, label, value, color, trailing }: {
  icon: React.ElementType; label: string; value: string; color: string; trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/80 transition-colors">
      <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className="text-[13px] font-semibold text-slate-800 truncate mt-0.5 tabular-nums">{value}</p>
      </div>
      {trailing ?? <ChevronRight size={15} className="text-slate-300" />}
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
/*  MAIN PAGE                                          */
/* ══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { data: session } = useSession();
  const { setLanguage: setGlobalLanguage, t } = useLanguage();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("badges");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [classId, setClassId] = useState("class6");
  const [group, setGroup] = useState("all");
  const [language, setLanguage] = useState("bn");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [uidCopied, setUidCopied] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Load ──────────────────────────────────────── */
  const loadData = async () => {
    try {
      const [pRes, aRes, fRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/achievements"),
        fetch("/api/friends"),
      ]);
      const pData = await pRes.json();
      if (pRes.ok && pData.student) {
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
      const aData = await aRes.json();
      if (aRes.ok) setAchievements(aData.achievements || []);
      const fData = await fRes.json();
      if (fRes.ok) {
        setFriends(fData.friends || []);
        setIncomingRequests(fData.incomingRequests || []);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  /* ── Photo upload ─────────────────────────────── */
  const compress = (file: File): Promise<string> =>
    new Promise((res) => {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const MAX = 240;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
          else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = c.toDataURL("image/jpeg", 0.85);
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
    if (!file || !file.type.startsWith("image/")) { showToast("সঠিক ছবি নির্বাচন করুন", "error"); return; }
    setIsUploadingPhoto(true);
    try {
      const b64 = await compress(file);
      if (!b64) {
        showToast("ছবি প্রসেস করা যায়নি", "error");
        return;
      }
      // Store avatar under user-specific key to prevent cross-user bleed
      const userEmail = session?.user?.email?.toLowerCase();
      if (userEmail) {
        localStorage.setItem(`qm_avatar_${userEmail}`, b64);
        window.dispatchEvent(new Event("qm_avatar_updated"));
      }
      setStudent(p => p ? { ...p, avatarUrl: b64 } : null);
      
      const r = await fetch("/api/profile", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ avatarUrl: b64 }) 
      });
      if (r.ok) { 
        showToast("প্রোফাইল ছবি আপডেট সফল! 🎉"); 
      } else { 
        showToast("সার্ভারে ছবি সেভ করতে সমস্যা হয়েছে", "error"); 
      }
    } catch (err) { 
      console.error(err);
      showToast("আপলোডে সমস্যা হয়েছে", "error"); 
    }
    finally { 
      setIsUploadingPhoto(false); 
      if (e.target) e.target.value = ""; 
    }
  };

  /* ── Bio ──────────────────────────────────────── */
  const saveBio = async (text?: string) => {
    const bio = text ?? bioInput;
    setIsSavingBio(true);
    try {
      const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bio }) });
      if (r.ok) { setStudent(p => p ? { ...p, bio } : null); setBioInput(bio); setIsEditingBio(false); showToast("বায়ো সেভ হয়েছে ✨"); }
    } finally { setIsSavingBio(false); }
  };

  /* ── Settings ─────────────────────────────────── */
  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const className = CLASSES_LIST.find(c => c.id === classId)?.name || classId;
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
          setStudent(p => p ? {
            ...p,
            name: nameInput,
            bio: bioInput,
            classId,
            className,
            group,
            language,
            division,
            district,
          } : null);
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

  /* ── Friends ─────────────────────────────────── */
  const respondReq = async (id: string, action: "accept" | "decline") => {
    setRespondingReqId(id);
    try {
      const r = await fetch("/api/friends/respond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id, action }) });
      const d = await r.json();
      showToast(d.message || "সম্পন্ন!");
      if (r.ok) loadData();
    } finally { setRespondingReqId(null); }
  };
  const removeFriend = async (email: string) => {
    setRemovingEmail(email);
    try {
      const r = await fetch("/api/friends/remove", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetEmail: email }) });
      const d = await r.json();
      showToast(d.message || "সরানো হয়েছে");
      if (r.ok) loadData();
    } finally { setRemovingEmail(null); }
  };

  /* ── Computed ────────────────────────────────── */
  const lvl = student?.level || 1;
  const pts = student?.point || 0;
  const xpPct = Math.min(100, Math.round(((pts % 250) / 250) * 100));
  const rank = getRankLabel(lvl);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const placeholders = Math.max(0, 6 - achievements.length);
  const userEmail = session?.user?.email?.toLowerCase();
  const cachedAvatar = typeof window !== "undefined" && userEmail
    ? localStorage.getItem(`qm_avatar_${userEmail}`)
    : null;
  const avatarSrc = student?.avatarUrl || cachedAvatar || null;
  const displayName = student?.name || session?.user?.name || "শিক্ষার্থী";
  const initials = displayName.charAt(0).toUpperCase();

  /* ─────────────────────────────────────────────── */
  return (
    <div className="h-screen bg-[#F2F4F7] font-sans flex flex-col relative overflow-hidden selection:bg-teal-500 selection:text-white">

      {/* ── Toast ─────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={spring}
            className={`absolute top-4 left-4 right-4 z-[60] py-3 px-4 rounded-2xl text-white text-[12.5px] font-semibold text-center shadow-2xl border backdrop-blur-md flex items-center justify-center gap-2 ${
              toast.type === "error"
                ? "bg-rose-600/95 border-rose-400/30"
                : "bg-slate-900/95 border-teal-500/30"
            }`}
          >
            {toast.type === "error" ? "❌" : "✅"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {isLoading ? (
            /* Skeleton */
            <div className="p-4 space-y-3">
              <div className="h-64 rounded-[28px] bg-slate-200 animate-pulse" />
              <div className="h-20 rounded-[20px] bg-slate-200/70 animate-pulse" />
              <div className="h-10 rounded-[16px] bg-slate-200/50 animate-pulse" />
              <div className="h-48 rounded-[20px] bg-slate-200/30 animate-pulse" />
            </div>
          ) : (
            <div className="pb-6">

              {/* ════════════════════════════════════ */}
              {/* HERO CARD — dark cinematic           */}
              {/* ════════════════════════════════════ */}
              {/* ════════════════════════════════════ */}
              {/* HERO CARD — compact & sleek luxury   */}
              {/* ════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative mx-3 mt-3 rounded-[24px] overflow-hidden"
                style={{
                  background: "linear-gradient(150deg, #0F172A 0%, #1E1B4B 50%, #0F2027 100%)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {/* Mesh ambient background glows */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-35" style={{ background: "radial-gradient(circle, #0D9488 0%, transparent 70%)" }} />
                  <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 opacity-15" style={{ background: "radial-gradient(ellipse, #F59E0B 0%, transparent 70%)" }} />
                </div>

                {/* Top bar */}
                <div className="relative z-10 flex items-center justify-between px-4 pt-3.5 pb-1">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-300">Active Now</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors shadow-sm"
                    >
                      <Share2 size={13} className="text-white/90" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveTab("about")}
                      className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors shadow-sm"
                    >
                      <Settings size={13} className="text-white/90" />
                    </motion.button>
                  </div>
                </div>

                {/* Avatar + info stack */}
                <div className="relative z-10 flex flex-col items-center px-4 pt-1 pb-3">
                  {/* Compact Avatar Container with perfectly matching XP Ring */}
                  <div className="relative mb-2.5 flex items-center justify-center">
                    {/* XP ring background */}
                    <div className="w-[88px] h-[88px] flex items-center justify-center relative">
                      <XPRing pct={xpPct} size={88} stroke={3} color={rank.color} />
                      {/* Inner Avatar Box */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-[5px] rounded-full flex items-center justify-center overflow-hidden border border-white/20 bg-slate-900 shadow-md cursor-pointer group hover:opacity-90 transition-opacity"
                        title="প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"
                      >
                        {avatarSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-white tracking-tight">{initials}</span>
                        )}
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                            <Loader2 size={18} className="text-teal-400 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Camera button */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      transition={spring}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-2 border-slate-900 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${rank.color}, #6366F1)` }}
                    >
                      <Camera size={12} className="text-white" />
                    </motion.button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  </div>

                  {/* Display Name */}
                  <h1 className="text-lg font-black text-white leading-tight text-center tracking-tight">
                    {displayName}
                  </h1>

                  {/* Rank & UID badges */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold tracking-wide flex items-center gap-1 shadow-sm"
                      style={{
                        background: `${rank.color}22`,
                        color: rank.color,
                        border: `1px solid ${rank.color}45`,
                      }}
                    >
                      <span>{rank.emoji}</span>
                      <span>{rank.title} • Lv.{lvl}</span>
                    </span>
                    <button
                      onClick={() => {
                        if (student?.customUid) {
                          navigator.clipboard.writeText(student.customUid);
                          setUidCopied(true);
                          showToast("UID কপি হয়েছে!");
                          setTimeout(() => setUidCopied(false), 2000);
                        }
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                      title="UID কপি করতে ক্লিক করুন"
                    >
                      <span>UID:</span>
                      <span className="text-teal-300 font-extrabold">{student?.customUid || "000000"}</span>
                      {uidCopied ? (
                        <Check size={11} className="text-teal-400" />
                      ) : (
                        <Copy size={11} className="text-teal-300/80 hover:text-teal-300" />
                      )}
                    </button>
                  </div>

                  {/* Bio statement */}
                  <div className="mt-2 w-full max-w-[250px]">
                    <AnimatePresence mode="wait">
                      {isEditingBio ? (
                        <motion.div
                          key="bio-edit"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          className="bg-slate-900/80 backdrop-blur-md rounded-xl p-2.5 border border-white/20 shadow-lg"
                        >
                          <textarea
                            value={bioInput}
                            onChange={e => setBioInput(e.target.value)}
                            maxLength={80}
                            rows={2}
                            placeholder="আপনার পরিচয় লিখুন..."
                            className="w-full bg-transparent text-white text-[11.5px] font-medium placeholder:text-white/30 focus:outline-none resize-none text-center leading-relaxed"
                          />
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10">
                            <span className="text-[9px] text-white/40">{bioInput.length}/80</span>
                            <div className="flex gap-1">
                              <button onClick={() => setIsEditingBio(false)} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-semibold">বাতিল</button>
                              <button onClick={() => saveBio()} disabled={isSavingBio} className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-bold">
                                {isSavingBio ? <Loader2 size={10} className="animate-spin" /> : "সেভ"}
                              </button>
                            </div>
                          </div>
                          <div className="mt-1.5 pt-1.5 border-t border-white/10 flex flex-wrap gap-1 justify-center">
                            {BIO_PRESETS.map(bp => (
                              <span key={bp} onClick={() => { setBioInput(bp); saveBio(bp); }} className="text-[9px] font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/15 cursor-pointer hover:bg-white/20 transition-colors">
                                {bp}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="bio-show"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingBio(true)}
                          className="w-full text-center text-white/60 text-[11.5px] font-medium italic leading-snug cursor-pointer flex items-center justify-center gap-1 hover:text-white/85 transition-colors"
                        >
                          <span>"{student?.bio || "কুইজ মেটে স্বাগতম! প্রতিদিন নতুন শিখি 🚀"}"</span>
                          <Edit3 size={10} className="opacity-50 flex-shrink-0 not-italic" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Compact Stat Bar (frosted) ─────────────── */}
                <div
                  className="relative z-10 mx-3 mb-3 rounded-2xl px-3 py-2.5 flex items-center justify-around border border-white/10 shadow-inner"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <StatPill icon={Zap} label="XP" value={pts} color="#F59E0B" />
                  <div className="w-px h-6 bg-white/10" />
                  <StatPill icon={Flame} label="স্ট্রিক" value={student?.streak || 0} color="#F97316" />
                  <div className="w-px h-8 bg-white/10" />
                  <StatPill icon={Trophy} label="কুইজ" value={student?.totalExam || 0} color="#0D9488" />
                  <div className="w-px h-8 bg-white/10" />
                  <StatPill icon={Heart} label="লাইক" value={student?.likesCount || 0} color="#EC4899" />
                </div>
              </motion.div>

              {/* ════════════════════════════════════ */}
              {/* QUICK ACTIONS ROW                    */}
              {/* ════════════════════════════════════ */}
              <div className="mx-3 mt-3 grid grid-cols-4 gap-2">
                {[
                  { icon: Share2, label: "শেয়ার", color: "#0D9488", action: () => setIsShareModalOpen(true) },
                  { icon: Edit3, label: "বায়ো", color: "#6366F1", action: () => setIsEditingBio(true) },
                  { icon: Users, label: "বন্ধু", color: "#EC4899", action: () => setActiveTab("friends") },
                  { icon: Settings, label: "সেটিংস", color: "#F59E0B", action: () => setActiveTab("about") },
                ].map(({ icon: Icon, label, color, action }) => (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.93 }}
                    transition={spring}
                    onClick={action}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-[18px] bg-white cursor-pointer"
                    style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)" }}
                  >
                    <div className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{ background: `${color}15` }}>
                      <Icon size={17} style={{ color }} />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-600">{label}</span>
                  </motion.button>
                ))}
              </div>

              {/* ════════════════════════════════════ */}
              {/* XP PROGRESS BANNER                   */}
              {/* ════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ...spring }}
                className="mx-3 mt-3 p-4 rounded-[20px] bg-white"
                style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Crown size={16} style={{ color: rank.color }} />
                    <span className="text-[13px] font-bold text-slate-800" style={{ letterSpacing: "-0.015em" }}>
                      Level {lvl} — {rank.emoji} {rank.title}
                    </span>
                  </div>
                  <span className="text-[12px] font-extrabold tabular-nums" style={{ color: rank.color }}>
                    {pts} XP
                  </span>
                </div>
                {/* Bar */}
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1, ease: [0.34, 1.04, 0.64, 1], delay: 0.3 }}
                    style={{ background: `linear-gradient(90deg, ${rank.color}, #6366F1)` }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep" />
                  </motion.div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1.5 tabular-nums">
                  পরবর্তী লেভেলে আরও <span className="text-slate-600 font-bold">{Math.max(0, (lvl * 250) - pts)} XP</span> প্রয়োজন
                </p>
              </motion.div>

              {/* ════════════════════════════════════ */}
              {/* TABS                                 */}
              {/* ════════════════════════════════════ */}
              <div className="mx-3 mt-3">
                <div className="flex gap-1.5 bg-white rounded-[18px] p-1.5" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
                  {([
                    { id: "badges" as TabId, label: t("tab_badges"), count: unlockedCount },
                    { id: "friends" as TabId, label: t("tab_friends"), count: friends.length, dot: incomingRequests.length > 0 },
                    { id: "about" as TabId, label: t("tab_settings"), count: null },
                  ]).map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.96 }}
                        transition={spring}
                        onClick={() => setActiveTab(tab.id)}
                        className="relative flex-1 py-2.5 rounded-[13px] text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        style={{ color: isActive ? "#0D9488" : "#94a3b8" }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="tabPill"
                            className="absolute inset-0 rounded-[13px]"
                            style={{ background: "rgba(13,148,136,0.08)", border: "1.5px solid rgba(13,148,136,0.15)" }}
                            transition={spring}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                        {tab.count !== null && (
                          <span className={`relative z-10 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
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
              </div>

              {/* ════════════════════════════════════ */}
              {/* TAB CONTENT                          */}
              {/* ════════════════════════════════════ */}
              <div className="mx-3 mt-3">
                <AnimatePresence mode="wait">

                  {/* ── BADGES ─────────────────────── */}
                  {activeTab === "badges" && (
                    <motion.div
                      key="badges"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-bold text-slate-500">অর্জন ও ব্যাজ</span>
                        <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 tabular-nums">
                          {unlockedCount}/{achievements.length} আনলক
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {achievements.map((ach, i) => (
                          <motion.div
                            key={ach.id}
                            initial={{ opacity: 0, scale: 0.93 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05, ...spring }}
                          >
                            <BadgeCard ach={ach} idx={i} onClick={() => setSelectedAchievement(ach)} />
                          </motion.div>
                        ))}
                        {Array.from({ length: placeholders }).map((_, i) => (
                          <motion.div
                            key={`ph-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (achievements.length + i) * 0.04 }}
                          >
                            <LockedPlaceholder />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ── FRIENDS ────────────────────── */}
                  {activeTab === "friends" && (
                    <motion.div
                      key="friends"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={() => setIsSearchModalOpen(true)}
                        className="w-full py-3.5 rounded-[16px] font-bold text-[13px] text-white flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, #0D9488, #6366F1)",
                          boxShadow: "0 6px 20px rgba(13,148,136,0.3)",
                        }}
                      >
                        <UserPlus size={17} /> নতুন বন্ধু যুক্ত করুন
                      </motion.button>

                      {/* Pending requests */}
                      {incomingRequests.length > 0 && (
                        <div className="rounded-[20px] bg-amber-50 border border-amber-100 p-3.5 space-y-2.5">
                          <p className="text-[10.5px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                            ⏳ অপেক্ষমাণ রিকোয়েস্ট ({incomingRequests.length})
                          </p>
                          {incomingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between gap-3 bg-white rounded-[14px] p-3 border border-amber-100">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                  {req.senderAvatar
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={req.senderAvatar} alt={req.senderName} className="h-full w-full object-cover" />
                                    : req.senderName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[12px] font-bold text-slate-900 truncate">{req.senderName}</p>
                                  <p className="text-[10px] text-amber-600 font-medium tabular-nums">{req.senderUid}</p>
                                </div>
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => respondReq(req.id, "accept")} disabled={respondingReqId === req.id} className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer">
                                  {respondingReqId === req.id ? <Loader2 size={13} className="text-white animate-spin" /> : <UserCheck size={14} className="text-white" />}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => respondReq(req.id, "decline")} disabled={respondingReqId === req.id} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer">
                                  <UserX size={14} className="text-slate-500" />
                                </motion.button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Friends list */}
                      {friends.length === 0 ? (
                        <div className="rounded-[20px] bg-white border border-slate-100 p-8 text-center flex flex-col items-center" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.04)" }}>
                          <div className="w-14 h-14 rounded-[18px] bg-slate-100 flex items-center justify-center mb-3">
                            <Users size={26} className="text-slate-300" />
                          </div>
                          <p className="text-[13px] font-bold text-slate-700">এখনো কোনো বন্ধু নেই</p>
                          <p className="text-[11px] text-slate-400 mt-1">UID দিয়ে বন্ধু খুঁজে যোগ করুন!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {friends.map(f => (
                            <FriendRow
                              key={f.email}
                              f={f}
                              onRemove={() => removeFriend(f.email)}
                              removing={removingEmail === f.email}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── ABOUT / SETTINGS ───────────── */}
                  {activeTab === "about" && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5"
                    >
                      {/* 1. Profile Info Form */}
                      <div className="rounded-[20px] bg-white p-4 space-y-3" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <User size={16} className="text-teal-600" />
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">{t("settings_personal_info")}</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_name_label")}</label>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            placeholder={t("settings_name_placeholder")}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[13px] text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_bio_label")}</label>
                          <input
                            type="text"
                            value={bioInput}
                            onChange={e => setBioInput(e.target.value)}
                            maxLength={80}
                            placeholder={t("settings_bio_placeholder")}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[13px] text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_email_label")}</label>
                          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 border border-slate-200/80 rounded-[13px] text-[13px] font-semibold text-slate-500">
                            <span className="truncate">{student?.email || session?.user?.email || "-"}</span>
                            <Lock size={13} className="text-slate-400 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      </div>

                      {/* 2. Academic Info */}
                      <div className="rounded-[20px] bg-white p-4 space-y-3" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <GraduationCap size={16} className="text-indigo-500" />
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">{t("settings_academic_info")}</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_class_label")}</label>
                          <select
                            value={classId}
                            onChange={e => setClassId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[13px] text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                          >
                            {CLASSES_LIST.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_group_label")}</label>
                          <select
                            value={group}
                            onChange={e => setGroup(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[13px] text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                          >
                            {GROUPS_LIST.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* 3. App Settings & Location */}
                      <div className="rounded-[20px] bg-white p-4 space-y-3" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe size={16} className="text-amber-500" />
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">{t("settings_app_location_info")}</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_language_label")}</label>
                          <select
                            value={language}
                            onChange={e => {
                              const newLang = e.target.value as Language;
                              setLanguage(newLang);
                              setGlobalLanguage(newLang);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[13px] text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer transition-all"
                          >
                            <option value="bn">বাংলা (Bengali)</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_district_label")}</label>
                            <input
                              type="text"
                              value={district}
                              onChange={e => setDistrict(e.target.value)}
                              placeholder={t("settings_district_placeholder")}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[13px] text-[12.5px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t("settings_division_label")}</label>
                            <input
                              type="text"
                              value={division}
                              onChange={e => setDivision(e.target.value)}
                              placeholder={t("settings_division_placeholder")}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[13px] text-[12.5px] font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. Save Button */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={saveSettings}
                        disabled={isSavingSettings}
                        className="w-full py-3.5 rounded-[16px] font-extrabold text-[13.5px] text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all"
                        style={{ background: "linear-gradient(135deg, #0D9488, #6366F1)", boxShadow: "0 6px 20px rgba(13,148,136,0.3)" }}
                      >
                        {isSavingSettings ? (
                          <><Loader2 size={16} className="animate-spin" /> {t("settings_saving")}</>
                        ) : (
                          <><Check size={16} /> {t("settings_save_btn")}</>
                        )}
                      </motion.button>

                      {/* 5. Support */}
                      <div className="rounded-[20px] bg-white overflow-hidden divide-y divide-slate-50" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
                        <div className="px-4 pt-3.5 pb-2 flex items-center gap-2">
                          <HelpCircle size={14} className="text-slate-400" />
                          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{t("settings_support_info")}</span>
                        </div>
                        <SettingsRow icon={HelpCircle} label={t("settings_help_center")} value={t("settings_help_center_val")} color="#6366F1" />
                        <SettingsRow icon={Shield} label={t("settings_privacy_policy")} value={t("settings_privacy_policy_val")} color="#3B82F6" />
                      </div>

                      {/* Version */}
                      <div className="text-center py-1">
                        <span className="text-[10.5px] text-slate-400 font-medium">QuizMate v1.0.0 • Made with ❤️</span>
                      </div>

                      {/* Logout */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        transition={spring}
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full py-3.5 rounded-[18px] border border-rose-200 bg-white flex items-center justify-center gap-2.5 cursor-pointer hover:bg-rose-50 transition-colors"
                        style={{ boxShadow: "0 2px 10px rgba(225,29,72,0.06)" }}
                      >
                        <LogOut size={17} className="text-rose-500" />
                        <span className="text-[14px] font-bold text-rose-500">{t("settings_logout")}</span>
                      </motion.button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          )}
        </div>
      </div>

      <AchievementModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      <FriendSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} onRefreshFriends={loadData} />
      <ProfileShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} student={student} />
      <BottomNav activeTab="profile" />
    </div>
  );
}
