"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Clock,
  HelpCircle,
  Zap,
  Shield,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  X,
  Star,
} from "lucide-react";

import { useQuizConfig } from "@/context/QuizConfigContext";
import { useQuizSession } from "@/context/QuizSessionContext";
import { useQuiz } from "@/context/QuizContext";
import { startQuiz } from "@/lib/quiz/startQuiz";

interface QuizSetupCardProps {
  chapterId: string;
  subjectId?: string;
}

// Game mode presets
const gameModes = [
  {
    id: "rapid",
    icon: "⚡",
    name: "র‍্যাপিড ফায়ার",
    desc: "দ্রুত ও তীক্ষ্ণ",
    questions: 10,
    time: 5,
    xp: 120,
    gradient: "from-orange-500 to-rose-600",
    glow: "shadow-orange-500/30",
    border: "border-orange-400/40",
    bg: "bg-orange-500/10",
    badge: "HOT",
    badgeColor: "bg-orange-500",
  },
  {
    id: "standard",
    icon: "🎯",
    name: "স্ট্যান্ডার্ড",
    desc: "সুষম পরীক্ষা",
    questions: 20,
    time: 20,
    xp: 250,
    gradient: "from-teal-500 to-emerald-600",
    glow: "shadow-teal-500/30",
    border: "border-teal-400/40",
    bg: "bg-teal-500/10",
    badge: "BEST",
    badgeColor: "bg-teal-500",
  },
  {
    id: "master",
    icon: "🏆",
    name: "মাস্টার",
    desc: "চ্যালেঞ্জিং মোড",
    questions: 30,
    time: 30,
    xp: 400,
    gradient: "from-violet-500 to-indigo-600",
    glow: "shadow-violet-500/30",
    border: "border-violet-400/40",
    bg: "bg-violet-500/10",
    badge: "PRO",
    badgeColor: "bg-violet-500",
  },
];

const questionCounts = [10, 15, 20, 25, 30];
const timeLimits = [5, 10, 15, 20, 30];

