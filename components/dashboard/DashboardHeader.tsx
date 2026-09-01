"use client";

import { useRouter } from "next/navigation";
import { Flame, GraduationCap, Zap, Trophy, MessageCircle, ShieldCheck } from "lucide-react";
import { Student } from "@/types/firestore";
import { useFriendNotif } from "@/context/FriendNotifContext";

const CLASS_NAMES: Record<string, string> = {
  class6: "ষষ্ঠ শ্রেণী",
  class7: "সপ্তম শ্রেণী",
  class8: "অষ্টম শ্রেণী",
  class9: "নবম শ্রেণী",
  class10: "দশম শ্রেণী",
  class11: "একাদশ শ্রেণী",
  class12: "দ্বাদশ শ্রেণী",
};

const GROUP_NAMES: Record<string, string> = {
  all: "সাধারণ",
  general: "সাধারণ",
  science: "বিজ্ঞান",
  commerce: "ব্যবসায় শিক্ষা",
  arts: "মানবিক",
};

interface DashboardHeaderProps {
  student: Student | null;
  sessionUser: { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;
  userAvatar: string | null;
  greeting: string;
  greetingEmoji: string;
}

export default function DashboardHeader({
  student,
  sessionUser,
  userAvatar,
  greeting,
  greetingEmoji,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { unreadMsgCount } = useFriendNotif();
  const currentPoints = student?.point || 0;
  const currentLevel = student?.level || 1;
  const currentLevelXP = currentPoints % 100;
  const xpPercentage = Math.min(100, Math.round((currentLevelXP / 100) * 100));

  const classNameText = CLASS_NAMES[student?.classId || "class6"] || student?.classId || "ষষ্ঠ শ্রেণী";
  const groupText = student?.group && student.group !== "all" ? ` (${GROUP_NAMES[student.group] || student.group})` : "";

  const isAdmin = sessionUser?.role === "admin";

  return (
    <div className="flex-shrink-0 px-4 pt-3.5 pb-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs z-30 sticky top-0">
      {/* Top Row: User Avatar, Name, Level & Streak Pill */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with level gradient ring */}
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-full p-[2.5px] bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-600 shadow-md animate-gradient-x">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center border border-white/20 overflow-hidden">
                {userAvatar || student?.avatarUrl || sessionUser?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatar || student?.avatarUrl || sessionUser?.image || ""}
                    alt={student?.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-teal-300 font-black text-lg">
                    {(student?.name || sessionUser?.name || "S").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-white shadow-xs">
              ✓
            </span>
          </div>

          {/* User Name & Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80 shadow-2xs flex items-center gap-1">
                <Trophy width={10} height={10} className="text-teal-600" />
                Lvl {currentLevel}
              </span>
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80 flex items-center gap-1 shadow-2xs truncate max-w-[150px]">
                <GraduationCap width={11} height={11} className="text-indigo-600 flex-shrink-0" />
                <span className="truncate">{classNameText}{groupText}</span>
              </span>
            </div>

            <p className="text-slate-900 text-sm sm:text-base font-extrabold leading-snug tracking-tight mt-0.5 truncate">
              {greeting}, {student?.name || sessionUser?.name || "শিক্ষার্থী"} {greetingEmoji}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Conditional Admin Panel Button */}
          {isAdmin && (
            <button
              onClick={() => router.push("/admin")}
              aria-label="Admin Panel"
              title="অ্যাডমিন প্যানেলে যান"
              className="h-10 px-3 flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
            >
              <ShieldCheck width={18} height={18} className="text-white flex-shrink-0" />
              <span className="text-xs tracking-tight">Admin</span>
            </button>
          )}

          {/* Message Icon Button with Notification Badge */}
          <button
            onClick={() => router.push("/community")}
            aria-label="মেসেজসমূহ"
            className="relative h-10 w-10 flex items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 active:scale-95 transition-all hover:bg-teal-100/80 shadow-2xs cursor-pointer group"
          >
            <MessageCircle width={19} height={19} className="group-hover:scale-110 transition-transform text-teal-700" />
            {unreadMsgCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9.5px] font-black flex items-center justify-center px-1 border-2 border-white shadow-sm animate-pulse">
                {unreadMsgCount > 9 ? "9+" : unreadMsgCount}
              </span>
            )}
          </button>

          {/* Dynamic Streak Badge */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/80 px-2.5 py-1.5 shadow-[0_4px_12px_rgba(249,115,22,0.15)] flex-shrink-0">
            <div className="relative flex items-center justify-center">
              <Flame width={18} height={18} className="text-orange-500 fill-orange-500 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-orange-700 leading-none">{student?.streak || 0}</span>
                <span className="text-[9px] font-extrabold text-orange-500">দিন</span>
              </div>
              <p className="text-[7.5px] font-extrabold text-orange-600/90 leading-none mt-0.5">স্ট্রিক 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Level & XP Progress Bar */}
      <div className="mt-2.5 bg-slate-100/90 rounded-full px-2.5 py-1 flex items-center justify-between gap-2 border border-slate-200/70">
        <div className="flex items-center gap-1 flex-shrink-0 text-[9.5px] font-extrabold text-slate-700">
          <Zap width={11} height={11} className="text-amber-500 fill-amber-400" />
          <span>{currentPoints} XP</span>
        </div>

        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40 relative">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.max(8, xpPercentage)}%` }}
          />
        </div>

        <span className="text-[9px] font-black text-indigo-600 flex-shrink-0">
          {xpPercentage}% (Lvl {currentLevel + 1})
        </span>
      </div>
    </div>
  );
}
