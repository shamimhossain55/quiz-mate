"use client";

import { useRouter } from "next/navigation";
import { Home, Trophy, TrendingUp, Users, Settings, LucideIcon } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
};

const tabs: Tab[] = [
  { id: "home", label: "হোম", icon: Home, path: "/dashboard" },
  { id: "leaderboard", label: "র‍্যাঙ্ক", icon: Trophy, path: "/leaderboard" },
  { id: "progress", label: "উন্নতি", icon: TrendingUp, path: "/progress" },
  { id: "community", label: "সবাই", icon: Users, path: "/community" },
  { id: "settings", label: "সেটিংস", icon: Settings, path: "/settings" },
];

/**
 * BottomNav
 * সব পেজে ব্যবহার হওয়া শেয়ার্ড প্রিমিয়াম গ্লাসমর্ফিক বটম ন্যাভিগেশন।
 */
export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  return (
    <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="mx-auto max-w-sm flex items-center justify-between px-3 py-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-300 flex-1 ${
                isActive
                  ? "bg-teal-50/90 text-teal-700 font-semibold scale-105"
                  : "text-slate-400 hover:text-slate-600 active:scale-95"
              }`}
            >
              <Icon
                width={20}
                height={20}
                className={`transition-all duration-300 ${
                  isActive ? "text-teal-600 stroke-[2.5]" : "stroke-[1.75]"
                }`}
              />
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? "font-bold text-teal-700" : "font-medium text-slate-500"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1.5 w-1.5 rounded-full bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}