import { use } from "react";
import BottomNav from "@/components/layout/BottomNav";
import ResultHero from "@/components/result/ResultHero";
import StarRating from "@/components/result/StarRating";
import ScoreCircle from "@/components/result/ScoreCircle";
import ResultStats from "@/components/result/ResultStats";
import PerformanceBadge from "@/components/result/PerformanceBadge";
import ResultActions from "@/components/result/ResultActions";

interface ResultPageProps {
  searchParams: Promise<{
    score?: string;
    correct?: string;
    wrong?: string;
    total?: string;
  }>;
}

export default function ResultPage({ searchParams }: ResultPageProps) {
  const params = use(searchParams);

  const score = Number(params.score ?? 0);
  const correct = Number(params.correct ?? 0);
  const wrong = Number(params.wrong ?? 0);
  const total = Number(params.total ?? 0);

  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-6 space-y-4 no-scrollbar">

          {/* Result Hero Header */}
          <ResultHero percentage={percentage} />

          {/* Clash of Clans Style Animated Star Rating */}
          <StarRating percentage={percentage} />

          {/* Circular Score Gauge */}
          <ScoreCircle percentage={percentage} />

          {/* Performance XP Badge */}
          <PerformanceBadge percentage={percentage} />

          {/* 4-Grid Stats */}
          <ResultStats score={score} correct={correct} wrong={wrong} total={total} />

          {/* Action Buttons */}
          <ResultActions />

        </div>

        {/* BOTTOM NAV */}
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}