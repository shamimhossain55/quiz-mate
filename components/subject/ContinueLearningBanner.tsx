"use client";

import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Play } from "lucide-react";

interface ContinueLearningBannerProps {
  chapterTitle?: string;
  progress?: number;
  estimatedTime?: string;
  chapterId?: string;
}

export default function ContinueLearningBanner({
  chapterTitle = "অধ্যায় ১: মৌলিক ধারণা",
  progress = 45,
  estimatedTime = "১৫ মি",
  chapterId = "ch1",
}: ContinueLearningBannerProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/quiz/setup?chapter=${chapterId}`)}
      className="rounded-2xl p-3.5 flex items-center gap-3 bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
    >
      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Play width={18} height={18} className="text-white fill-white ml-0.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[8px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100 uppercase tracking-wide">
            পড়া চালিয়ে যান
          </span>
        </div>
        <p className="text-xs font-black text-slate-900 leading-tight truncate">
          {chapterTitle}
        </p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xs transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ChevronRight
        width={18}
        height={18}
        className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
      />
    </div>
  );
}