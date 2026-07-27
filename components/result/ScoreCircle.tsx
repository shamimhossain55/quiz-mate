"use client";

import { Trophy, Star } from "lucide-react";
import { getStarCount } from "@/components/result/StarRating";

interface ScoreCircleProps {
  percentage: number;
}

export default function ScoreCircle({ percentage }: ScoreCircleProps) {
  const strokeDashoffset = 376 - (376 * percentage) / 100;
  const earnedStars = getStarCount(percentage);

  return (
    <div className="flex flex-col items-center justify-center my-2">
      <div className="relative flex items-center justify-center h-44 w-44">
        {/* SVG Circular Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r="60"
            className="stroke-slate-200/80"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="65"
            cy="65"
            r="60"
            className="stroke-teal-500 transition-all duration-1000 ease-out"
            strokeWidth="10"
            strokeDasharray="376"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-950 flex flex-col items-center justify-center border border-white/20 shadow-xl text-white">
          <span className="text-3xl font-black tracking-tight leading-none text-teal-300">
            {percentage}%
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-100/70 mt-1">
            সঠিক স্কোর
          </span>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                width={10}
                height={10}
                className={
                  starNum <= earnedStars
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-600 fill-slate-700 opacity-60"
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}