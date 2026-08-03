"use client";

import { useRouter } from "next/navigation";
import { Home, Trophy, TrendingUp, Users, User, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import { useFriendNotif } from "@/context/FriendNotifContext";

type Tab = {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  path: string;
};

const tabs: Tab[] = [
  { id: "home", labelKey: "nav_home", icon: Home, path: "/dashboard" },
  { id: "leaderboard", labelKey: "nav_rank", icon: Trophy, path: "/leaderboard" },
  { id: "progress", labelKey: "nav_progress", icon: TrendingUp, path: "/progress" },
  { id: "community", labelKey: "nav_community", icon: Users, path: "/community" },
  { id: "profile", labelKey: "nav_profile", icon: User, path: "/profile" },
];

/**
 * BottomNav
 * iOS-Quality Floating Pill Shared Glassmorphic Bottom Navigation
 * badgeCounts — optional map of tabId → badge count (overrides context values)
 * Community tab badge is driven automatically from FriendNotifContext.
 */
export default function BottomNav({
  activeTab,
  badgeCounts = {},
}: {
  activeTab: string;
  badgeCounts?: Record<string, number>;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const { pendingCount } = useFriendNotif();

  // Merge context-driven badges with any manual overrides
  const resolvedBadges: Record<string, number> = {
    community: pendingCount,
    ...badgeCounts,
  };

  return (
    <div className="flex-shrink-0 bg-white/85 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] z-50">
      <div className="mx-auto max-w-sm flex items-center justify-between px-3 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badgeCount = resolvedBadges[tab.id] ?? 0;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push(tab.path)}
              className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-[14px] transition-colors flex-1 cursor-pointer select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-0 bg-teal-500/10 border border-teal-500/25 rounded-[14px] shadow-2xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              {/* Icon wrapper — relative so badge can be positioned on it */}
              <div className="relative z-10">
                <Icon
                  width={20}
                  height={20}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-teal-600 stroke-[2.25]" : "text-slate-400 stroke-[1.75]"
                  }`}
                />
                {/* Notification Badge */}
                {badgeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white text-[8px] font-extrabold flex items-center justify-center px-[3px] border border-white shadow-sm"
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </motion.span>
                )}
              </div>

              <span
                className={`relative z-10 text-[10.5px] mt-0.5 tracking-tight transition-colors duration-200 ${
                  isActive ? "font-extrabold text-teal-800" : "font-semibold text-slate-400"
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}