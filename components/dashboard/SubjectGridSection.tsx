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
    <div id="curriculum-section">
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
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {filteredSubjects.map((subject) => {
            const totalCh = subject.chaptersCount || 0;
            const completedCh = subject.completedChapters || 0;
            const isCompleted = subject.progress >= 100;

            return (
              <motion.div
                key={subject.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push(`/subject/${subject.slug}`)}
                className="group cursor-pointer flex flex-col select-none"
              >
                {/* 1. 3D REALISTIC BOOK COVER CONTAINER */}
                <div
                  className="relative aspect-[3/4.2] rounded-xl overflow-hidden shadow-[0_6px_16px_rgba(15,23,42,0.12)] group-hover:shadow-[0_12px_24px_rgba(15,23,42,0.22)] group-hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/80 bg-slate-900 flex flex-col justify-between"
                  style={{
                    boxShadow: subject.shadowColor ? `0 8px 20px ${subject.shadowColor}` : undefined,
                  }}
                >
                  {/* Book Cover Artwork Image */}
                  {subject.imageUrl ? (
                    <div className="absolute inset-0 z-0 bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={subject.imageUrl}
                        alt={subject.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    /* Fallback when no image: Vivid Subject Palette & Icon */
                    <div
                      className="absolute inset-0 z-0 flex flex-col items-center justify-center p-2 text-white"
                      style={{
                        background: subject.gradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
                      }}
                    >
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner group-hover:scale-110 transition-transform">
                        <BookOpen width={20} height={20} className="text-white" />
                      </div>
                      <span className="mt-2 text-[10px] font-black text-center line-clamp-2 px-1 text-white drop-shadow-xs">
                        {subject.name}
                      </span>
                    </div>
                  )}

                  {/* 3D Real Book Spine (Left Fold & Shadow) */}
                  <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-black/25 to-transparent border-r border-white/20 pointer-events-none z-10" />

                  {/* Top & Right Paper Page Stack Line */}
                  <div className="absolute top-0 right-1.5 left-2 h-0.5 bg-white/40 pointer-events-none z-10" />
                  <div className="absolute top-1.5 bottom-1.5 right-0 w-0.5 bg-white/25 pointer-events-none z-10" />

                  {/* Glossy Sheen Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

                  {/* Top Floating Glass Status Badge */}
                  <div className="relative z-20 flex justify-end p-1.5">
                    {isCompleted ? (
                      <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[7.5px] font-black px-1.5 py-0.2 rounded-full shadow-xs border border-white/20">
                        <CheckCircle2 width={8} height={8} />
                        ১০০%
                      </span>
                    ) : subject.progress > 0 ? (
                      <span className="flex items-center gap-0.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/20 shadow-xs">
                        <Zap width={7} height={7} className="fill-amber-300" />
                        {subject.progress}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 bg-black/40 backdrop-blur-xs text-white/90 text-[7.5px] font-bold px-1.5 py-0.2 rounded-full border border-white/15">
                        নতুন
                      </span>
                    )}
                  </div>

                  {/* Bottom Integrated Micro Progress Bar on the Book */}
                  {subject.progress > 0 && (
                    <div className="relative z-20 h-1 w-full bg-black/50 backdrop-blur-xs">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-emerald-400"
                            : "bg-gradient-to-r from-teal-400 via-amber-300 to-yellow-300"
                        }`}
                        style={{ width: `${Math.max(5, subject.progress)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. CLEAN TYPOGRAPHY & COMPREHENSIVE PROGRESS BAR (BELOW THE 3D BOOK) */}
                <div className="mt-2 space-y-1.5 px-0.5">
                  <div className="text-center">
                    <h4 className="text-[11.5px] font-black text-slate-800 leading-tight truncate group-hover:text-teal-600 transition-colors">
                      {subject.name}
                    </h4>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-200/90 rounded-full overflow-hidden p-[1px] border border-slate-300/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : subject.progress > 0
                            ? "bg-gradient-to-r from-teal-500 to-indigo-500 shadow-[0_0_8px_rgba(13,148,136,0.4)]"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${Math.max(subject.progress > 0 ? 8 : 0, subject.progress)}%` }}
                      />
                    </div>

                    {/* Progress Stats details */}
                    <div className="flex items-center justify-between text-[8.5px] font-extrabold text-slate-500 px-0.5">
                      <span>
                        {totalCh > 0 ? `${completedCh}/${totalCh} অধ্যায়` : `${subject.progress}%`}
                      </span>
                      <span
                        className={
                          isCompleted
                            ? "text-emerald-600 font-black"
                            : subject.progress > 0
                            ? "text-teal-600 font-black"
                            : "text-slate-400 font-bold"
                        }
                      >
                        {isCompleted
                          ? "সম্পন্ন ✨"
                          : totalCh > 0 && totalCh - completedCh > 0
                          ? `${totalCh - completedCh}টি বাকি`
                          : subject.progress > 0
                          ? `${subject.progress}%`
                          : "শুরু করুন"}
                      </span>
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
