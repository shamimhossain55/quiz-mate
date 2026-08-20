"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, ChevronRight, HelpCircle, Flame, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Quiz } from "@/types/firestore";

interface LiveExamAlertCardProps {
  quiz: Quiz | null;
}

export default function LiveExamAlertCard({ quiz }: LiveExamAlertCardProps) {
  const router = useRouter();
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    if (!quiz || !quiz.endTime) {
      setTimeLeftStr("");
      return;
    }

    function updateTimer() {
      if (!quiz?.endTime) return;
      const endMs = new Date(quiz.endTime).getTime();
      const diffSec = Math.max(0, Math.floor((endMs - Date.now()) / 1000));

      if (diffSec <= 0) {
        setTimeLeftStr("সমাপ্ত");
        return;
      }

      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      setTimeLeftStr(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [quiz]);

  if (!quiz || timeLeftStr === "সমাপ্ত") return null;

  const totalQ = quiz.questions?.length || quiz.totalQuestions || quiz.questionsCount || 10;
  const duration = quiz.duration || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600 text-white p-4 shadow-[0_8px_24px_rgba(225,29,72,0.25)] border border-rose-400/40"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-500/30 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-2.5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">
              🔴 লাইভ এক্সাম চলছে
            </span>
          </div>

          {timeLeftStr && (
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 font-mono text-[11px] font-bold text-amber-300">
              <Clock width={12} height={12} className="text-amber-300" />
              <span>{timeLeftStr} বাকি</span>
            </div>
          )}
        </div>

        {/* Title & Subject */}
        <div>
          <h3 className="text-sm font-extrabold text-white leading-tight drop-shadow-xs">
            {quiz.title || quiz.name}
          </h3>
          <p className="text-[11px] text-rose-100/90 font-medium mt-0.5 flex items-center gap-2">
            <span>📚 {quiz.subjectName || quiz.subject || "সাধারণ"}</span>
            {quiz.chapterName && <span>• 📖 {quiz.chapterName}</span>}
          </p>
        </div>

        {/* Info Tags & Action Button */}
        <div className="flex items-center justify-between pt-1 border-t border-white/15">
          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-100">
            <span className="bg-white/15 px-2 py-0.5 rounded-md">
              📝 {totalQ}টি প্রশ্ন
            </span>
            <span className="bg-white/15 px-2 py-0.5 rounded-md">
              ⏱️ {duration} মিনিট
            </span>
            {quiz.negativeMarking && (
              <span className="bg-rose-900/50 text-amber-200 px-1.5 py-0.5 rounded-md text-[9px]">
                ⚠️ নেগেটিভ মার্কিং
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/quiz/play?quizId=${quiz.id}&mode=live`)}
            className="flex items-center gap-1 bg-white text-rose-700 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md hover:bg-rose-50 transition-all cursor-pointer group"
          >
            <span>অংশ নিন</span>
            <ChevronRight width={14} height={14} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
