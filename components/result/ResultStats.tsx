"use client";

import { CheckCircle2, XCircle, Trophy, BookOpen } from "lucide-react";

interface ResultStatsProps {
  score: number;
  correct: number;
  wrong: number;
  total: number;
}

export default function ResultStats({
  score,
  correct,
  wrong,
  total,
}: ResultStatsProps) {
  const stats = [
    {
      label: "সঠিক উত্তর",
      value: `${correct}টি`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200/80",
    },
    {
      label: "ভুল উত্তর",
      value: `${wrong}টি`,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200/80",
    },
    {
      label: "অর্জিত নম্বর",
      value: `${score} / ${total}`,
      icon: Trophy,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200/80",
    },
    {
      label: "মোট প্রশ্ন",
      value: `${total}টি`,
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`rounded-2xl p-3 border ${item.bg} ${item.border} flex items-center gap-2.5 shadow-2xs`}
          >
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Icon width={18} height={18} className={item.color} />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-black text-slate-900 leading-tight">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}