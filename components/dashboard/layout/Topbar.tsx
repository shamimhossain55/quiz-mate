"use client";

import {
  Bell,
  Flame,
  Search,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">

      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu (পরে কাজ করবে) */}
          <button className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100 lg:hidden">
            ☰
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              শুভ সকাল 👋
            </h1>

            <p className="text-sm text-slate-500">
              আজও নতুন কিছু শিখি।
            </p>
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 lg:flex">

            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

          </div>

          {/* Streak */}
          <div className="hidden items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2 md:flex">

            <Flame
              size={18}
              className="text-orange-500"
            />

            <span className="font-semibold text-orange-600">
              7 Day
            </span>

          </div>

          {/* Notification */}

          <button className="relative rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Bell
              size={20}
              className="text-slate-700"
            />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>

          </button>

          {/* Profile */}

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white">
              S
            </div>

            <div className="hidden lg:block">

              <h3 className="text-sm font-semibold text-slate-800">
                Shamim
              </h3>

              <p className="text-xs text-slate-500">
                Class 10 Student
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}