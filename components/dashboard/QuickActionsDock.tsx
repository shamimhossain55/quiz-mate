"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Swords,
  Trophy,
  BarChart3,
  LucideIcon,
  Sparkles,
  Clock,
  Zap,
  X,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Quiz } from "@/types/firestore";

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
}

export default function QuickActionsDock({ liveQuiz }: QuickActionsDockProps) {
  const router = useRouter();
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [showLiveModal, setShowLiveModal] = useState<boolean>(false);

  useEffect(() => {
    if (!liveQuiz || !liveQuiz.endTime) {
      setTimeLeftStr("");
      return;
    }

    function calculateTimeRemaining() {
      if (!liveQuiz?.endTime) return;
      const endMs = new Date(liveQuiz.endTime).getTime();
      const diffSec = Math.max(0, Math.floor((endMs - Date.now()) / 1000));

      if (diffSec <= 0) {
        setTimeLeftStr("শেষ");
        return;
      }

      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      setTimeLeftStr(formatted);
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
      if (curriculumEl) {
        curriculumEl.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/dashboard#curriculum-section");
      }
    }
  };

  const actions: ActionItem[] = [
    {
      id: "quiz",
      label: "কুইজ খেলুন",
      badge: isLiveExamActive ? "🔴 LIVE" : "HOT",
      onClick: handleQuizClick,
      icon: isLiveExamActive ? Zap : Play,
      gradient: isLiveExamActive
        ? "from-rose-500 via-red-500 to-amber-500"
        : "from-teal-500 to-emerald-600",
      shadow: isLiveExamActive ? "rgba(225,29,72,0.4)" : "rgba(13,148,136,0.3)",
      live: isLiveExamActive,
      subText: isLiveExamActive && timeLeftStr ? `⏳ ${timeLeftStr}` : undefined,
    },
    {
      id: "battle",
      label: "১v১ ব্যাটেল",
      badge: "LIVE",
      path: "/community",
      icon: Swords,
      gradient: "from-violet-600 to-indigo-600",
      shadow: "rgba(99,102,241,0.3)",
      live: true,
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
                  : "border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
              } hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md group overflow-hidden cursor-pointer`}
            >
              {/* Top Right Badge */}
              {item.badge && (
                <span
                  className={`absolute top-1 right-1 px-1.5 py-0.2 text-[6.5px] font-black rounded-full text-white bg-gradient-to-r ${item.gradient} shadow-2xs ${
                    item.live ? "animate-pulse font-black" : ""
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

              {/* Countdown or SubText */}
              {item.subText ? (
                <span className="mt-0.5 text-[8px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md tracking-tight border border-rose-200/60">
                  {item.subText}
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* LIVE EXAM MODAL POPUP */}
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
                    <span>সময় বাকি: {timeLeftStr}</span>
                  </div>
                )}
              </div>

              {/* Modal Body / Exam Metadata */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">মোট প্রশ্ন</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{totalQuestions} টি</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">সময়সীমা</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{duration} মিনিট</p>
                  </div>
                </div>

                {liveQuiz.negativeMarking && (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-2xl text-[10.5px] font-extrabold text-rose-700">
                    <ShieldAlert width={16} height={16} className="text-rose-500 flex-shrink-0" />
                    <span>নেগেটিভ মার্কিং কার্যকর থাকবে (ভুল উত্তরের জন্য নম্বর কাটা যাবে)</span>
                  </div>
                )}

                {/* Primary Button: Take Live Exam */}
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

                {/* Secondary Button: Normal Practice */}
                <button
                  onClick={() => {
                    setShowLiveModal(false);
                    const curriculumEl = document.getElementById("curriculum-section");
                    if (curriculumEl) {
                      curriculumEl.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors text-center"
                >
                  সাধারণ বিষয়ভিত্তিক অনুশীলন করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
