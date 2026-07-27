"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, BookOpen, Home } from "lucide-react";

export default function ResultActions() {
  const router = useRouter();

  return (
    <div className="space-y-2 pt-1">
      {/* Primary Retry Button */}
      <button
        onClick={() => router.back()}
        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-extrabold text-xs text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-md shadow-teal-500/30 active:scale-95 transition-all"
      >
        <RotateCcw width={16} height={16} />
        <span>আবার চেষ্টা করুন (Retry)</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {/* Review Answers */}
        <button
          onClick={() => router.push("/quiz/review")}
          className="rounded-2xl py-3 px-3 flex items-center justify-center gap-1.5 font-extrabold text-xs text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all"
        >
          <BookOpen width={14} height={14} className="text-indigo-600" />
          <span>উত্তর রিভিউ</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-2xl py-3 px-3 flex items-center justify-center gap-1.5 font-extrabold text-xs text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs active:scale-95 transition-all"
        >
          <Home width={14} height={14} className="text-teal-600" />
          <span>ড্যাশবোর্ড</span>
        </button>
      </div>
    </div>
  );
}