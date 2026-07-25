"use client";

import { Clock, BookOpen, X, ShieldAlert } from "lucide-react";

interface QuizHeaderProps {
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: string;
  onExit?: () => void;
}

export default function QuizHeader({
  subject,
  currentQuestion,
  totalQuestions,
  timeLeft,
  onExit,
}: QuizHeaderProps) {
  // Check if time is running low (less than 1 min left)
  const isUrgent = timeLeft.startsWith("00:") || (timeLeft.length <= 5 && parseInt(timeLeft) < 1);

  return (
    <div className="flex-shrink-0 px-5 pt-4 pb-2">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Exit button & Subject badge */}
        <div className="flex items-center gap-2">
          {onExit && (
            <button
              onClick={onExit}
              className="h-9 w-9 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all"
              title="কুইজ থেকে বের হয়ে যান"
            >
              <X width={16} height={16} />
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200/80 rounded-xl px-2.5 py-1 shadow-2xs">
            <BookOpen width={12} height={12} className="text-teal-600" />
            <span className="text-[11px] font-extrabold text-teal-700 max-w-[120px] truncate">
              {subject}
            </span>
          </div>
        </div>

        {/* Right: Timer Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all shadow-sm ${
            isUrgent
              ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse shadow-rose-100"
              : "bg-amber-50 border-amber-200/80 text-amber-700"
          }`}
        >
          <Clock
            width={14}
            height={14}
            className={isUrgent ? "text-rose-500 animate-flame-pulse" : "text-amber-500"}
          />
          <span className="text-xs font-black font-mono tracking-tight">{timeLeft}</span>
        </div>
      </div>
    </div>
  );
}