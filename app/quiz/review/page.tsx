"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Sparkles,
  BookOpenCheck,
  Trophy,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useQuiz } from "@/context/QuizContext";
import { useQuizConfig } from "@/context/QuizConfigContext";
import BottomNav from "@/components/layout/BottomNav";

type FilterType = "all" | "correct" | "wrong" | "unanswered";

export default function ReviewPage() {
  const router = useRouter();
  const { answers, playedQuestions, resetQuiz } = useQuiz();
  const { config } = useQuizConfig();
  const [filter, setFilter] = useState<FilterType>("all");

  // Play page-এ context-এ save করা questions
  // config.questionCount অনুযায়ী slice করো
  const displayedQuestions = playedQuestions.slice(
    0,
    config.questionCount || playedQuestions.length
  );

  // কোনো প্রশ্ন না থাকলে dashboard-এ redirect
  if (displayedQuestions.length === 0) {
    return (
      <div className="h-screen font-sans flex flex-col items-center justify-center bg-slate-50 gap-4 px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-1">
          <BookOpenCheck width={28} height={28} className="text-teal-600" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">
          কোনো প্রশ্ন পাওয়া যায়নি
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          প্রথমে একটি কুইজ সম্পন্ন করো, তারপর রিভিউ দেখতে পাবে।
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 rounded-2xl py-3 px-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-extrabold text-xs shadow-md active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Home width={16} height={16} />
          ড্যাশবোর্ডে যাও
        </button>
      </div>
    );
  }

  // ── STATISTICS ──
  // NOTE: Number() দিয়ে cast করছি কারণ Firestore থেকে আসা correctAnswer
  // কখনো string হতে পারে, আর answers[] সবসময় number — এতে === comparison সঠিক হবে
  const totalQuestions = displayedQuestions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  displayedQuestions.forEach((q) => {
    const userAnswer = answers[q.id];
    const correctAnswer = Number(q.correctAnswer);
    if (userAnswer === undefined || userAnswer === null) {
      unansweredCount++;
    } else if (userAnswer === correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const accuracyPercentage =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

  // ── FILTERED QUESTIONS ──
  const filteredQuestions = displayedQuestions.filter((q) => {
    const userAnswer = answers[q.id];
    const correctAnswer = Number(q.correctAnswer);
    if (filter === "correct") return userAnswer === correctAnswer;
    if (filter === "wrong")
      return userAnswer !== undefined && userAnswer !== correctAnswer;
    if (filter === "unanswered")
      return userAnswer === undefined || userAnswer === null;
    return true;
  });

  const optionLabels = ["ক", "খ", "গ", "ঘ", "ঙ"];

  function handleRetake() {
    resetQuiz();
    router.push("/quiz/setup");
  }

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float"
        style={{ animationDelay: "-2s" }}
      />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ── TOP BAR ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-3 relative z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
              aria-label="পিছনে যান"
            >
              <ArrowLeft width={18} height={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-md">
                <BookOpenCheck width={18} height={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  উত্তর পর্যালোচনা
                </h1>
                <p className="text-[10px] text-teal-700 font-bold leading-none mt-0.5">
                  {config.chapterId || "QuizMate"} · Review
                </p>
              </div>
            </div>

            <button
              onClick={handleRetake}
              className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200/80 shadow-2xs flex items-center justify-center text-teal-700 hover:bg-teal-100 active:scale-95 transition-all"
              aria-label="পুনরায় কুইজ দিন"
            >
              <RotateCcw width={16} height={16} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-6 space-y-4 no-scrollbar">

          {/* ── HERO SUMMARY CARD ── */}
          <div
            className="rounded-3xl p-4 relative overflow-hidden shadow-[0_16px_36px_-8px_rgba(13,148,136,0.35)] border border-white/30"
            style={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4F46E5 100%)",
            }}
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy width={15} height={15} className="text-amber-300 fill-amber-300" />
                  <span className="text-[10px] font-extrabold text-teal-100 uppercase tracking-wider">
                    ফলাফল সারসংক্ষেপ
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white leading-none">
                    {accuracyPercentage}%
                  </span>
                  <span className="text-xs font-bold text-teal-100">সঠিকতার হার</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                <Sparkles width={14} height={14} className="text-amber-300" />
                <span className="text-xs font-extrabold text-white">
                  {correctCount}/{totalQuestions} সঠিক
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 bg-black/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 mb-3">
              <div className="flex items-center justify-between text-[10px] text-teal-100 font-bold mb-1.5">
                <span>সঠিকতার অগ্রগতি</span>
                <span className="text-white font-black">{correctCount}টি সঠিক</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-teal-950/50 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{ width: `${accuracyPercentage}%` }}
                />
              </div>
            </div>

            {/* Motivational message */}
            <p className="relative z-10 text-[11px] text-teal-50 font-medium flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 border border-white/10">
              <Zap width={12} height={12} className="text-amber-300 flex-shrink-0" />
              <span>
                {accuracyPercentage >= 80
                  ? "অসাধারণ পারফরম্যান্স! তোমার ধারণাগুলো বেশ স্পষ্ট।"
                  : accuracyPercentage >= 50
                  ? "ভালো করেছ! ভুল উত্তরগুলো দেখে সংশোধন করে নাও।"
                  : "মন খারাপ করো না! প্রতিটি ভুল নতুন কিছু শেখার সুযোগ।"}
              </span>
            </p>
          </div>

          {/* ── STATS CHIPS ── */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white border border-slate-200/80 p-2.5 flex flex-col items-center shadow-2xs">
              <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                <BookOpenCheck width={13} height={13} />
                <span className="text-[9px] font-bold">মোট</span>
              </div>
              <span className="text-base font-black text-slate-900 leading-none">{totalQuestions}</span>
            </div>

            <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-2.5 flex flex-col items-center shadow-2xs">
              <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                <CheckCircle2 width={13} height={13} />
                <span className="text-[9px] font-bold">সঠিক</span>
              </div>
              <span className="text-base font-black text-emerald-700 leading-none">{correctCount}</span>
            </div>

            <div className="rounded-2xl bg-rose-50/80 border border-rose-200/80 p-2.5 flex flex-col items-center shadow-2xs">
              <div className="flex items-center gap-1 text-rose-600 mb-0.5">
                <XCircle width={13} height={13} />
                <span className="text-[9px] font-bold">ভুল</span>
              </div>
              <span className="text-base font-black text-rose-700 leading-none">{wrongCount}</span>
            </div>
          </div>

          {/* ── FILTER TABS ── */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 border border-slate-200/80">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 flex items-center justify-center gap-1 ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              সব ({totalQuestions})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 flex items-center justify-center gap-1 ${
                filter === "correct"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Check width={12} height={12} />
              সঠিক ({correctCount})
            </button>
            <button
              onClick={() => setFilter("wrong")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 flex items-center justify-center gap-1 ${
                filter === "wrong"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <XCircle width={12} height={12} />
              ভুল ({wrongCount})
            </button>
            {unansweredCount > 0 && (
              <button
                onClick={() => setFilter("unanswered")}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 ${
                  filter === "unanswered"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                বাকি ({unansweredCount})
              </button>
            )}
          </div>

          {/* ── QUESTION LIST ── */}
          {filteredQuestions.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-8 text-center shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles width={24} height={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                কোন প্রশ্ন পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                এই ফিল্টারে কোন প্রশ্নের ফলাফল নেই।
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const originalIndex = displayedQuestions.findIndex(
                (q) => q.id === question.id
              );
              const userAnswer = answers[question.id];
              // Number() cast করো — Firestore string হিসেবে দিলেও সঠিক compare হবে
              const correctAnswer = Number(question.correctAnswer);
              const isCorrect =
                userAnswer !== undefined && userAnswer === correctAnswer;
              const isUnanswered = userAnswer === undefined || userAnswer === null;

              return (
                <div
                  key={question.id}
                  className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      প্রশ্ন {originalIndex + 1}
                    </span>

                    {isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        <AlertCircle width={11} height={11} />
                        উত্তর দেওয়া হয়নি
                      </span>
                    ) : isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 width={12} height={12} className="text-emerald-600" />
                        সঠিক (+10 XP)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle width={12} height={12} className="text-rose-600" />
                        ভুল উত্তর
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug mb-4">
                    {question.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2">
                    {question.options.map((optionText, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isOptionCorrect = correctAnswer === optIdx;

                      let containerCls =
                        "bg-slate-50/70 border-slate-200/80 text-slate-700";
                      let badgeCls =
                        "bg-slate-200 text-slate-600 border-slate-300";

                      if (isOptionCorrect) {
                        containerCls =
                          "bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs";
                        badgeCls = "bg-emerald-600 text-white border-emerald-600";
                      } else if (isSelected && !isOptionCorrect) {
                        containerCls =
                          "bg-rose-50/90 border-rose-300 text-rose-950 font-bold shadow-2xs";
                        badgeCls = "bg-rose-600 text-white border-rose-600";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`rounded-2xl p-3 border flex items-center justify-between gap-3 text-xs transition-all duration-150 ${containerCls}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`h-6 w-6 rounded-xl flex items-center justify-center text-[10px] font-black border flex-shrink-0 ${badgeCls}`}
                            >
                              {optionLabels[optIdx] ?? optIdx + 1}
                            </span>
                            <span className="leading-tight">{optionText}</span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isOptionCorrect && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 width={10} height={10} />
                                সঠিক উত্তর
                              </span>
                            )}
                            {isSelected && !isOptionCorrect && (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                                <XCircle width={10} height={10} />
                                তোমার উত্তর
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/60 px-3 py-2.5">
                      <p className="text-[10px] font-extrabold text-indigo-700 mb-0.5 flex items-center gap-1">
                        <Sparkles width={11} height={11} />
                        ব্যাখ্যা
                      </p>
                      <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* ── ACTION BUTTONS ── */}
          <div className="pt-2 pb-2 space-y-2">
            <button
              onClick={handleRetake}
              className="w-full rounded-2xl py-3 px-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-extrabold text-xs shadow-md active:scale-[0.98] hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw width={16} height={16} />
              আবার পরীক্ষা দাও
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-2xl py-3 px-4 bg-white border border-slate-200/80 text-slate-700 font-extrabold text-xs shadow-2xs active:scale-[0.98] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Home width={16} height={16} />
              ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>

        </div>

        {/* ── BOTTOM NAV ── */}
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}