"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Trophy,
  TrendingUp,
  Users,
  Settings,
  Flame,
  Target,
  Award,
  ListChecks,
  AlertTriangle,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  LucideIcon,
} from "lucide-react";

/**
 * Progress (উন্নতি) Page
 * কালার থিম: টিল + কোরাল (ড্যাশবোর্ড ও লিডারবোর্ডের সাথে মিলিয়ে)
 * ফিক্সড হেডার + স্ট্যাটস, স্ক্রলযোগ্য সাবজেক্ট প্রোগ্রেস + দুর্বল টপিক + অ্যাটেম্পট হিস্ট্রি, ফিক্সড বটম ন্যাভ
 */

type SubjectProgress = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  accuracy: number; // 0-100
  totalQuiz: number;
};

type WeakTopic = {
  id: string;
  subject: string;
  topic: string;
  accuracy: number;
};

type Attempt = {
  id: string;
  quizName: string;
  subject: string;
  score: number;
  totalMarks: number;
  date: string;
  durationMin: number;
};

const tabs = [
  { id: "home", label: "হোম", icon: Home, path: "/dashboard" },
  { id: "leaderboard", label: "র‍্যাঙ্ক", icon: Trophy, path: "/leaderboard" },
  { id: "progress", label: "উন্নতি", icon: TrendingUp, path: "/progress" },
  { id: "community", label: "সবাই", icon: Users, path: "/community" },
  { id: "settings", label: "সেটিংস", icon: Settings, path: "/settings" },
];

// এখানে পরে Firestore থেকে আসল ডেটা fetch করে বসাবেন
const overview = {
  totalQuiz: 42,
  avgScore: 78,
  bestScore: 96,
  streak: 6,
};

const subjectProgress: SubjectProgress[] = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, color: "#0D9488", accuracy: 85, totalQuiz: 12 },
  { id: "english", name: "English", icon: Languages, color: "#F87171", accuracy: 62, totalQuiz: 8 },
  { id: "math", name: "গণিত", icon: Calculator, color: "#6366F1", accuracy: 74, totalQuiz: 10 },
  { id: "science", name: "বিজ্ঞান", icon: FlaskConical, color: "#F59E0B", accuracy: 90, totalQuiz: 6 },
  { id: "socialScience", name: "সমাজবিজ্ঞান", icon: Globe2, color: "#14B8A6", accuracy: 55, totalQuiz: 4 },
  { id: "accounting", name: "হিসাববিজ্ঞান", icon: Landmark, color: "#FB7185", accuracy: 68, totalQuiz: 2 },
];

const weakTopics: WeakTopic[] = [
  { id: "w1", subject: "সমাজবিজ্ঞান", topic: "অর্থনৈতিক ইতিহাস", accuracy: 42 },
  { id: "w2", subject: "English", topic: "Tense & Voice", accuracy: 48 },
  { id: "w3", subject: "গণিত", topic: "ত্রিকোণমিতি", accuracy: 55 },
];

const attempts: Attempt[] = [
  { id: "a1", quizName: "বাংলা ২য় পত্র - ব্যাকরণ", subject: "বাংলা", score: 42, totalMarks: 50, date: "৫ জুলাই", durationMin: 18 },
  { id: "a2", quizName: "Grammar Set 3", subject: "English", score: 28, totalMarks: 40, date: "৩ জুলাই", durationMin: 22 },
  { id: "a3", quizName: "বীজগণিত অনুশীলন", subject: "গণিত", score: 35, totalMarks: 40, date: "১ জুলাই", durationMin: 15 },
  { id: "a4", quizName: "পদার্থবিজ্ঞান - অধ্যায় ৪", subject: "বিজ্ঞান", score: 27, totalMarks: 30, date: "২৯ জুন", durationMin: 12 },
];

