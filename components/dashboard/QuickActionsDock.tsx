"use client";

import { useRouter } from "next/navigation";
import { Play, Swords, Trophy, BarChart3, LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ActionItem {
  id: string;
  label: string;
  badge?: string;
  path: string;
  icon: LucideIcon;
  gradient: string;
  shadow: string;
  live?: boolean;
}

const actions: ActionItem[] = [
  {
    id: "quiz",
    label: "কুইজ খেলুন",
    badge: "HOT",
    path: "/quiz/setup",
    icon: Play,
    gradient: "from-teal-500 to-emerald-600",
    shadow: "rgba(13,148,136,0.3)",
  },
  {
    id: "battle",
    label: "১v১ ব্যাটেল",
    badge: "LIVE",
    path: "/community",
    icon: Swords,
    gradient: "from-violet-600 to-indigo-600",
    shadow: "rgba(99,102,241,0.3)",
    live: true,
  },
  {
    id: "rank",
    label: "লিডারবোর্ড",
    badge: "TOP",
    path: "/leaderboard",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-600",
    shadow: "rgba(245,158,11,0.3)",
  },
  {
    id: "progress",
    label: "পারফরম্যান্স",
    badge: "নতুন",
    path: "/progress",
    icon: BarChart3,
    gradient: "from-rose-500 to-pink-600",
    shadow: "rgba(244,63,94,0.3)",
  },
];

export default function QuickActionsDock() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles width={13} height={13} className="text-amber-500 fill-amber-400" />
          <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
            দ্রুত অ্যাকশন
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center pt-2.5 pb-2 px-1 rounded-2xl bg-white border border-slate-200/80 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:shadow-md group overflow-hidden cursor-pointer"
            >
              {/* Top Right Badge */}
              {item.badge && (
                <span
                  className={`absolute top-1 right-1 px-1 py-0.2 text-[6.5px] font-black rounded-full text-white bg-gradient-to-r ${item.gradient} shadow-2xs ${
                    item.live ? "animate-pulse" : ""
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Icon Box */}
              <div
                className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-1 shadow-sm group-hover:scale-105 transition-transform`}
                style={{ boxShadow: `0 4px 12px ${item.shadow}` }}
              >
                <Icon width={18} height={18} className="text-white" />
              </div>

              {/* Label */}
              <span className="text-[9.5px] font-extrabold text-slate-800 text-center leading-tight">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
