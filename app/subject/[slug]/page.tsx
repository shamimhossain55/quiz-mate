"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import SubjectHeader from "@/components/subject/SubjectHeader";
import ContinueLearningBanner from "@/components/subject/ContinueLearningBanner";
import ChapterGrid from "@/components/subject/ChapterGrid";
import { getUserResults } from "@/lib/firestore/results";

interface SubjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [subjectProgress, setSubjectProgress] = useState(0);
  const [latestChapterTitle, setLatestChapterTitle] = useState(`অধ্যায় ১: ${slug} পরিচিতি`);
  const [latestChapterId, setLatestChapterId] = useState(`class6_${slug}_ch1`);

  useEffect(() => {
    async function loadProgress() {
      if (!session?.user?.email) return;
      try {
        const results = await getUserResults(session.user.email);
        const matched = results.filter(
          (r) => r.chapterId && r.chapterId.toLowerCase().includes(slug.toLowerCase())
        );

        if (matched.length > 0) {
          const avgPct = Math.round(
            matched.reduce(
              (acc, r) =>
                acc +
                (r.percentage !== undefined
                  ? r.percentage
                  : Math.round((r.score / Math.max(1, r.correct + r.wrong)) * 100)),
              0
            ) / matched.length
          );
          setSubjectProgress(avgPct);

          // Get latest attempt
          const latest = matched[0];
          if (latest?.chapterId) {
            const cleanCh = latest.chapterId.replace(/^class\d+_/, "").replace(/_/g, " ");
            setLatestChapterTitle(`অধ্যায়: ${cleanCh}`);
            setLatestChapterId(latest.chapterId);
          }
        }
      } catch (err) {
        console.error("Error fetching subject results:", err);
      }
    }
    loadProgress();
  }, [session, slug]);

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* TOP BAR */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
            >
              <ArrowLeft width={18} height={18} />
            </button>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-2xs">
              <BookOpen width={14} height={14} className="text-teal-600" />
              <span className="text-xs font-black text-slate-900 capitalize">{slug}</span>
            </div>

            <div className="h-10 w-10" />
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-4 no-scrollbar">

          {/* Subject Header Banner */}
          <SubjectHeader subjectName={slug} progress={subjectProgress} />

          {/* Continue Learning Banner */}
          <ContinueLearningBanner
            chapterTitle={latestChapterTitle}
            chapterId={latestChapterId}
            progress={subjectProgress || 10}
          />

          {/* Chapters Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles width={13} height={13} className="text-amber-500" />
                <h2 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest">
                  সকল অধ্যায়সমূহ
                </h2>
              </div>
            </div>

            <ChapterGrid subjectId={`class6_${slug}`} />
          </div>

        </div>

        {/* BOTTOM NAV */}
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}