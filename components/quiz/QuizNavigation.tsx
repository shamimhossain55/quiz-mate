"use client";

import { ArrowLeft, ArrowRight, Flag, Sparkles } from "lucide-react";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious?: () => void;
  onPrev?: () => void;
  onNext: () => void;
  onFinish: () => void;
  hasSelectedAnswer?: boolean;
}

export default function QuizNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onPrev,
  onNext,
  onFinish,
}: QuizNavigationProps) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;
  const handlePrevious = onPrev || onPrevious || (() => {});

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={isFirstQuestion}
        className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl font-extrabold text-xs transition-all duration-200 border shadow-2xs ${
          isFirstQuestion
            ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-60"
            : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 active:scale-95"
        }`}
      >
        <ArrowLeft width={15} height={15} />
        <span>আগেরটি</span>
      </button>

      {/* Next or Finish Button */}
      {isLastQuestion ? (
        <button
          onClick={onFinish}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-500/30 active:scale-95 transition-all"
        >
          <Flag width={15} height={15} fill="white" />
          <span>কুইজ সম্পন্ন করুন</span>
          <Sparkles width={13} height={13} className="text-amber-300" />
        </button>
      ) : (
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-md shadow-teal-500/30 active:scale-95 transition-all"
        >
          <span>পরবর্তী প্রশ্ন</span>
          <ArrowRight width={15} height={15} />
        </button>
      )}
    </div>
  );
}