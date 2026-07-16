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
 * সব পেজে ব্যবহার হওয়া শেয়ার্ড বটম ন্যাভিগেশন।
 * activeTab prop দিয়ে বলে দিতে হবে কোন ট্যাবটা এখন সিলেক্টেড (highlight) দেখাবে।
 */
export default function BottomNav({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-sm flex items-center justify-between px-6 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <Icon size={20} className={isActive ? "text-teal-700" : "text-slate-400"} />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-teal-700" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
              {isActive && <span className="h-1 w-1 rounded-full bg-teal-700 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}