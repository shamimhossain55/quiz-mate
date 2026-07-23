"use client";

import { useState } from "react";
import {
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
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Premium Progress (উন্নতি) Analytics Page
 * ভিজ্যুয়াল চার্ট, সার্কুলার প্রোগ্রেস রিং, উইকলি অ্যাক্টিভিটি হিটম্যাপ, এবং ইন্টারেক্টিভ বিশ্লেষণ
 */

type SubjectProgress = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  accuracy: number;
  totalQuiz: number;
  trend: "up" | "down" | "same";
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

// ডামি ডেটা (পরে Firestore থেকে আসবে)
const overview = {
  totalQuiz: 42,
  avgScore: 78,
  bestScore: 96,
  streak: 6,
};

const subjectProgress: SubjectProgress[] = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, color: "#0D9488", accuracy: 85, totalQuiz: 12, trend: "up" },
  { id: "english", name: "English", icon: Languages, color: "#F87171", accuracy: 62, totalQuiz: 8, trend: "down" },
  { id: "math", name: "গণিত", icon: Calculator, color: "#6366F1", accuracy: 74, totalQuiz: 10, trend: "up" },
  { id: "science", name: "বিজ্ঞান", icon: FlaskConical, color: "#F59E0B", accuracy: 90, totalQuiz: 6, trend: "up" },
  { id: "socialScience", name: "সমাজবিজ্ঞান", icon: Globe2, color: "#14B8A6", accuracy: 55, totalQuiz: 4, trend: "down" },
  { id: "accounting", name: "হিসাববিজ্ঞান", icon: Landmark, color: "#FB7185", accuracy: 68, totalQuiz: 2, trend: "same" },
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

