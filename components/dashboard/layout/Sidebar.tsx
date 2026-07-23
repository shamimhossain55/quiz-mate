"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Trophy,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Subjects",
    href: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Friends",
    href: "/friends",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}
      <div className="border-b border-slate-200 p-6">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Icon width={20} height={20} />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-5">

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
            S
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              Shamim
            </h3>

            <p className="text-sm text-slate-500">
              Class 10 Student
            </p>
          </div>

        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-medium text-red-600 transition hover:bg-red-100">

          <LogOut width={18} height={18} />

          Logout

        </button>

      </div>
    </aside>
  );
}