"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Trophy,
  TrendingUp,
  Users,
  Settings,
  Bell,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  LucideIcon,
} from "lucide-react";

/**
 * Student Dashboard Page
 * কালার থিম: টিল + কোরাল
 * টার্গেট: Class 8 - Class 12 কুইজ পোর্টাল, মোবাইল-ফার্স্ট
 * লেআউট: হেডার + স্ট্যাটস ফিক্সড, ব্যানার + সাবজেক্ট গ্রিড স্ক্রলযোগ্য, বটম ন্যাভ ফিক্সড
 */

type Subject = {
  id: string;
  name: string;
  icon: LucideIcon;
  cover: string;
  spine: string;
};

const subjects: Subject[] = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, cover: "#0D9488", spine: "#0F766E" },
  { id: "english", name: "English", icon: Languages, cover: "#F87171", spine: "#DC2626" },
  { id: "math", name: "গণিত", icon: Calculator, cover: "#6366F1", spine: "#4338CA" },
  { id: "science", name: "বিজ্ঞান", icon: FlaskConical, cover: "#F59E0B", spine: "#B45309" },
  { id: "socialScience", name: "সমাজবিজ্ঞান", icon: Globe2, cover: "#14B8A6", spine: "#0F766E" },
  { id: "accounting", name: "হিসাববিজ্ঞান", icon: Landmark, cover: "#FB7185", spine: "#BE123C" },
];

const tabs = [
  { id: "home", label: "হোম", icon: Home, path: "/dashboard" },
  { id: "leaderboard", label: "র‍্যাঙ্ক", icon: Trophy, path: "/leaderboard" },
  { id: "progress", label: "উন্নতি", icon: TrendingUp, path: "/progress" },
  { id: "community", label: "সবাই", icon: Users, path: "/community" },
  { id: "settings", label: "সেটিংস", icon: Settings, path: "/settings" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  // এখানে পরে Firestore থেকে আসল ডেটা fetch করে বসাবেন
  const student = {
    name: "শামীম হোসেন",
    className: "Class 10",
    group: "Commerce",
    avatarUrl: null as string | null,
  };
  const stats = { totalExam: 12, point: 850, rank: 5 };
  const banner = {
    title: "নতুন কুইজ যুক্ত হয়েছে",
    subtitle: "বাংলা ২য় পত্র - ব্যাকরণ অংশ",
  };
  const hasNotification = true;

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        {/* ফিক্সড টপ সেকশন: হেডার + স্ট্যাটস */}
        <div className="flex-shrink-0 bg-slate-50 relative z-10 shadow-[0_4px_10px_-6px_rgba(15,23,42,0.12)]">
          {/* হেডার */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-teal-200 bg-teal-50 flex items-center justify-center">
                {student.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-teal-700 font-medium text-sm">
                    {student.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-base font-medium text-slate-900 leading-tight">
                  {student.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {student.className}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ color: "#9A3412", background: "#FEF2F0" }}
                  >
                    {student.group}
                  </span>
                </div>
              </div>
            </div>

            <button
              aria-label="নোটিফিকেশন"
              className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 active:scale-95 transition-transform"
            >
              <Bell size={18} className="text-slate-600" />
              {hasNotification && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400" />
              )}
            </button>
          </div>

          {/* স্ট্যাটস কার্ড - 3D লুক */}
          <div className="grid grid-cols-3 gap-3 px-5 pb-4">
            <StatCard label="Total exam" value={stats.totalExam} tone="teal" />
            <StatCard label="Point" value={stats.point} tone="coral" />
            <StatCard label="Rank" value={`#${stats.rank}`} tone="teal" />
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন: ব্যানার + সাবজেক্ট গ্রিড */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-6">
          {/* ব্যানার */}
          <div className="mx-5 mt-4 rounded-2xl bg-teal-600 px-5 py-5 text-white">
            <p className="text-sm font-medium opacity-90">{banner.subtitle}</p>
            <p className="text-lg font-medium mt-1">{banner.title}</p>
            <div className="flex gap-1.5 mt-4">
              <span className="h-1.5 w-4 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          {/* সাবজেক্ট গ্রিড - বইয়ের মতো কার্ড */}
          <div className="px-5 mt-6">
            <p className="text-sm font-medium text-slate-500 mb-3">বিষয়সমূহ</p>
            <div className="grid grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <BookCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => console.log("সাবজেক্ট ক্লিক:", subject.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ফিক্সড বটম ন্যাভিগেশন */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-sm flex items-center justify-between px-6 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(tab.path);
                }}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <Icon
                  size={20}
                  className={isActive ? "text-teal-700" : "text-slate-400"}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-teal-700" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-teal-700 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "teal" | "coral";
}) {
  const gradient =
    tone === "coral"
      ? "linear-gradient(145deg, #FFF1EE 0%, #FFE1DB 100%)"
      : "linear-gradient(145deg, #E9FBF8 0%, #D7F5EF 100%)";
  const textColor = tone === "coral" ? "#9A3412" : "#0F766E";

  return (
    <div
      className="rounded-2xl py-4 text-center transition-transform active:scale-95"
      style={{
        background: gradient,
        boxShadow:
          "0 4px 8px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255,255,255,0.7) inset, 0 -3px 6px rgba(15, 23, 42, 0.05) inset",
        color: textColor,
      }}
    >
      <p className="text-lg font-medium">{value}</p>
      <p className="text-[11px] mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

/**
 * BookCard
 * প্রতিটা সাবজেক্ট কার্ডকে একটা real 3D বইয়ের মতো দেখায়
 */
function BookCard({
  subject,
  onClick,
}: {
  subject: Subject;
  onClick: () => void;
}) {
  const Icon = subject.icon;

  return (
    <button
      onClick={onClick}
      className="group relative h-32 w-full [perspective:600px] active:scale-[0.97] transition-transform"
    >
      {/* পাতার লেয়ার - বইয়ের ডানদিকে পুরুত্ব বোঝায় */}
      <span
        className="absolute top-1 -right-1 h-[calc(100%-8px)] w-full rounded-r-md rounded-l-sm"
        style={{ background: "#F4F4F5", boxShadow: "1px 0 0 #E4E4E7" }}
      />
      <span
        className="absolute top-0.5 -right-0.5 h-[calc(100%-4px)] w-full rounded-r-md rounded-l-sm"
        style={{ background: "#FAFAFA", boxShadow: "1px 0 0 #EAEAEA" }}
      />

      {/* বইয়ের কভার */}
      <div
        className="relative h-full w-full rounded-r-md rounded-l-sm overflow-hidden transition-transform duration-200 group-hover:-rotate-1 group-hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(155deg, ${subject.cover} 0%, ${subject.spine} 100%)`,
          boxShadow:
            "0 10px 18px -6px rgba(15, 23, 42, 0.28), inset -2px 0 3px rgba(0,0,0,0.15)",
        }}
      >
        {/* স্পাইন */}
        <span
          className="absolute left-0 top-0 h-full w-2"
          style={{
            background: subject.spine,
            boxShadow: "1px 0 2px rgba(0,0,0,0.2) inset",
          }}
        />
        {/* কভারের উপর হালকা গ্লস */}
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 35%)",
          }}
        />

        <div className="relative h-full flex flex-col items-center justify-center gap-1.5 px-2 pl-3">
          <Icon size={22} className="text-white drop-shadow" />
          <span className="text-[11px] font-medium text-white text-center leading-tight drop-shadow">
            {subject.name}
          </span>
        </div>
      </div>
    </button>
  );
}