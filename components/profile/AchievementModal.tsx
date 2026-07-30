"use client";

import { X, Target, Trophy, Zap, Crown, Flame, Sparkles, UserPlus, Users, Heart, Star, Lock } from "lucide-react";
import { AchievementItem } from "@/types/firestore";

const ICON_MAP: Record<string, any> = {
  Target,
  Trophy,
  Zap,
  Crown,
  Flame,
  Sparkles,
  UserPlus,
  Users,
  Heart,
  Star,
};

interface AchievementModalProps {
  achievement: AchievementItem | null;
  onClose: () => void;
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  const IconComponent = ICON_MAP[achievement.icon] || Trophy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Aura */}
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
            achievement.unlocked ? "bg-amber-400/20" : "bg-slate-300/30"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100/80 active:scale-95 transition-transform"
        >
          <X width={16} height={16} />
        </button>

        {/* Big Icon Badge */}
        <div className="relative mb-4 mt-2">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform ${
              achievement.unlocked
                ? "bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 ring-4 ring-amber-100"
                : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}
          >
            {achievement.unlocked ? (
              <IconComponent width={40} height={40} className="stroke-[2.25]" />
            ) : (
              <Lock width={36} height={36} className="text-slate-400" />
            )}
          </div>
          {achievement.unlocked && (
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 text-white rounded-full ring-2 ring-white text-[10px] font-extrabold shadow-xs">
              ✓
            </span>
          )}
        </div>

        {/* Status Pill */}
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 ${
            achievement.unlocked
              ? "bg-amber-100 text-amber-800 border border-amber-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {achievement.unlocked ? "অর্জিত (Unlocked)" : "লক করা (Locked)"}
        </span>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
          {achievement.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 font-medium mt-1 mb-4 px-2 leading-relaxed">
          {achievement.description}
        </p>

        {/* Unlock Date or Hint */}
        {achievement.unlocked ? (
          <div className="w-full py-2.5 px-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 text-[11px] font-bold text-amber-800">
            🎉 অর্জন করার তারিখ:{" "}
            {achievement.unlockedAt
              ? new Date(achievement.unlockedAt).toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "আজ"}
          </div>
        ) : (
          <div className="w-full py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] font-medium text-slate-500">
            💡 নির্দেশনা: এই অর্জনটি আনলক করতে কুইজ খেলে পয়েন্ট বাড়ান অথবা বন্ধুদের সাথে যুক্ত হন!
          </div>
        )}
      </div>
    </div>
  );
}
