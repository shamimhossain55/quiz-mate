"use client";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answers?: Record<string, number>;
  questions?: any[];
  onSelectQuestion?: (index: number) => void;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const percentage = totalQuestions > 0 ? Math.round((currentQuestion / totalQuestions) * 100) : 0;

  return (
    <div className="px-5 py-2">
      <div className="flex items-center justify-between text-[11px] font-extrabold mb-1.5">
        <span className="text-slate-600 uppercase tracking-wider">
          প্রশ্ন <span className="text-teal-700 font-black">{currentQuestion}</span> / {totalQuestions}
        </span>
        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 font-black">
          {percentage}% সম্পন্ন
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden p-0.5 border border-slate-300/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-600 shadow-[0_0_10px_rgba(13,148,136,0.6)] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}