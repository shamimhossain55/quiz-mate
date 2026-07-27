"use client";

import { Trophy, Zap } from "lucide-react";

interface PerformanceBadgeProps {
  percentage: number;
}

export default function PerformanceBadge({ percentage }: PerformanceBadgeProps) {
  const earnedXP = Math.round((percentage / 100) * 200) + 50;

  return (
    <div
      className="rounded-2xl p-3.5 flex items-center justify-between border border-white/20 shadow-md relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4F46E5 100%)" }}
    >
      <div className="flex items-center gap-2.5 relative z-10">
        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300">
          <Trophy width={20} height={20} className="fill-amber-300" />
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-teal-100 uppercase tracking-widest leading-none">
            অর্জিত পুরস্কার
          </p>
          <p className="text-sm font-black text-white leading-tight mt-0.5">
            +{earnedXP} XP অর্জিত হয়েছে!
          </p>
        </div>
      </div>

      <span className="relative z-10 text-[10px] font-black text-amber-300 bg-amber-400/20 border border-amber-300/40 px-2.5 py-1 rounded-full flex items-center gap-1">
        <Zap width={11} height={11} className="fill-amber-300" /> Level Up
      </span>
    </div>
  );
}