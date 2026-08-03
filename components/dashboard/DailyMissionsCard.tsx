"use client";

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Sparkles, Gift, Zap, Swords, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Mission {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  rewardXP: number;
  icon: any;
  color: string;
  bg: string;
}

interface DailyMissionsCardProps {
  totalExamsPlayed?: number;
  correctAnswersCount?: number;
  userEmail?: string | null;
}

export default function DailyMissionsCard({
  totalExamsPlayed = 0,
  correctAnswersCount = 0,
  userEmail,
}: DailyMissionsCardProps) {
  const [claimedMissions, setClaimedMissions] = useState<Record<string, boolean>>({});
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // Key tied to user email and current date (YYYY-MM-DD)
  const todayKey = new Date().toISOString().split("T")[0];
  const storageKey = userEmail ? `qm_missions_${userEmail.toLowerCase()}_${todayKey}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setClaimedMissions(JSON.parse(saved));
      }
    } catch (e) {}
  }, [storageKey]);

  const handleClaim = (missionId: string, xp: number, title: string) => {
    const updated = { ...claimedMissions, [missionId]: true };
    setClaimedMissions(updated);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
    }

    setClaimedNotice(`🎉 চমৎকার! +${xp} XP অর্জন করেছেন (${title})!`);
    setTimeout(() => {
      setClaimedNotice(null);
    }, 3500);
  };

  const missions: Mission[] = [
    {
      id: "m1",
      title: "১টি কুইজ খেলুন",
      desc: "যেকোনো বিষয়ে একটি পূর্ণাঙ্গ কুইজ সম্পন্ন করুন",
      target: 1,
      current: Math.min(1, totalExamsPlayed),
      rewardXP: 50,
      icon: Target,
      color: "#0F766E",
      bg: "bg-teal-50 border-teal-200/80 text-teal-700",
    },
    {
      id: "m2",
      title: "১০টি সঠিক উত্তর",
      desc: "কুইজে ১০টি প্রশ্নের সঠিক উত্তর লিখুন",
      target: 10,
      current: Math.min(10, correctAnswersCount),
      rewardXP: 75,
      icon: Sparkles,
      color: "#D97706",
      bg: "bg-amber-50 border-amber-200/80 text-amber-700",
    },
    {
      id: "m3",
      title: "১v১ কুইজ ব্যাটেল",
      desc: "বন্ধুর সাথে বা মাল্টিপ্লেয়ার ব্যাটেলে অংশগ্রহণ করুন",
      target: 1,
      current: totalExamsPlayed >= 2 ? 1 : 0,
      rewardXP: 100,
      icon: Swords,
      color: "#4338CA",
      bg: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
    },
  ];

  const completedCount = missions.filter((m) => m.current >= m.target).length;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-teal-400/10 to-indigo-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Gift width={16} height={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              দৈনিক মিশন & রিওয়ার্ড
              <span className="text-[9px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-100">
                {completedCount}/৩
              </span>
            </h3>
            <p className="text-[9.5px] font-semibold text-slate-500">প্রতিদিন নতুন মিশন পূরণ করে XP সংগ্রহ করুন</p>
          </div>
        </div>

        {/* Total reward badge */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-xl text-[10px] font-extrabold text-amber-700">
          <Zap width={11} height={11} className="text-amber-500 fill-amber-400 animate-pulse" />
          <span>+২২৫ XP</span>
        </div>
      </div>

      {/* Claim Banner Notice Toast */}
      <AnimatePresence>
        {claimedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-extrabold text-center shadow-md flex items-center justify-center gap-1.5"
          >
            <Sparkles width={14} height={14} className="text-amber-300 fill-amber-300" />
            <span>{claimedNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missions List */}
      <div className="space-y-2">
        {missions.map((mission) => {
          const Icon = mission.icon;
          const isDone = mission.current >= mission.target;
          const isClaimed = !!claimedMissions[mission.id];
          const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-2.5 rounded-2xl border transition-all ${
                isClaimed
                  ? "bg-slate-50 border-slate-200/60 opacity-80"
                  : isDone
                  ? "bg-emerald-50/60 border-emerald-300/80 shadow-2xs"
                  : "bg-slate-50/50 border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${mission.bg}`}
                  >
                    <Icon width={16} height={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-800 leading-tight truncate">
                      {mission.title}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-500 truncate mt-0.5">
                      {mission.desc}
                    </p>
                  </div>
                </div>

                {/* Status / Claim Button */}
                <div className="flex-shrink-0">
                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-[9.5px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-xl border border-emerald-200">
                      <CheckCircle2 width={11} height={11} /> ক্লেইমড
                    </span>
                  ) : isDone ? (
                    <button
                      onClick={() => handleClaim(mission.id, mission.rewardXP, mission.title)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[10px] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                    >
                      <Gift width={11} height={11} />
                      ক্লেইম (+{mission.rewardXP} XP)
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[9.5px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      <span>{mission.current}/{mission.target}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar inside mission */}
              {!isClaimed && (
                <div className="mt-2 h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