export default function QuizSetupCard({ chapterId, subjectId }: QuizSetupCardProps) {
  const router = useRouter();
  const { setConfig } = useQuizConfig();
  const { setSession } = useQuizSession();
  const { resetQuiz } = useQuiz();

  const [selectedMode, setSelectedMode] = useState<string>("standard");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(20);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // XP reward calculator
  const baseXP = questionCount * 10;
  const timeBonus = timeLimit <= 10 ? 50 : timeLimit <= 20 ? 25 : 0;
  const negativeBonus = negativeMarking ? 30 : 0;
  const estimatedXP = baseXP + timeBonus + negativeBonus;

  function handleModeSelect(mode: (typeof gameModes)[0]) {
    setSelectedMode(mode.id);
    setQuestionCount(mode.questions);
    setTimeLimit(mode.time);
  }

  async function handleStartQuiz() {
    setIsStarting(true);
    try {
      resetQuiz();
      setConfig({ chapterId, subjectId, questionCount, timeLimit, negativeMarking });
      const session = startQuiz(chapterId, questionCount, timeLimit, negativeMarking);
      setSession(session);
      router.push("/quiz/play");
    } catch {
      setIsStarting(false);
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-4 no-scrollbar">

      {/* ── HERO BANNER ── */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden shadow-[0_16px_40px_-8px_rgba(13,148,136,0.35)] border border-white/20"
        style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4F46E5 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles width={14} height={14} className="text-amber-300" />
            <span className="text-[11px] font-extrabold text-teal-100/90 uppercase tracking-widest">
              কুইজ সেটআপ
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight tracking-tight mb-1">
            তোমার কুইজ কনফিগার করো
          </h1>
          <p className="text-[12px] text-teal-100/80 font-medium flex items-center gap-1.5">
            <Target width={12} height={12} />
            অধ্যায় ID: <span className="font-bold text-white">{chapterId}</span>
          </p>
        </div>

        {/* XP Reward Badge */}
        <div className="mt-4 relative z-10 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/20">
          <Star width={14} height={14} className="text-amber-300 fill-amber-300" />
          <span className="text-sm font-black text-white">+{estimatedXP} XP</span>
          <span className="text-[10px] text-teal-100/80 font-medium">আনুমানিক পুরস্কার</span>
        </div>
      </div>

      {/* ── GAME MODE CARDS ── */}
      <div>
        <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Zap width={12} height={12} className="text-amber-500" />
          গেম মোড বেছে নাও
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {gameModes.map((mode) => {
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                className={`relative rounded-2xl p-3 flex flex-col items-center text-center transition-all duration-300 border overflow-hidden ${
                  isActive
                    ? `${mode.bg} ${mode.border} shadow-lg ${mode.glow} scale-[1.03]`
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:-translate-y-0.5 shadow-sm"
                }`}
              >
                {/* Badge */}
                <span className={`absolute top-1.5 right-1.5 text-[7px] font-black px-1.5 py-0.5 rounded-full text-white ${mode.badgeColor}`}>
                  {mode.badge}
                </span>

                {/* Glow on active */}
                {isActive && (
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${mode.gradient} pointer-events-none`} />
                )}

                <span className="text-2xl mb-1 leading-none">{mode.icon}</span>
                <p className={`text-[11px] font-extrabold leading-tight ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                  {mode.name}
                </p>
                <p className={`text-[9px] mt-0.5 font-medium ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                  {mode.questions}Qs · {mode.time}মি
                </p>
                <div className={`mt-1.5 text-[9px] font-black ${isActive ? "text-teal-600" : "text-slate-400"}`}>
                  +{mode.xp} XP
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── QUESTION COUNT PILLS ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-xl bg-indigo-50 flex items-center justify-center">
            <HelpCircle width={14} height={14} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold text-slate-900">প্রশ্ন সংখ্যা</p>
            <p className="text-[10px] text-slate-400 font-medium">বর্তমানে: {questionCount}টি প্রশ্ন</p>
          </div>
          <span className="ml-auto text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            {questionCount}
          </span>
        </div>
        <div className="flex gap-2">
          {questionCounts.map((count) => (
            <button
              key={count}
              onClick={() => {
                setQuestionCount(count);
                setSelectedMode("custom");
              }}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                questionCount === count
                  ? "bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 scale-105"
                  : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/80"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* ── TIME LIMIT PILLS ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock width={14} height={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[12px] font-extrabold text-slate-900">সময়সীমা</p>
            <p className="text-[10px] text-slate-400 font-medium">বর্তমানে: {timeLimit} মিনিট</p>
          </div>
          <span className="ml-auto text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            {timeLimit}মিনিট
          </span>
        </div>
        <div className="flex gap-2">
          {timeLimits.map((time) => (
            <button
              key={time}
              onClick={() => {
                setTimeLimit(time);
                setSelectedMode("custom");
              }}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                timeLimit === time
                  ? "bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105"
                  : "bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200/80"
              }`}
            >
              {time}মি
            </button>
          ))}
        </div>
      </div>

      {/* ── NEGATIVE MARKING TOGGLE ── */}
      <button
        onClick={() => setNegativeMarking(!negativeMarking)}
        className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-300 border shadow-sm ${
          negativeMarking
            ? "bg-rose-50 border-rose-200/80 shadow-rose-100"
            : "bg-white border-slate-200/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
            negativeMarking ? "bg-rose-100" : "bg-slate-100"
          }`}>
            <Shield width={16} height={16} className={negativeMarking ? "text-rose-600" : "text-slate-400"} />
          </div>
          <div className="text-left">
            <p className={`text-[12px] font-extrabold ${negativeMarking ? "text-rose-700" : "text-slate-700"}`}>
              নেগেটিভ মার্কিং
            </p>
            <p className={`text-[10px] font-medium ${negativeMarking ? "text-rose-400" : "text-slate-400"}`}>
              {negativeMarking ? "সক্রিয় · ভুলে -০.২৫ XP কাটবে" : "নিষ্ক্রিয় · ভুলে কোনো শাস্তি নেই"}
            </p>
          </div>
        </div>
        <div className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
          negativeMarking ? "bg-rose-500" : "bg-slate-200"
        }`}>
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            negativeMarking ? "left-5.5" : "left-0.5"
          }`} />
        </div>
      </button>

      {/* ── LIVE SUMMARY CARD ── */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <div
          className="p-4 border border-white/20"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
        >
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            কুইজ সামারি
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle width={13} height={13} className="text-indigo-400" />
                <span className="text-[12px] text-slate-400 font-medium">প্রশ্ন সংখ্যা</span>
              </div>
              <span className="text-[13px] font-black text-white">{questionCount}টি</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock width={13} height={13} className="text-amber-400" />
                <span className="text-[12px] text-slate-400 font-medium">সময়সীমা</span>
              </div>
              <span className="text-[13px] font-black text-white">{timeLimit} মিনিট</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield width={13} height={13} className="text-rose-400" />
                <span className="text-[12px] text-slate-400 font-medium">নেগেটিভ মার্কিং</span>
              </div>
              <span className={`text-[12px] font-black flex items-center gap-1 ${negativeMarking ? "text-rose-400" : "text-emerald-400"}`}>
                {negativeMarking
                  ? <><X width={11} height={11} /> সক্রিয়</>
                  : <><CheckCircle2 width={11} height={11} /> নিষ্ক্রিয়</>
                }
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <div className="flex items-center gap-2">
                <Star width={13} height={13} className="text-amber-400 fill-amber-400" />
                <span className="text-[12px] text-slate-300 font-bold">আনুমানিক XP</span>
              </div>
              <span className="text-base font-black text-amber-400">+{estimatedXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── START BUTTON ── */}
      <button
        onClick={handleStartQuiz}
        disabled={isStarting}
        className={`w-full relative overflow-hidden rounded-2xl py-4 flex items-center justify-center gap-2.5 font-extrabold text-sm text-white transition-all duration-300 shadow-xl active:scale-[0.98] ${
          isStarting
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-teal-500/40 hover:shadow-teal-500/60 hover:shadow-2xl"
        }`}
      >
        {/* Shimmer overlay */}
        {!isStarting && (
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
        )}
        {isStarting ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>লোড হচ্ছে...</span>
          </>
        ) : (
          <>
            <Play width={18} height={18} className="fill-white" />
            <span>🚀 কুইজ শুরু করুন</span>
            <span className="ml-1 text-[11px] font-black text-teal-100 bg-white/15 px-2 py-0.5 rounded-full">
              +{estimatedXP} XP
            </span>
          </>
        )}
      </button>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 justify-center pb-2">
        <AlertCircle width={11} height={11} className="text-slate-300" />
        <p className="text-[10px] text-slate-400 text-center font-medium">
          একবার শুরু করলে কুইজ বন্ধ করা যাবে না
        </p>
      </div>
    </div>
  );
}