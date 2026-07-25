"use client";

import { Sparkles, Trophy } from "lucide-react";

interface ResultHeroProps {
  percentage: number;
}

export default function ResultHero({ percentage }: ResultHeroProps) {
  let title = "কুইজ সম্পন্ন হয়েছে!";
  let subtitle = "অভিনন্দন! তুমি চেষ্টা চালিয়ে গেছো 🚀";
  let emoji = "🎉";

  if (percentage >= 90) {
    title = "অসাধারণ ফলাফল!";
    subtitle = "তুমি একদম ফার্স্ট ক্লাস পারফর্ম করেছো! 🏆";
    emoji = "🌟";
  } else if (percentage >= 75) {
    title = "দারুণ পারফরম্যান্স!";
    subtitle = "খুবই চমৎকার উত্তর দিয়েছো! 🔥";
    emoji = "🔥";
  } else if (percentage >= 50) {
    title = "ভালো কাজ করেছো!";
    subtitle = "আরেকটু চেষ্টা করলে আরও ভালো করবে 👏";
    emoji = "👍";
  }

  return (
    <div className="text-center space-y-1">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[11px] font-black mb-1">
        <Sparkles width={12} height={12} className="text-amber-500 fill-amber-500" />
        <span>{emoji} {title}</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
        কুইজ ফলাফল
      </h1>
      <p className="text-[11px] text-slate-500 font-medium">
        {subtitle}
      </p>
    </div>
  );
}