// উইকলি অ্যাক্টিভিটি হিটম্যাপ ডেটা (৭ দিন)
const weeklyActivity = [
  { day: "শনি", quizzes: 5, color: "bg-teal-600" },
  { day: "রবি", quizzes: 3, color: "bg-teal-400" },
  { day: "সোম", quizzes: 7, color: "bg-teal-700" },
  { day: "মঙ্গল", quizzes: 2, color: "bg-teal-300" },
  { day: "বুধ", quizzes: 4, color: "bg-teal-500" },
  { day: "বৃহ", quizzes: 6, color: "bg-teal-600" },
  { day: "শুক্র", quizzes: 0, color: "bg-slate-200" },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "history">("overview");

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ফিক্সড টপ হেডার */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2 bg-white/80 backdrop-blur-md relative z-20 border-b border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                <TrendingUp width={20} height={20} className="text-teal-700" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  আমার উন্নতি
                </h1>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">সামগ্রিক পারফরম্যান্স বিশ্লেষণ</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-50/90 px-2.5 py-1 rounded-full border border-teal-200/80 shadow-2xs">
              <Sparkles width={11} height={11} className="text-amber-500" />
              <span>সপ্তাহের সেরা!</span>
            </div>
          </div>

          {/* ইনলাইন ট্যাব সুইচার */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 backdrop-blur-md rounded-full border border-slate-300/40 shadow-inner">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ওভারভিউ
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                activeTab === "subjects"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বিষয়ভিত্তিক
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              হিস্ট্রি
            </button>
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল কন্টেন্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 space-y-4 no-scrollbar">

          {activeTab === "overview" && (
            <>
              {/* সার্কুলার প্রোগ্রেস রিং */}
              <div className="flex items-center justify-center gap-6 py-2">
                <CircularProgress value={overview.avgScore} label="গড় স্কোর" color="#0D9488" size={100} />
                <div className="flex flex-col gap-2.5">
                  <MiniStat icon={ListChecks} label="মোট কুইজ" value={`${overview.totalQuiz}টি`} color="text-teal-800" bg="bg-teal-50" />
                  <MiniStat icon={Award} label="বেস্ট স্কোর" value={`${overview.bestScore}%`} color="text-amber-800" bg="bg-amber-50" />
                  <MiniStat icon={Flame} label="স্ট্রিক" value={`${overview.streak} দিন`} color="text-orange-800" bg="bg-orange-50" />
                </div>
              </div>

              {/* সাপ্তাহিক অ্যাক্টিভিটি হিটম্যাপ */}
              <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-slate-700 tracking-wide">সাপ্তাহিক অ্যাক্টিভিটি</p>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    এই সপ্তাহ
                  </span>
                </div>
                <div className="flex items-end justify-between gap-1.5">
                  {weeklyActivity.map((d) => {
                    const maxQ = 7;
                    const heightPercent = d.quizzes > 0 ? Math.max(15, (d.quizzes / maxQ) * 100) : 8;
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[8px] font-bold text-slate-500">{d.quizzes}</span>
                        <div
                          className={`w-full rounded-lg transition-all duration-300 ${d.quizzes > 0 ? d.color : "bg-slate-200"}`}
                          style={{ height: `${heightPercent}%`, minHeight: d.quizzes > 0 ? "16px" : "6px", maxHeight: "48px" }}
                        />
                        <span className="text-[9px] font-semibold text-slate-500">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* দুর্বল টপিক — কুইক অ্যালার্ট */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle width={14} height={14} className="text-rose-500" />
                    <p className="text-xs font-bold text-slate-700 tracking-wide">দুর্বল জায়গা — উন্নতি প্রয়োজন</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {weakTopics.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-white border border-rose-100 shadow-[0_2px_6px_rgba(244,63,94,0.06)] hover:shadow-md transition-shadow"
                    >
                      <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0 border border-rose-100">
                        <AlertTriangle width={14} height={14} className="text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{w.topic}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{w.subject}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-12 h-1.5 rounded-full bg-rose-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                            style={{ width: `${w.accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-rose-600">{w.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "subjects" && (
            <>
              {/* সাবজেক্ট-ভিত্তিক প্রোগ্রেস */}
              <div className="flex flex-col gap-2.5">
                {subjectProgress.map((s) => (
                  <SubjectCard key={s.id} subject={s} />
                ))}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <>
              {/* সাম্প্রতিক অ্যাটেম্পট হিস্ট্রি */}
              <div className="flex flex-col gap-2.5">
                {attempts.map((a) => (
                  <AttemptRow key={a.id} attempt={a} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      <BottomNav activeTab="progress" />
    </div>
  );
}

/**
 * CircularProgress
 * CSS সার্কুলার প্রোগ্রেস রিং (SVG conic gradient)
 */
function CircularProgress({
  value,
  label,
  color,
  size,
}: {
  value: number;
  label: string;
  color: string;
  size: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900 leading-none">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-500 tracking-wide">{label}</span>
    </div>
  );
}

/**
 * MiniStat
 */
function MiniStat({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center border border-white/60 shadow-2xs`}>
        <Icon width={14} height={14} className={color} />
      </div>
      <div>
        <p className={`text-xs font-black ${color} leading-none`}>{value}</p>
        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/**
 * SubjectCard
 * প্রিমিয়াম সাবজেক্ট-ভিত্তিক accuracy কার্ড
 */
function SubjectCard({ subject }: { subject: SubjectProgress }) {
  const Icon = subject.icon;
  const accuracyLevel = subject.accuracy >= 80 ? "excellent" : subject.accuracy >= 60 ? "good" : "weak";
  const statusLabel = accuracyLevel === "excellent" ? "দুর্দান্ত!" : accuracyLevel === "good" ? "ভালো" : "উন্নতি দরকার";
  const statusColor = accuracyLevel === "excellent" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : accuracyLevel === "good" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div
      className="rounded-2xl px-3.5 py-3 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        {/* আইকন */}
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/60 shadow-inner"
          style={{ background: `${subject.color}15` }}
        >
          <Icon width={20} height={20} style={{ color: subject.color }} />
        </div>

        {/* নাম, কুইজ সংখ্যা, ট্রেন্ড */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold text-slate-900 truncate">{subject.name}</p>
            {subject.trend === "up" && (
              <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-full border border-emerald-200">
                <TrendingUp width={9} height={9} />↑
              </span>
            )}
            {subject.trend === "down" && (
              <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1 py-0.2 rounded-full border border-rose-200">
                ↓
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">{subject.totalQuiz}টি কুইজ সম্পন্ন</span>
            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* সার্কুলার মিনি রিং */}
        <div className="flex-shrink-0">
          <MiniCircularRing value={subject.accuracy} color={subject.color} />
        </div>
      </div>

      {/* প্রোগ্রেস বার */}
      <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${subject.accuracy}%`,
            background: `linear-gradient(90deg, ${subject.color}80, ${subject.color})`,
            boxShadow: `0 0 8px ${subject.color}40`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * MiniCircularRing
 * ছোট সার্কুলার প্রোগ্রেস রিং (সাবজেক্ট কার্ডে ব্যবহৃত)
 */
function MiniCircularRing({ value, color }: { value: number; color: string }) {
  const size = 36;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-black text-slate-800">{value}%</span>
      </div>
    </div>
  );
}

/**
 * AttemptRow
 * সাম্প্রতিক অ্যাটেম্পট হিস্ট্রির জন্য প্রিমিয়াম কার্ড
 */
function AttemptRow({ attempt }: { attempt: Attempt }) {
  const percent = Math.round((attempt.score / attempt.totalMarks) * 100);
  const isExcellent = percent >= 80;
  const isGood = percent >= 60;

  const statusColor = isExcellent
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : isGood
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-rose-700 bg-rose-50 border-rose-200";

  const statusLabel = isExcellent ? "দুর্দান্ত" : isGood ? "ভালো" : "আরও চেষ্টা করো";

  return (
    <div className="rounded-2xl px-3.5 py-3 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 active:scale-[0.99]">
      <div className="flex items-center gap-3">
        {/* স্কোর সার্কেল */}
        <div className="flex-shrink-0">
          <MiniCircularRing value={percent} color={isExcellent ? "#059669" : isGood ? "#D97706" : "#E11D48"} />
        </div>

        {/* কুইজ তথ্য */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-900 truncate">{attempt.quizName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">{attempt.subject}</span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
              <Clock width={10} height={10} /> {attempt.durationMin} মিনিট
            </span>
          </div>
        </div>

        {/* স্কোর ও স্ট্যাটাস */}
        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <p className={`text-xs font-black ${isExcellent ? "text-emerald-700" : isGood ? "text-amber-700" : "text-rose-600"}`}>
            {attempt.score}/{attempt.totalMarks}
          </p>
          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}