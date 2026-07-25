"use client";

import { Sparkles, BookOpen, HelpCircle, Layers } from "lucide-react";

interface SubjectHeaderProps {
  subjectName: string;
  totalChapters?: number;
  totalQuestions?: number;
  progress?: number;
}

export default function SubjectHeader({
  subjectName,
  totalChapters = 12,
  totalQuestions = 150,
  progress = 65,
}: SubjectHeaderProps) {
  // Format slug to user-friendly title
  const formattedTitle = subjectName === "bangla" ? "বাংলা"
    : subjectName === "english" ? "English"
    : subjectName === "math" ? "গণিত"
    : subjectName === "science" ? "বিজ্ঞান"
    : subjectName === "ict" ? "আইসিটি"
    : subjectName === "social-science" ? "সমাজবিজ্ঞান"
    : subjectName;

  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden shadow-[0_16px_40px_-8px_rgba(13,148,136,0.35)] border border-white/20"
      style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4F46E5 100%)" }}
    >
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles width={13} height={13} className="text-amber-300" />
          <span className="text-[10px] font-extrabold text-teal-100/90 uppercase tracking-widest">
            পাঠ্যবই কোর্স
          </span>
        </div>

        <h1 className="text-2xl font-black text-white leading-tight capitalize mb-3">
          {formattedTitle}
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
          <div className="text-center">
            <p className="text-[9px] font-extrabold text-teal-100/80 uppercase">অধ্যায়</p>
            <p className="text-sm font-black text-white">{totalChapters}টি</p>
          </div>
          <div className="text-center border-x border-white/15">
            <p className="text-[9px] font-extrabold text-teal-100/80 uppercase">প্রশ্ন</p>
            <p className="text-sm font-black text-white">{totalQuestions}টি</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-extrabold text-teal-100/80 uppercase">অগ্রগতি</p>
            <p className="text-sm font-black text-amber-300">{progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}