"use client";

import {
  Bell,
  Flame,
  Search,
} from "lucide-react";

import Logo from "@/components/ui/Logo";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">

      <div className="flex h-14 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-3">

          {/* Logo — only visible on mobile (sidebar hidden) */}
          <div className="lg:hidden">
            <Logo />
          </div>

          {/* Greeting — only on desktop (more space) */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-900">
              শুভ সকাল 👋
            </h1>

            <p className="text-sm text-slate-500">
              আজও নতুন কিছু শিখি।
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Search — desktop only */}
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 lg:flex">

            <Search width={18} height={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

          </div>

          {/* Streak */}
          <div className="hidden items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 sm:flex">

            <Flame
              width={16} height={16}
              className="text-orange-500"
            />

            <span className="text-sm font-semibold text-orange-600">
              7 Day
            </span>

          </div>

          {/* Notification */}
          <button className="relative rounded-xl border border-slate-200 p-2 sm:p-3 transition hover:bg-slate-100">

            <Bell
              width={18} height={18}
              className="text-slate-700"
            />

            <span className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 h-2 w-2 rounded-full bg-red-500"></span>

          </button>

          {/* Profile avatar */}
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white text-sm sm:text-base">
            S
          </div>

        </div>

      </div>

    </header>
  );
}