export default function ProgressPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("progress");

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        {/* ফিক্সড টপ সেকশন: শিরোনাম + ওভারভিউ স্ট্যাটস */}
        <div className="flex-shrink-0 bg-slate-50 relative z-10 shadow-[0_4px_10px_-6px_rgba(15,23,42,0.12)]">
          <div className="px-5 pt-6 pb-2">
            <p className="text-base font-medium text-slate-900">উন্নতি</p>
            <p className="text-xs text-slate-400 mt-0.5">তোমার সামগ্রিক পারফরম্যান্স</p>
          </div>

          <div className="grid grid-cols-2 gap-3 px-5 pb-4 pt-3">
            <OverviewCard icon={ListChecks} label="মোট কুইজ" value={overview.totalQuiz} tone="teal" />
            <OverviewCard icon={Target} label="গড় স্কোর" value={`${overview.avgScore}%`} tone="coral" />
            <OverviewCard icon={Award} label="বেস্ট স্কোর" value={`${overview.bestScore}%`} tone="teal" />
            <OverviewCard icon={Flame} label="স্ট্রিক" value={`${overview.streak} দিন`} tone="coral" />
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6">
          {/* সাবজেক্ট-ভিত্তিক প্রোগ্রেস */}
          <p className="text-sm font-medium text-slate-500 mb-3">সাবজেক্ট-ভিত্তিক accuracy</p>
          <div className="flex flex-col gap-3 mb-6">
            {subjectProgress.map((s) => (
              <SubjectBar key={s.id} subject={s} />
            ))}
          </div>

          {/* দুর্বল টপিক */}
          <p className="text-sm font-medium text-slate-500 mb-3">দুর্বল জায়গা</p>
          <div className="flex flex-col gap-2.5 mb-6">
            {weakTopics.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
                style={{
                  background: "linear-gradient(145deg, #FFF1EE 0%, #FFE1DB 100%)",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
                }}
              >
                <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{w.topic}</p>
                  <p className="text-[11px] text-slate-400">{w.subject}</p>
                </div>
                <span className="text-sm font-medium text-rose-600 flex-shrink-0">{w.accuracy}%</span>
              </div>
            ))}
          </div>

          {/* সাম্প্রতিক অ্যাটেম্পট হিস্ট্রি */}
          <p className="text-sm font-medium text-slate-500 mb-3">সাম্প্রতিক অ্যাটেম্পট</p>
          <div className="flex flex-col gap-2.5">
            {attempts.map((a) => (
              <AttemptRow key={a.id} attempt={a} />
            ))}
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

/**
 * OverviewCard
 * ওভারভিউ স্ট্যাটসের জন্য 3D লুক কার্ড (ড্যাশবোর্ডের StatCard-এর স্টাইলে)
 */
function OverviewCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
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
      className="rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-transform active:scale-95"
      style={{
        background: gradient,
        boxShadow:
          "0 4px 8px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255,255,255,0.7) inset, 0 -3px 6px rgba(15, 23, 42, 0.05) inset",
      }}
    >
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.6)" }}
      >
        <Icon size={16} style={{ color: textColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-medium leading-tight" style={{ color: textColor }}>
          {value}
        </p>
        <p className="text-[11px] mt-0.5 opacity-80" style={{ color: textColor }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * SubjectBar
 * সাবজেক্ট-ভিত্তিক accuracy প্রোগ্রেস বার
 */
function SubjectBar({ subject }: { subject: SubjectProgress }) {
  const Icon = subject.icon;
  return (
    <div
      className="rounded-2xl px-4 py-3.5 bg-white"
      style={{ boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${subject.color}1A` }}
          >
            <Icon size={16} style={{ color: subject.color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{subject.name}</p>
            <p className="text-[11px] text-slate-400">{subject.totalQuiz}টি কুইজ</p>
          </div>
        </div>
        <span className="text-sm font-medium" style={{ color: subject.color }}>
          {subject.accuracy}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${subject.accuracy}%`, background: subject.color }}
        />
      </div>
    </div>
  );
}

/**
 * AttemptRow
 * সাম্প্রতিক অ্যাটেম্পট হিস্ট্রির জন্য লিস্ট রো
 */
function AttemptRow({ attempt }: { attempt: Attempt }) {
  const percent = Math.round((attempt.score / attempt.totalMarks) * 100);
  const isGood = percent >= 70;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-3.5 py-3 bg-white"
      style={{ boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{attempt.quizName}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {attempt.subject} · {attempt.date} · {attempt.durationMin} মিনিট
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-medium ${isGood ? "text-teal-700" : "text-rose-600"}`}>
          {attempt.score}/{attempt.totalMarks}
        </p>
        <p className="text-[10px] text-slate-400">{percent}%</p>
      </div>
    </div>
  );
}