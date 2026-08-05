"use client";

import { useRouter } from "next/navigation";
import { Play, BookOpen, User, HelpCircle, ChevronRight } from "lucide-react";
import { Chapter } from "@/types/firestore";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/quiz/setup?chapter=${chapter.id}&subject=${chapter.subjectId || ""}`)}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all duration-200 cursor-pointer group active:scale-[0.99] flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Chapter Order Badge */}
        <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-700 font-black text-xs flex items-center justify-center border border-teal-100/80 flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all">
          {chapter.order || 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-extrabold text-teal-600 uppercase tracking-wide">
              অধ্যায় {chapter.order || 1}
            </span>
            {chapter.sectionName && (
              <span className="text-[9px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200/80 px-1.5 py-0.5 rounded-md">
                {chapter.sectionName}
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug truncate group-hover:text-teal-700 transition-colors">
            {chapter.name}
          </h3>
          {chapter.author && (
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <User width={10} height={10} />
              {chapter.author}
            </p>
          )}
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        className="h-9 px-3 rounded-xl bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-emerald-600 text-slate-600 group-hover:text-white font-extrabold text-[11px] flex items-center gap-1 flex-shrink-0 transition-all shadow-2xs"
      >
        <Play width={12} height={12} className="fill-current" />
        <span>শুরু করো</span>
      </button>
    </div>
  );
}