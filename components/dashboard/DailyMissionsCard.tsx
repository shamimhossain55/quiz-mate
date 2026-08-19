"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  Sparkles,
  Gift,
  Zap,
  Clock,
  ArrowRight,
  Trophy,
  Loader2,
  Lock,
  Swords,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DailyMissionConfig,
  DEFAULT_DAILY_MISSIONS,
  getDailyMissionsConfig,
  getDailyMissionsSettings,
} from "@/lib/firestore/missions";

// Icon mapping dictionary for dynamic icons configured in admin
const ICON_MAP: Record<string, any> = {
  Target: Target,
  Sparkles: Sparkles,
  Trophy: Trophy,
  Swords: Swords,
  Zap: Zap,
  Flame: Flame,
  Gift: Gift,
  Award: Award,
  BookOpen: BookOpen,
};

export interface DailyMissionsCardProps {
  todayExamsPlayed?: number;
  todayCorrectAnswers?: number;
  todayHighestScore?: number;
  userEmail?: string | null;
  onPointsClaimed?: (newPoints: number, newLevel: number) => void;
  configuredMissions?: DailyMissionConfig[];
  allClearBonusXP?: number;
}

export default function DailyMissionsCard({
  todayExamsPlayed = 0,
  todayCorrectAnswers = 0,
  todayHighestScore = 0,
  userEmail,
  onPointsClaimed,
  configuredMissions: propsMissions,
  allClearBonusXP: propsAllClearXP,
}: DailyMissionsCardProps) {
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [activeMissions, setActiveMissions] = useState<DailyMissionConfig[]>(
    propsMissions && propsMissions.length > 0 ? propsMissions : DEFAULT_DAILY_MISSIONS
  );
  const [masterBonusXP, setMasterBonusXP] = useState<number>(propsAllClearXP || 100);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);

  // Date key YYYY-MM-DD
  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const storageKey = userEmail ? `qm_missions_${userEmail.toLowerCase()}_${todayKey}` : null;

  // Load configured missions from props or Firestore
  useEffect(() => {
    if (propsMissions && propsMissions.length > 0) {
      setActiveMissions(propsMissions.filter((m) => m.active !== false));
      return;
    }

    async function loadMissionsConfig() {
      try {
        const [config, settings] = await Promise.all([
          getDailyMissionsConfig(),
          getDailyMissionsSettings(),
        ]);
        if (config && config.length > 0) {
          setActiveMissions(config.filter((m) => m.active !== false));
        }
        if (settings) {
          setMasterBonusXP(settings.allClearBonusXP || 100);
          setIsFeatureEnabled(settings.enabled !== false);
        }
      } catch (e) {
        console.error("Failed to load daily missions config", e);
      }
    }
    loadMissionsConfig();
  }, [propsMissions]);

  // Live countdown to midnight (Daily Reset)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeftStr("০মিনিট");
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeftStr(`${hours}ঘ ${minutes}মি`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch claimed missions from localStorage and API
  useEffect(() => {
    if (!storageKey) return;

    // Load fast from cache
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setClaimedMissions(JSON.parse(saved));
      }
    } catch (e) {}

    // Sync with server in background
    async function syncClaimed() {
      try {
        const res = await fetch("/api/missions/claim");
        if (res.ok) {
          const data = await res.json();
          if (data.claimedMissions) {
            setClaimedMissions((prev) => {
              const merged = { ...prev, ...data.claimedMissions };
              try {
                if (storageKey) localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch (e) {}
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
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {}
        }

        if (data.newPoints !== undefined && onPointsClaimed) {
          onPointsClaimed(data.newPoints, data.newLevel || 1);
        }

        // Dispatch window events for header & other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("qm_points_updated", {
              detail: { newPoints: data.newPoints, rewardXP: xp },
            })
          );
          window.dispatchEvent(new Event("qm_profile_updated"));
        }

        setClaimedNotice(`🎉 অভিনন্দন! +${xp} XP যোগ হয়েছে (${title})!`);
        setTimeout(() => {
          setClaimedNotice(null);
        }, 4000);
      } else {
        setClaimedNotice(data.error || "ক্লেইম করতে ব্যর্থ হয়েছে");
        setTimeout(() => setClaimedNotice(null), 3000);
      }
    } catch (e) {
      // Fallback offline claim
      const updated = { ...claimedMissions, [missionId]: true };
      setClaimedMissions(updated);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {}
      }
      setClaimedNotice(`🎉 +${xp} XP ক্লেইম সফল!`);
      setTimeout(() => setClaimedNotice(null), 3500);
    } finally {
      setClaimingId(null);
    }
  };

  const scrollToCurriculum = () => {
    const el = document.getElementById("curriculum-section") || document.getElementById("continue-learning-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  if (!isFeatureEnabled) return null;

  // Process missions with current progress
  const processedMissions = activeMissions.map((m) => {
    let currentVal = 0;
    if (m.targetType === "quiz_count") {
      currentVal = Math.min(m.target, todayExamsPlayed);
    } else if (m.targetType === "correct_answers") {
      currentVal = Math.min(m.target, todayCorrectAnswers);
    } else if (m.targetType === "min_score_percent") {
      currentVal = todayHighestScore >= m.target ? m.target : 0;
    } else if (m.targetType === "battle_count") {
      currentVal = Math.min(m.target, todayExamsPlayed);
    } else {
      currentVal = Math.min(m.target, todayExamsPlayed);
    }

    return {
      ...m,
      current: currentVal,
      IconComponent: ICON_MAP[m.icon] || Target,
    };
  });

  const totalRewardsAvailable =
    processedMissions.reduce((acc, curr) => acc + (curr.rewardXP || 0), 0) + masterBonusXP;

  const completedCount = processedMissions.filter((m) => m.current >= m.target).length;
  const isAllCompleted = processedMissions.length > 0 && completedCount === processedMissions.length;
  const isMasterBonusClaimed = !!claimedMissions["m_master_all_clear"];
  const canClaimMasterBonus = isAllCompleted && !isMasterBonusClaimed;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-teal-400/10 via-amber-400/10 to-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-100">
            <Gift width={18} height={18} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              দৈনিক মিশন & টার্গেট
              <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
                {completedCount}/{processedMissions.length} সম্পন্ন
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9.5px] font-semibold text-slate-500">প্রতিদিনের মিশন পূরণ করে XP বাড়ান</p>
              {timeLeftStr && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                  <Clock width={10} height={10} />
                  রিসেট: {timeLeftStr}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Reward Badge */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/90 px-2.5 py-1 rounded-xl text-[10.5px] font-black text-amber-800 shadow-2xs">
          <Zap width={12} height={12} className="text-amber-500 fill-amber-400 animate-pulse" />
          <span>+{totalRewardsAvailable} XP</span>
        </div>
      </div>

      {/* Claim Toast / Celebration Notice */}
      <AnimatePresence>
        {claimedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white text-[11px] font-extrabold text-center shadow-lg flex items-center justify-center gap-2 border border-emerald-400/40"
          >
            <Sparkles width={16} height={16} className="text-amber-300 fill-amber-300 animate-bounce" />
            <span>{claimedNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Target Progress Bar */}
      <div className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/40 border border-slate-200/80">
        <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1.5">
          <span className="flex items-center gap-1">
            <Target width={12} height={12} className="text-teal-600" />
            দৈনিক লক্ষ্যমাত্রা অগ্রগতি
          </span>
          <span className="text-teal-700 font-black">
            {processedMissions.length > 0
              ? Math.round((completedCount / processedMissions.length) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
            style={{
              width: `${
                processedMissions.length > 0
                  ? (completedCount / processedMissions.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-2.5">
        {processedMissions.map((mission) => {
          const Icon = mission.IconComponent;
          const isDone = mission.current >= mission.target;
          const isClaimed = !!claimedMissions[mission.id];
          const isClaiming = claimingId === mission.id;
          const progressPercent = Math.min(
            100,
            Math.round((mission.current / Math.max(1, mission.target)) * 100)
          );

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-2xl border transition-all ${
                isClaimed
                  ? "bg-slate-50/70 border-slate-200/60 opacity-85"
                  : isDone
                  ? "bg-emerald-50/70 border-emerald-300 shadow-2xs ring-1 ring-emerald-200/50"
                  : "bg-white border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${mission.bg}`}
                  >
                    <Icon width={17} height={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11.5px] font-extrabold text-slate-800 leading-tight truncate">
                        {mission.title}
                      </p>
                      <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200/70 flex-shrink-0">
                        +{mission.rewardXP} XP
                      </span>
                    </div>
                    <p className="text-[9.5px] font-semibold text-slate-500 truncate mt-0.5">
                      {mission.targetType === "min_score_percent" && todayHighestScore > 0 && todayHighestScore < mission.target
                        ? `আজকের সেরা স্কোর: ${todayHighestScore}%`
                        : mission.desc}
                    </p>
                  </div>
                </div>

                {/* Status / Claim Button */}
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
                      onClick={scrollToCurriculum}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-xl border border-teal-200/80 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{mission.actionText || "কুইজ খেলুন"}</span>
                      <ArrowRight width={11} height={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar inside mission */}
              {!isClaimed && (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-teal-400 to-teal-600"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-500">
                    {mission.current}/{mission.target}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Master All-Clear Bonus Box */}
      <div
        className={`mt-3 p-3 rounded-2xl border transition-all ${
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
              className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isMasterBonusClaimed
                  ? "bg-emerald-100 text-emerald-700"
                  : isAllCompleted
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-2xs animate-bounce"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {isMasterBonusClaimed ? (
                <CheckCircle2 width={16} height={16} />
              ) : isAllCompleted ? (
                <Trophy width={16} height={16} />
              ) : (
                <Lock width={15} height={15} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-800 leading-tight truncate">
                দৈনিক অল-ক্লিয়ার বোনাস 🏆
              </p>
              <p className="text-[9px] font-semibold text-slate-500 truncate">
                {isMasterBonusClaimed
                  ? "আজকের মাস্টার বোনাস সংগৃহীত"
                  : isAllCompleted
                  ? "সবগুলো মিশন সম্পন্ন! বিশেষ বোনাস সংগ্রহ করুন"
                  : `সবগুলো (${processedMissions.length}টি) মিশন শেষ করে আনলক করুন (+${masterBonusXP} XP)`}
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
                onClick={() => handleClaim("m_master_all_clear", masterBonusXP, "দৈনিক অল-ক্লিয়ার বোনাস")}
                disabled={claimingId === "m_master_all_clear"}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-[10.5px] shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                {claimingId === "m_master_all_clear" ? (
                  <Loader2 width={12} height={12} className="animate-spin" />
                ) : (
                  <Sparkles width={12} height={12} className="text-amber-200 fill-amber-200" />
                )}
                +{masterBonusXP} XP বোনাস
              </button>
            ) : (
              <span className="text-[9.5px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-xl">
                {completedCount}/{processedMissions.length} লকড
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
