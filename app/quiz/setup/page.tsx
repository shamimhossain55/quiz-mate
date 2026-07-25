"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, BookOpen } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import QuizSetupCard from "@/components/quiz/QuizSetupCard";

interface QuizSetupPageProps {
  searchParams: Promise<{
    chapter?: string;
  }>;
}

export default function QuizSetupPage({ searchParams }: QuizSetupPageProps) {
  const { chapter } = use(searchParams);
  const router = useRouter();

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">

      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ── TOP BAR ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
            >
              <ArrowLeft width={18} height={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Zap width={15} height={15} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-none">কুইজ সেটআপ</p>
                <p className="text-[9px] font-bold text-teal-600 leading-none mt-0.5">QuizMate</p>
              </div>
            </div>

            {/* Chapter Context Badge */}
            {chapter ? (
              <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <BookOpen width={12} height={12} className="text-teal-600" />
                <span className="text-[10px] font-extrabold text-teal-700 max-w-[80px] truncate">
                  {chapter}
                </span>
              </div>
            ) : (
              <div className="h-10 w-10" />
            )}
          </div>
        </div>

        {/* ── CONTENT or NO-CHAPTER STATE ── */}
        {!chapter ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6 gap-4">
            {/* No Chapter Selected — friendly state */}
            <div
              className="w-full rounded-3xl p-6 relative overflow-hidden border border-white/20 shadow-xl text-center"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #4F46E5 100%)" }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="text-5xl mb-3">📚</div>
              <h2 className="text-xl font-black text-white mb-2">প্রথমে অধ্যায় বেছে নাও!</h2>
              <p className="text-[12px] text-teal-100/80 font-medium mb-5">
                একটি বিষয় ও অধ্যায় সিলেক্ট করে তারপর কুইজ সেটআপ করো
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-2xl py-3.5 bg-white font-extrabold text-teal-700 text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <BookOpen width={16} height={16} />
                বিষয় বেছে নিতে যাও
              </button>
            </div>
          </div>
        ) : (
          <QuizSetupCard chapterId={chapter} />
        )}

        {/* ── BOTTOM NAV ── */}
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}