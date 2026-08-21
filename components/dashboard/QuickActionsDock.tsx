"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Trophy,
  BarChart3,
  LucideIcon,
  Sparkles,
  Clock,
  Zap,
  X,
  ChevronRight,
  ShieldAlert,
  Target,
  CheckCircle2,
  Gift,
  Loader2,
  Lock,
  Flame,
  Award,
  BookOpen,
  Swords,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz } from "@/types/firestore";
import {
  DailyMissionConfig,
  DEFAULT_DAILY_MISSIONS,
} from "@/lib/firestore/missions";

// Icon mapping dictionary for dynamic icons configured in admin
const ICON_MAP: Record<string, any> = {
  Target,
  Sparkles,
  Trophy,
  Swords,
  Zap,
  Flame,
  Gift,
  Award,
  BookOpen,
};

interface ActionItem {
  id: string;
  label: string;
  badge?: string;
  path?: string;
  onClick?: () => void;
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  live?: boolean;
  subText?: string;
}

interface QuickActionsDockProps {
  liveQuiz?: Quiz | null;
  // Mission props passed from dashboard
  missionData?: {
    missions: DailyMissionConfig[];
    todayExamsPlayed: number;
    todayCorrectAnswers: number;
    todayHighestScore: number;
    userEmail?: string | null;
    onPointsClaimed?: (newPoints: number, newLevel: number) => void;
    masterBonusXP?: number;
  };
}

