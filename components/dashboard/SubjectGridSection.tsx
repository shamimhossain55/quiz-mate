"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SubjectItem = {
  id: string;
  name: string;
  slug: string;
  icon?: any;
  color?: string;
  gradient?: string;
  shadowColor?: string;
  progress: number;
  chaptersCount?: number;
  completedChapters?: number;
  tagline?: string;
  imageUrl?: string;
};

interface SubjectGridSectionProps {
  subjectsList: SubjectItem[];
  isLoading?: boolean;
}

export default function SubjectGridSection({ subjectsList = [], isLoading = false }: SubjectGridSectionProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "in_progress" | "completed">("all");

  const filteredSubjects = subjectsList.filter((s) => {
    if (activeFilter === "in_progress") return s.progress > 0 && s.progress < 100;
    if (activeFilter === "completed") return s.progress >= 100;
    return true;
  });

  return (
    <div>
      {/* Header & Filter Tabs */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles width={14} height={14} className="text-amber-500 fill-amber-400" />
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
            পাঠ্যবই ও বিষয়সমূহ
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-full border border-slate-300/40 text-[9.5px] font-extrabold">
          {[
            { id: "all", label: "সব বিষয়" },
            { id: "in_progress", label: "চলতি" },
            { id: "completed", label: "সম্পন্ন" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {isLoading && subjectsList.length === 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] min-h-[145px] bg-slate-200/60 animate-pulse border border-slate-200"
            >
              <div className="flex justify-end">
                <div className="h-3 w-8 bg-slate-300/70 rounded-full" />
              </div>
              <div className="mt-auto space-y-1.5">
                <div className="h-2 w-10 bg-slate-300/70 rounded" />
                <div className="h-3 w-16 bg-slate-300/90 rounded" />
                <div className="h-2 w-full bg-slate-300/50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-2">
          <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <BookOpen width={20} height={20} />
          </div>
          <p className="text-xs font-extrabold text-slate-800">কোনো বিষয় পাওয়া যায়নি</p>
          <p className="text-[9.5px] text-slate-500 max-w-xs">
            {activeFilter === "in_progress"
              ? "বর্তমানে কোনো চলমান বিষয় নেই। কুইজ খেলা শুরু করুন!"
              : activeFilter === "completed"
              ? "এখনো কোনো বিষয় শতভাগ সম্পন্ন হয়নি।"
              : "বিষয় যুক্ত করা হলে এখানে দেখতে পাবেন।"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {filteredSubjects.map((subject) => {
            const totalCh = subject.chaptersCount || 0;
            const completedCh = subject.completedChapters || 0;

            return (
              <motion.div
                key={subject.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/subject/${subject.slug}`)}
                className="relative rounded-2xl p-2 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden group aspect-[3/4] min-h-[145px] border border-white/25 shadow-lg select-none"
                style={{
                  background: subject.gradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
                  boxShadow: `0 10px 22px ${subject.shadowColor || "rgba(13,148,136,0.3)"}`,
                }}
              >
                {/* Subject Cover Image */}
                {subject.imageUrl ? (
                  <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={subject.imageUrl}
                      alt={subject.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                  </div>
                ) : null}

                {/* 3D Real Book Spine Edge */}
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-black/30 to-transparent border-r border-white/20 pointer-events-none z-10" />

                {/* Top Page Stack Paper Lines Effect */}
                <div className="absolute top-0 right-2.5 left-2.5 h-0.5 bg-white/30 rounded-b pointer-events-none z-10" />

                {/* Ambient Floating Glow Orb */}
                <div className="absolute -top-5 -right-5 w-14 h-14 bg-white/15 rounded-full blur-md pointer-events-none group-hover:scale-150 transition-transform duration-500 z-10" />

                {/* Top Row: Progress Badge */}
                <div className="flex items-center justify-end relative z-10">
                  <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.2 rounded-full border border-white/20 text-[8px] font-black text-white shadow-2xs">
                    <Zap width={8} height={8} className="text-amber-300 fill-amber-300" />
                    <span>{subject.progress}%</span>
                  </div>
                </div>

                {/* Middle & Bottom: Subject Info */}
                <div className="relative z-10 mt-auto pt-1 pl-0.5">
                  <span className="text-[7.5px] font-black text-amber-200 uppercase tracking-tight bg-black/30 backdrop-blur-xs px-1 py-0.2 rounded border border-white/15 inline-block mb-0.5">
                    {completedCh}/{totalCh} অধ্যায়
                  </span>

                  <h4 className="text-[11.5px] font-black text-white leading-snug truncate group-hover:text-amber-200 transition-colors">
                    {subject.name}
                  </h4>

                  <p className="text-[8px] font-semibold text-white/80 truncate mt-0.5">
                    {subject.tagline || "পাঠ্যবই ও অনুশীলন"}
                  </p>

                  {/* Progress Bar & Read Action */}
                  <div className="mt-1.5 space-y-0.5">
                    <div className="h-1 w-full rounded-full bg-black/40 overflow-hidden border border-white/15">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-700"
                        style={{ width: `${Math.max(5, subject.progress)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[8px] font-black text-white/90">
                      <span className="group-hover:text-amber-200 transition-colors truncate">পড়া শুরু</span>
                      <div className="h-3.5 w-3.5 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all flex-shrink-0">
                        <ChevronRight width={8} height={8} className="text-white group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
