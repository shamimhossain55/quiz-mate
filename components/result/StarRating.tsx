"use client";

import { useEffect, useState } from "react";
import { Star, Sparkles } from "lucide-react";

interface StarRatingProps {
  percentage: number;
}

export function getStarCount(percentage: number): number {
  if (percentage >= 80) return 3;
  if (percentage >= 50) return 2;
  if (percentage >= 34) return 1;
  return 0;
}

export default function StarRating({ percentage }: StarRatingProps) {
  const earnedStars = getStarCount(percentage);
  const [visibleStars, setVisibleStars] = useState<number>(0);
  const [showSparkles, setShowSparkles] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (earnedStars >= 1) {
      timers.push(
        setTimeout(() => {
          setVisibleStars(1);
          setShowSparkles((prev) => [true, prev[1], prev[2]]);
          playChime(1);
        }, 400)
      );
    }

    if (earnedStars >= 2) {
      timers.push(
        setTimeout(() => {
          setVisibleStars(2);
          setShowSparkles((prev) => [prev[0], true, prev[2]]);
          playChime(2);
        }, 950)
      );
    }

    if (earnedStars >= 3) {
      timers.push(
        setTimeout(() => {
          setVisibleStars(3);
          setShowSparkles((prev) => [prev[0], prev[1], true]);
          playChime(3);
        }, 1500)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [earnedStars]);

  // Audio effect using Web Audio API for Clash of Clans star pop chime
  function playChime(starIndex: number) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteFreq = freqs[starIndex - 1] || 440;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      if (starIndex === 3) {
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
          gain2.gain.setValueAtTime(0.18, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.6);
        }, 120);
      }
    } catch {
      // Ignore if audio is restricted by browser policy
    }
  }

  const getLabel = () => {
    switch (earnedStars) {
      case 3:
        return {
          title: "৩ স্টার অর্জন!",
          sub: "অসাধারণ! তুমি সম্পূর্ণ পারফেক্ট! 🏆",
          badge: "bg-amber-100/90 text-amber-900 border-amber-300 shadow-amber-200/50",
        };
      case 2:
        return {
          title: "২ স্টার অর্জন!",
          sub: "দারুণ কাজ! আরেকটু চেষ্টা করলে ৩ স্টার হবে! 🔥",
          badge: "bg-amber-50 text-amber-800 border-amber-200 shadow-amber-100",
        };
      case 1:
        return {
          title: "১ স্টার অর্জন!",
          sub: "ভালো চেষ্টা! আরও কিছুটা অনুশীলন প্রয়োজন 💪",
          badge: "bg-teal-50 text-teal-800 border-teal-200 shadow-teal-100",
        };
      default:
        return {
          title: "০ স্টার অর্জন!",
          sub: "হাল ছেড়ো না! অধ্যায়টি রিভিশন দিয়ে আবার চেষ্টা করো 🚀",
          badge: "bg-slate-100 text-slate-700 border-slate-200 shadow-slate-100",
        };
    }
  };

  const status = getLabel();

  // Clash of Clans Star Podium arrangement
  // Middle star (index 1 / Star 2) is larger and raised higher (-translate-y-3)
  const starsConfig = [
    { id: 1, label: "Star 1", size: "w-14 h-14 sm:w-16 sm:h-16", iconSize: 28, position: "translate-y-1 -rotate-6" },
    { id: 2, label: "Star 2", size: "w-16 h-16 sm:w-20 sm:h-20", iconSize: 38, position: "-translate-y-3 rotate-0 z-10" },
    { id: 3, label: "Star 3", size: "w-14 h-14 sm:w-16 sm:h-16", iconSize: 28, position: "translate-y-1 rotate-6" },
  ];

  return (
    <div className="flex flex-col items-center justify-center my-3 space-y-3">
      {/* Clash of Clans Star Display Frame */}
      <div className="relative flex items-center justify-center gap-2 sm:gap-4 px-6 py-5 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 border border-amber-500/30 shadow-xl backdrop-blur-md w-full overflow-hidden">
        {/* Ambient background light when stars earned */}
        {earnedStars > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        )}

        {starsConfig.map((star, index) => {
          const starNumber = index + 1;
          const isEarned = starNumber <= earnedStars;
          const isVisible = starNumber <= visibleStars;

          return (
            <div key={star.id} className={`relative flex flex-col items-center ${star.position}`}>
              {/* Star Frame */}
              <div
                className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 ${star.size} ${
                  isEarned && isVisible
                    ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 shadow-[0_0_25px_rgba(245,158,11,0.7)] border-2 border-amber-200 animate-coc-star-pop"
                    : "bg-slate-800/90 border-2 border-slate-700/80 shadow-inner opacity-40"
                }`}
              >
                {/* Star Icon */}
                <Star
                  width={star.iconSize}
                  height={star.iconSize}
                  className={`transition-all duration-300 ${
                    isEarned && isVisible
                      ? "text-amber-50 fill-amber-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] animate-coc-star-shine"
                      : "text-slate-600 fill-slate-700"
                  }`}
                />

                {/* CoC Shine Overlay */}
                {isEarned && isVisible && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Sparkles Effect on Pop */}
              {isEarned && isVisible && showSparkles[index] && (
                <>
                  <Sparkles
                    width={18}
                    height={18}
                    className="absolute -top-3 -right-2 text-amber-300 animate-pulse pointer-events-none"
                  />
                  <Sparkles
                    width={14}
                    height={14}
                    className="absolute -bottom-2 -left-2 text-amber-200 pointer-events-none"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Star Count Text Banner */}
      <div className="text-center space-y-1">
        <div
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black border ${status.badge} shadow-xs`}
        >
          <span>{status.title}</span>
        </div>
        <p className="text-[11px] text-slate-500 font-bold leading-tight">{status.sub}</p>
      </div>
    </div>
  );
}