export default function QuickActionsDock({ liveQuiz, missionData }: QuickActionsDockProps) {
  const router = useRouter();
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [showLiveModal, setShowLiveModal] = useState<boolean>(false);
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // ── Mission data ─────────────────────────────────────────────────────────
  const activeMissions = (missionData?.missions || DEFAULT_DAILY_MISSIONS).filter(
    (m) => m.active !== false
  );
  const masterBonusXP = missionData?.masterBonusXP || 100;
  const todayExamsPlayed = missionData?.todayExamsPlayed || 0;
  const todayCorrectAnswers = missionData?.todayCorrectAnswers || 0;
  const todayHighestScore = missionData?.todayHighestScore || 0;
  const userEmail = missionData?.userEmail;

  const todayKey = new Date().toISOString().split("T")[0];
  const storageKey = userEmail ? `qm_missions_${userEmail.toLowerCase()}_${todayKey}` : null;

  // Load claimed missions from localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setClaimedMissions(JSON.parse(saved));
    } catch (e) {}

    async function syncClaimed() {
      try {
        const res = await fetch("/api/missions/claim");
        if (res.ok) {
          const data = await res.json();
          if (data.claimedMissions) {
            setClaimedMissions((prev) => {
              const merged = { ...prev, ...data.claimedMissions };
              try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify(merged)); } catch (e) {}
              return merged;
            });
          }
        }
      } catch (e) {}
    }
    syncClaimed();
  }, [storageKey]);

  // Handle claiming a mission
  const handleClaim = async (missionId: string, xp: number, title: string) => {
    if (claimingId) return;
    setClaimingId(missionId);
    try {
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, rewardXP: xp, date: todayKey }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.alreadyClaimed)) {
        const updated = { ...claimedMissions, [missionId]: true };
        setClaimedMissions(updated);
        if (storageKey) {
          try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
        }
        if (data.newPoints !== undefined && missionData?.onPointsClaimed) {
          missionData.onPointsClaimed(data.newPoints, data.newLevel || 1);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("qm_points_updated", { detail: { newPoints: data.newPoints, rewardXP: xp } }));
          window.dispatchEvent(new Event("qm_profile_updated"));
        }
        setClaimedNotice(`🎉 অভিনন্দন! +${xp} XP যোগ হয়েছে!`);
        setTimeout(() => setClaimedNotice(null), 3500);
      } else {
        setClaimedNotice(data.error || "ক্লেইম করতে ব্যর্থ হয়েছে");
        setTimeout(() => setClaimedNotice(null), 3000);
      }
    } catch (e) {
      const updated = { ...claimedMissions, [missionId]: true };
      setClaimedMissions(updated);
      if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (err) {} }
      setClaimedNotice(`🎉 +${xp} XP ক্লেইম সফল!`);
      setTimeout(() => setClaimedNotice(null), 3500);
    } finally {
      setClaimingId(null);
    }
  };

  // ── Process missions with progress ────────────────────────────────────────
  const processedMissions = activeMissions.map((m) => {
    let currentVal = 0;
    if (m.targetType === "quiz_count") currentVal = Math.min(m.target, todayExamsPlayed);
    else if (m.targetType === "correct_answers") currentVal = Math.min(m.target, todayCorrectAnswers);
    else if (m.targetType === "min_score_percent") currentVal = todayHighestScore >= m.target ? m.target : 0;
    else if (m.targetType === "battle_count") currentVal = Math.min(m.target, todayExamsPlayed);
    else currentVal = Math.min(m.target, todayExamsPlayed);
    return { ...m, current: currentVal, IconComponent: ICON_MAP[m.icon] || Target };
  });

  const completedCount = processedMissions.filter((m) => m.current >= m.target).length;
  const totalMissions = processedMissions.length;
  const isAllCompleted = totalMissions > 0 && completedCount === totalMissions;
  const isMasterBonusClaimed = !!claimedMissions["m_master_all_clear"];
  const canClaimMasterBonus = isAllCompleted && !isMasterBonusClaimed;
  // Any mission completed but not yet claimed
  const hasUnclaimed = processedMissions.some(
    (m) => m.current >= m.target && !claimedMissions[m.id]
  ) || canClaimMasterBonus;

  // ── Live quiz timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveQuiz || !liveQuiz.endTime) { setTimeLeftStr(""); return; }
    function calculateTimeRemaining() {
      if (!liveQuiz?.endTime) return;
      const endMs = new Date(liveQuiz.endTime).getTime();
      const diffSec = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      if (diffSec <= 0) { setTimeLeftStr("শেষ"); return; }
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      setTimeLeftStr(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    }
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [liveQuiz]);

  const isLiveExamActive = !!liveQuiz && (liveQuiz.status === "live" || liveQuiz.isLive) && timeLeftStr !== "শেষ";

  const handleQuizClick = () => {
    if (isLiveExamActive) {
      setShowLiveModal(true);
    } else {
      const curriculumEl = document.getElementById("curriculum-section");
      if (curriculumEl) curriculumEl.scrollIntoView({ behavior: "smooth" });
      else router.push("/dashboard#curriculum-section");
    }
  };

  const actions: ActionItem[] = [
    {
      id: "quiz",
      label: "কুইজ খেলুন",
      badge: isLiveExamActive ? "🔴 LIVE" : "HOT",
      onClick: handleQuizClick,
      icon: isLiveExamActive ? Zap : Play,
      gradient: isLiveExamActive ? "from-rose-500 via-red-500 to-amber-500" : "from-teal-500 to-emerald-600",
      shadow: isLiveExamActive ? "rgba(225,29,72,0.4)" : "rgba(13,148,136,0.3)",
      live: isLiveExamActive,
      subText: isLiveExamActive && timeLeftStr ? `⏳ ${timeLeftStr}` : undefined,
    },
    {
      id: "missions",
      label: "মিশন",
      badge: hasUnclaimed ? "🎁" : undefined,
      onClick: () => setShowMissionModal(true),
      icon: Target,
      gradient: hasUnclaimed
        ? "from-amber-500 to-orange-500"
        : completedCount > 0
        ? "from-emerald-500 to-teal-600"
        : "from-indigo-500 to-violet-600",
      shadow: hasUnclaimed ? "rgba(245,158,11,0.35)" : "rgba(99,102,241,0.3)",
    },
    {
      id: "rank",
      label: "লিডারবোর্ড",
      badge: "TOP",
      path: "/leaderboard",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-600",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      id: "progress",
      label: "পারফরম্যান্স",
      badge: "নতুন",
      path: "/progress",
      icon: BarChart3,
      gradient: "from-rose-500 to-pink-600",
      shadow: "rgba(244,63,94,0.3)",
    },
  ];

  const totalQuestions = liveQuiz?.questions?.length || liveQuiz?.totalQuestions || liveQuiz?.questionsCount || 10;
  const duration = liveQuiz?.duration || 10;

  return (
    <div>
      {/* Quick Action Title & Live Status Indicator */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles width={13} height={13} className="text-amber-500 fill-amber-400" />
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
            দ্রুত অ্যাকশন
          </h3>
        </div>

        {isLiveExamActive && (
          <button
            onClick={() => setShowLiveModal(true)}
            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 px-2 py-0.5 rounded-full transition-colors cursor-pointer animate-pulse"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
            <span className="text-[9.5px] font-extrabold text-rose-700">লাইভ এক্সাম চলছে</span>
          </button>
        )}
      </div>

      {/* Grid of 4 Shortcut Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {actions.map((item) => {
          const Icon = item.icon;
          const isMissionBtn = item.id === "missions";

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                if (item.onClick) item.onClick();
                else if (item.path) router.push(item.path);
              }}
              className={`relative flex flex-col items-center justify-center pt-2.5 pb-2 px-1 rounded-2xl bg-white border ${
                item.live && item.id === "quiz"
                  ? "border-rose-300 ring-2 ring-rose-400/30 shadow-[0_4px_16px_rgba(225,29,72,0.15)]"
                  : isMissionBtn && hasUnclaimed
                  ? "border-amber-300 ring-2 ring-amber-400/30 shadow-[0_4px_16px_rgba(245,158,11,0.15)]"
                  : "border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
              } hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md group overflow-hidden cursor-pointer`}
            >
              {/* Top Right Badge */}
              {item.badge && (
                <span
                  className={`absolute top-1 right-1 px-1.5 py-0.2 text-[6.5px] font-black rounded-full text-white bg-gradient-to-r ${item.gradient} shadow-2xs ${
                    item.live || (isMissionBtn && hasUnclaimed) ? "animate-pulse" : ""
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Icon Box */}
              <div
                className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform`}
                style={{ boxShadow: `0 4px 12px ${item.shadow}` }}
              >
                <Icon width={18} height={18} className="text-white" />
              </div>

              {/* Label */}
              <span className="text-[9.5px] font-extrabold text-slate-800 text-center leading-tight">
                {item.label}
              </span>

              {/* Mission progress sub-text */}
              {isMissionBtn ? (
                <span
                  className={`mt-0.5 text-[8px] font-black px-1.5 py-0.2 rounded-md tracking-tight border ${
                    hasUnclaimed
                      ? "text-amber-700 bg-amber-50 border-amber-200/60"
                      : completedCount === totalMissions && totalMissions > 0
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                      : "text-slate-500 bg-slate-50 border-slate-200/60"
                  }`}
                >
                  {completedCount}/{totalMissions}
                </span>
              ) : item.subText ? (
                <span className="mt-0.5 text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md tracking-tight border border-rose-200/60">
                  {item.subText}
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* ═══════════ MISSION MODAL ═══════════ */}
      <AnimatePresence>
        {showMissionModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-sm rounded-t-3xl bg-white shadow-2xl border-t border-slate-100 overflow-hidden relative max-h-[88vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-4 pt-4 pb-5 text-white flex-shrink-0">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-300/20 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Top row: title + close */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25">
                        <Target width={16} height={16} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-white leading-tight">দৈনিক মিশন</h2>
                        <p className="text-[9px] text-indigo-200 font-medium">মিশন পূরণ করে XP জিতুন</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMissionModal(false)}
                      className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <X width={14} height={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/90 mb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 width={11} height={11} />
                        অগ্রগতি: {completedCount}/{totalMissions} সম্পন্ন
                      </span>
                      <span className="text-amber-300 font-black">
                        {totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable mission list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
                {/* Claim notice toast */}
                <AnimatePresence>
                  {claimedNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-extrabold text-center shadow-lg flex items-center justify-center gap-2 border border-emerald-400/40"
                    >
                      <Sparkles width={14} height={14} className="text-amber-300 fill-amber-300 animate-bounce" />
                      <span>{claimedNotice}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mission cards */}
                {processedMissions.map((mission) => {
                  const Icon = mission.IconComponent;
                  const isDone = mission.current >= mission.target;
                  const isClaimed = !!claimedMissions[mission.id];
                  const isClaiming = claimingId === mission.id;
                  const progressPercent = Math.min(100, Math.round((mission.current / Math.max(1, mission.target)) * 100));

                  return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-2xl border transition-all ${
                        isClaimed
                          ? "bg-slate-50/70 border-slate-200/60 opacity-80"
                          : isDone
                          ? "bg-emerald-50/70 border-emerald-300 shadow-sm ring-1 ring-emerald-200/50"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${mission.bg}`}>
                            <Icon width={17} height={17} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-[11.5px] font-extrabold text-slate-800 leading-tight">
                                {mission.title}
                              </p>
                              <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200/70 flex-shrink-0">
                                +{mission.rewardXP} XP
                              </span>
                            </div>
                            <p className="text-[9.5px] font-medium text-slate-500 mt-0.5 line-clamp-1">
                              {mission.desc}
                            </p>
                          </div>
                        </div>

                        {/* Claim / Status Button */}
                        <div className="flex-shrink-0">
                          {isClaimed ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-1.5 rounded-xl border border-emerald-300/80">
                              <CheckCircle2 width={12} height={12} /> ক্লেইমড
                            </span>
                          ) : isDone ? (
                            <button
                              onClick={() => handleClaim(mission.id, mission.rewardXP, mission.title)}
                              disabled={isClaiming}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-[10.5px] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 animate-pulse cursor-pointer disabled:opacity-75"
                            >
                              {isClaiming ? (
                                <Loader2 width={12} height={12} className="animate-spin" />
                              ) : (
                                <Gift width={12} height={12} />
                              )}
                              ক্লেইম
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setShowMissionModal(false);
                                const el = document.getElementById("curriculum-section");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-xl border border-teal-200/80 active:scale-95 transition-all cursor-pointer"
                            >
                              <span>{mission.actionText || "কুইজ খেলুন"}</span>
                              <ArrowRight width={11} height={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {!isClaimed && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                            <motion.div
                              className={`h-full rounded-full ${isDone ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-indigo-400 to-violet-500"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-slate-500">
                            {mission.current}/{mission.target}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* All-Clear Master Bonus */}
                <div
                  className={`p-3 rounded-2xl border transition-all ${
                    isMasterBonusClaimed
                      ? "bg-slate-50 border-slate-200/60 opacity-80"
                      : isAllCompleted
                      ? "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/80 border-amber-300 shadow-sm"
                      : "bg-slate-50/50 border-dashed border-slate-300/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isMasterBonusClaimed
                            ? "bg-emerald-100 text-emerald-700"
                            : isAllCompleted
                            ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white animate-bounce"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {isMasterBonusClaimed ? (
                          <CheckCircle2 width={17} height={17} />
                        ) : isAllCompleted ? (
                          <Trophy width={17} height={17} />
                        ) : (
                          <Lock width={16} height={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 leading-tight">
                          দৈনিক অল-ক্লিয়ার বোনাস 🏆
                        </p>
                        <p className="text-[9px] font-semibold text-slate-500 mt-0.5">
                          {isMasterBonusClaimed
                            ? "আজকের মাস্টার বোনাস সংগৃহীত"
                            : isAllCompleted
                            ? "সবগুলো মিশন সম্পন্ন! বিশেষ বোনাস সংগ্রহ করুন"
                            : `সবগুলো (${totalMissions}টি) মিশন শেষ করে আনলক করুন`}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isMasterBonusClaimed ? (
                        <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-xl">
                          ক্লেইমড
                        </span>
                      ) : canClaimMasterBonus ? (
                        <button
                          onClick={() => handleClaim("m_master_all_clear", masterBonusXP, "দৈনিক অল-ক্লিয়ার বোনাস")}
                          disabled={claimingId === "m_master_all_clear"}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-[10.5px] shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {claimingId === "m_master_all_clear" ? (
                            <Loader2 width={12} height={12} className="animate-spin" />
                          ) : (
                            <Sparkles width={12} height={12} className="text-amber-200 fill-amber-200" />
                          )}
                          +{masterBonusXP} XP
                        </button>
                      ) : (
                        <span className="text-[9.5px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-xl">
                          {completedCount}/{totalMissions} লকড
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom padding for safe area */}
                <div className="h-3" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ LIVE EXAM MODAL ═══════════ */}
      <AnimatePresence>
        {showLiveModal && liveQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden relative"
            >
              {/* Modal Header Bar with Close */}
              <div className="relative bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 p-4 text-white">
                <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-400/25 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10 mb-2">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
                    <span className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                      🔴 লাইভ এক্সাম চলছে
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLiveModal(false)}
                    className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <X width={15} height={15} />
                  </button>
                </div>

                <h3 className="text-base font-black text-white leading-tight drop-shadow-xs">
                  {liveQuiz.title || liveQuiz.name}
                </h3>
                <p className="text-[11px] text-rose-100 font-medium mt-0.5 flex items-center gap-2">
                  <span>📚 {liveQuiz.subjectName || liveQuiz.subject || "সাধারণ"}</span>
                  {liveQuiz.chapterName && <span>• 📖 {liveQuiz.chapterName}</span>}
                </p>

                {timeLeftStr && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 font-mono text-xs font-black text-amber-300">
                    <Clock width={13} height={13} className="text-amber-300" />
                    <span>সময় বাকি: {timeLeftStr}</span>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">মোট প্রশ্ন</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{totalQuestions} টি</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">সময়সীমা</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{duration} মিনিট</p>
                  </div>
                </div>

                {liveQuiz.negativeMarking && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-2xl text-[10.5px] font-extrabold text-rose-700">
                    <ShieldAlert width={16} height={16} className="text-rose-500 flex-shrink-0" />
                    <span>নেগেটিভ মার্কিং কার্যকর থাকবে</span>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setShowLiveModal(false);
                    router.push(`/quiz/play?quizId=${liveQuiz.id}&mode=live`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-lg shadow-rose-500/30 transition-all cursor-pointer"
                >
                  <Zap width={16} height={16} className="fill-white" />
                  <span>লাইভ এক্সামে অংশ নিন</span>
                  <ChevronRight width={16} height={16} />
                </motion.button>

                <button
                  onClick={() => {
                    setShowLiveModal(false);
                    const curriculumEl = document.getElementById("curriculum-section");
                    if (curriculumEl) curriculumEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
                >
                  সাধারণ বিষয়ভিত্তিক অনুশীলন করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
