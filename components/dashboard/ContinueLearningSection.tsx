"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Play, Zap, ChevronRight, Sparkles, CheckCircle } from "lucide-react";

interface ContinueLearningSectionProps {
  subjectsList: Array<{
    id: string;
    name: string;
    slug: string;
    progress: number;
    completedChapters?: number;
    chaptersCount?: number;
    gradient?: string;
    color?: string;
    imageUrl?: string;
  }>;
}

export default function ContinueLearningSection({ subjectsList = [] }: ContinueLearningSectionProps) {
  const router = useRouter();

  // Find active subject in progress (<100% and >0%) or default to first subject
  const activeSubject =
    subjectsList.find((s) => s.progress > 0 && s.progress < 100) ||
    subjectsList[0] || {
      id: "math",
      name: "সাধারণ গণিত",
      slug: "general-math",
      progress: 45,
      completedChapters: 3,
      chaptersCount: 8,
      gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
    };

  return (
    <div
      onClick={() => router.push(`/subject/${activeSubject.slug}`)}
      className="relative rounded-3xl p-4 overflow-hidden border border-white/30 shadow-[0_12px_28px_rgba(15,23,42,0.1)] cursor-pointer active:scale-98 hover:-translate-y-0.5 transition-all group"
      style={{
        background: activeSubject.gradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
      }}
    >
      {/* Background Image if available */}
      {activeSubject.imageUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSubject.imageUrl}
            alt={activeSubject.name}
            className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent" />
        </div>
      )}

      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

      <div className="relative z-10">
        {/* Header row badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-[9px] font-black text-white shadow-2xs">
            <Sparkles width={10} height={10} className="text-amber-300 fill-amber-300" />
            <span>চালিয়ে যান (CONTINUE LEARNING)</span>
          </div>

          <span className="text-[9.5px] font-extrabold text-amber-200 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
            {activeSubject.progress}% সম্পন্ন
          </span>
        </div>

        {/* Title and Progress */}
        <div className="mt-1">
          <h3 className="text-lg font-black text-white leading-tight drop-shadow-xs group-hover:text-amber-200 transition-colors">
            {activeSubject.name}
          </h3>
          <p className="text-[10px] text-teal-100/90 font-semibold mt-0.5">
            আপনার পাঠ্যসূচির অগ্রগতি বজায় রাখুন
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-white/15">
            <div
              className="h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(252,211,77,0.8)]"
              style={{ width: `${Math.max(10, activeSubject.progress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] font-extrabold text-white/90 pt-0.5">
            <span className="flex items-center gap-1">
              <Zap width={10} height={10} className="text-amber-300 fill-amber-300" />
              পরবর্তী কুইজ আনলক করুন
            </span>
            <div className="flex items-center gap-1 text-amber-200 group-hover:translate-x-1 transition-transform">
              <span>পড়া শুরু করুন</span>
              <ChevronRight width={12} height={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
