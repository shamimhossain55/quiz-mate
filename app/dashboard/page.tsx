"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Target,
  Star,
  TrendingUp,
  Play,
  BookOpen,
  ChevronRight,
  Swords,
  BarChart3,
  Calculator,
  FlaskConical,
  Globe2,
  Languages,
  Sparkles,
  Zap,
  Trophy,
  Crown,
  LucideIcon,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { getSubjects } from "@/lib/firestore/subjects";

type SubjectItem = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  progress: number;
  chaptersCount?: number;
};

const defaultSubjects: SubjectItem[] = [
  { id: "bangla", name: "বাংলা", slug: "bangla", icon: BookOpen, color: "#0D9488", gradient: "linear-gradient(145deg, #0D9488 0%, #047857 100%)", progress: 85, chaptersCount: 12 },
  { id: "english", name: "English", slug: "english", icon: Languages, color: "#F87171", gradient: "linear-gradient(145deg, #F87171 0%, #E11D48 100%)", progress: 62, chaptersCount: 10 },
  { id: "math", name: "গণিত", slug: "math", icon: Calculator, color: "#6366F1", gradient: "linear-gradient(145deg, #6366F1 0%, #4338CA 100%)", progress: 74, chaptersCount: 15 },
  { id: "science", name: "বিজ্ঞান", slug: "science", icon: FlaskConical, color: "#F59E0B", gradient: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)", progress: 90, chaptersCount: 14 },
  { id: "socialScience", name: "সমাজবিজ্ঞান", slug: "social-science", icon: Globe2, color: "#14B8A6", gradient: "linear-gradient(145deg, #14B8A6 0%, #0F766E 100%)", progress: 55, chaptersCount: 8 },
  { id: "ict", name: "আইসিটি", slug: "ict", icon: BarChart3, color: "#EC4899", gradient: "linear-gradient(145deg, #EC4899 0%, #BE185D 100%)", progress: 80, chaptersCount: 9 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>(defaultSubjects);
  const [greeting, setGreeting] = useState("শুভ দিন");
  const [greetingEmoji, setGreetingEmoji] = useState("✨");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) { setGreeting("শুভ সকাল"); setGreetingEmoji("☀️"); }
    else if (hour >= 12 && hour < 17) { setGreeting("শুভ দুপুর"); setGreetingEmoji("🌤️"); }
    else if (hour >= 17 && hour < 20) { setGreeting("শুভ সন্ধ্যা"); setGreetingEmoji("🌇"); }
    else { setGreeting("শুভ রাত্রি"); setGreetingEmoji("🌙"); }

    async function loadSubjects() {
      try {
        const firestoreSubjects = await getSubjects("class6");
        if (firestoreSubjects && firestoreSubjects.length > 0) {
          const mapped: SubjectItem[] = firestoreSubjects.map((s, idx) => ({
            id: s.id, name: s.name, slug: s.slug || s.id,
            icon: defaultSubjects[idx % defaultSubjects.length].icon,
            color: defaultSubjects[idx % defaultSubjects.length].color,
            gradient: defaultSubjects[idx % defaultSubjects.length].gradient,
            progress: 70 + ((idx * 7) % 25),
            chaptersCount: 10 + (idx % 5),
          }));
          setSubjectsList(mapped);
        }
      } catch (err) { console.error("Error loading subjects:", err); }
    }
    loadSubjects();
  }, []);

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ===== HERO HEADER — transparent, bold, friendly ===== */}
        <div className="flex-shrink-0 px-5 pt-5 pb-0 relative z-20">

          {/* টপ বার: অ্যাভাটার + গ্রিটিং + স্ট্রিক */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* গ্রেডিয়েন্ট অ্যাভাটার রিং */}
              <div className="relative">
                <div className="h-12 w-12 rounded-full p-[2.5px] bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-500 shadow-lg">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
                    <span className="text-teal-300 font-black text-lg">S</span>
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-slate-50 shadow">✓</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-100">Lvl 12 · Pro</span>
                </div>
                <p className="text-slate-900 text-base font-extrabold leading-tight tracking-tight mt-0.5">
                  {greeting}, শামীম {greetingEmoji}
                </p>
              </div>
            </div>

            {/* স্ট্রিক ফায়ার পিল */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/80 px-3 py-2 shadow-[0_4px_12px_rgba(249,115,22,0.15)]">
              <Flame width={16} height={16} className="text-orange-500 fill-orange-500 animate-flame-pulse" />
              <div>
                <p className="text-sm font-black text-orange-700 leading-none">৭</p>
                <p className="text-[8px] font-bold text-orange-400 leading-none">দিন 🔥</p>
              </div>
            </div>
          </div>

          {/* ===== HERO BANNER — XP + Daily goal ===== */}
          <div
            className="rounded-3xl p-4 relative overflow-hidden shadow-[0_16px_40px_-8px_rgba(13,148,136,0.4)] border border-white/25 mb-4"
            style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)" }}
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

            {/* XP ব্র্যাকেট */}
            <div className="flex items-start justify-between relative z-10 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy width={16} height={16} className="text-amber-300 fill-amber-300" />
                  <span className="text-[11px] font-extrabold text-teal-100/90 uppercase tracking-widest">আজকের লক্ষ্য</span>
                </div>
                <p className="text-3xl font-black text-white leading-none tracking-tight">
                  ১,২৫০
                  <span className="text-lg font-bold text-teal-200 ml-1">XP</span>
                </p>
                <p className="text-[11px] text-teal-100/80 font-medium mt-1 flex items-center gap-1">
                  <Sparkles width={11} height={11} className="text-amber-300" />
                  আজ +১২৫ XP অর্জিত · শীর্ষ ১০% 🏆
                </p>
              </div>

              {/* শুরু করো বাটন */}
              <button
                onClick={() => router.push("/quiz/setup")}
                className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-xl active:scale-95 hover:scale-110 transition-all duration-200 flex-shrink-0"
                aria-label="কুইজ শুরু করুন"
              >
                <Play width={22} height={22} fill="#0D9488" className="ml-0.5 text-teal-600" />
              </button>
            </div>

            {/* ডেইলি গোল প্রোগ্রেস */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15">
              <div className="flex items-center justify-between text-[11px] text-teal-100 font-bold mb-1.5">
                <span className="flex items-center gap-1">
                  <Zap width={12} height={12} className="text-amber-300 fill-amber-300" />
                  দৈনিক লক্ষ্য অগ্রগতি
                </span>
                <span className="text-white font-black">৫/৮ কুইজ</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-teal-950/40 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-white shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-700"
                  style={{ width: "62%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-4 no-scrollbar">

          {/* ===== ৪-STAT GRID ===== */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Target, label: "লক্ষ্য", value: "৫/৮", color: "#0F766E", bg: "#E6F4F1" },
              { icon: Star, label: "XP", value: "১২৫০", color: "#BE123C", bg: "#FFE4E6" },
              { icon: Flame, label: "স্ট্রিক", value: "৭d", color: "#B45309", bg: "#FEF3C7" },
              { icon: TrendingUp, label: "সঠিক", value: "৯২%", color: "#4338CA", bg: "#E0E7FF" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl flex flex-col items-center py-2.5 px-1 gap-1 border active:scale-95 transition-all"
                style={{ background: s.bg, borderColor: `${s.color}30`, boxShadow: `0 2px 8px ${s.color}12` }}
              >
                <s.icon width={16} height={16} style={{ color: s.color }} />
                <span className="text-sm font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[8px] font-bold opacity-70" style={{ color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ===== ৩ QUICK ACTIONS ===== */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">দ্রুত অ্যাকশন</p>
            <div className="grid grid-cols-3 gap-2.5">
              <QuickActionButton icon={Play} label="কুইজ খেলুন" badge="HOT" onClick={() => router.push("/quiz/setup")} gradient="from-teal-500 to-emerald-600" />
              <QuickActionButton icon={Swords} label="১v১ ব্যাটেল" badge="LIVE" onClick={() => router.push("/community")} gradient="from-violet-500 to-indigo-600" live />
              <QuickActionButton icon={BarChart3} label="পারফরম্যান্স" badge="নতুন" onClick={() => router.push("/progress")} gradient="from-rose-500 to-pink-600" />
            </div>
          </div>

          {/* ===== CONTINUE LEARNING CARD ===== */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen width={14} height={14} className="text-slate-700" />
                <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest">পড়া চালিয়ে যান</p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 cursor-pointer">অধ্যায় ৫/১২ →</span>
            </div>
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3 bg-white border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group"
              onClick={() => router.push("/quiz/setup")}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-md">
                <Calculator width={22} height={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100 uppercase tracking-wide">গণিত · ১০ম অধ্যায়</span>
                </div>
                <p className="text-sm font-extrabold text-slate-900 leading-tight">বীজগণিতীয় রাশি</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 shadow-sm" />
                </div>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">৭২% সম্পন্ন</p>
              </div>
              <ChevronRight width={18} height={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </div>

          {/* ===== SUBJECT BOOK GRID ===== */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles width={13} height={13} className="text-amber-500" />
                <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest">পাঠ্যবই</p>
              </div>
              <span onClick={() => router.push("/subjects")} className="text-[10px] font-bold text-teal-700 cursor-pointer hover:underline flex items-center gap-0.5">
                সব দেখুন <ChevronRight width={11} height={11} />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {subjectsList.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div
                    key={subject.id}
                    onClick={() => router.push(`/subject/${subject.slug}`)}
                    className="rounded-2xl p-2.5 flex flex-col justify-between relative cursor-pointer active:scale-95 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                    style={{ background: subject.gradient, minHeight: "120px", boxShadow: `0 8px 20px ${subject.color}35` }}
                  >
                    {/* স্পাইন শ্যাডো */}
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/15 rounded-full blur-md pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="h-7 w-7 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                        <Icon width={14} height={14} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
                        {subject.progress}%
                      </span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className="text-[8px] text-white/75 font-extrabold uppercase tracking-wider">
                        {subject.chaptersCount ?? "—"} অধ্যায়
                      </p>
                      <h4 className="text-[11px] font-extrabold text-white leading-snug truncate mt-0.5 group-hover:text-amber-200 transition-colors">
                        {subject.name}
                      </h4>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-black/25 overflow-hidden">
                        <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${subject.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}

/* ===== QuickActionButton ===== */
function QuickActionButton({
  icon: Icon,
  label,
  badge,
  onClick,
  gradient,
  live = false,
}: {
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick: () => void;
  gradient: string;
  live?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center pt-3 pb-2.5 px-2 rounded-2xl bg-white border border-slate-200/80 active:scale-95 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:shadow-md group overflow-hidden"
    >
      {/* ব্যাকগ্রাউন্ড গ্লো অন হভার */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${gradient} pointer-events-none`} />

      {badge && (
        <span className={`absolute top-1.5 right-1.5 px-1 py-0.2 text-[7px] font-extrabold rounded-full text-white bg-gradient-to-r ${gradient} shadow-sm ${live ? "animate-pulse" : ""}`}>
          {badge}
        </span>
      )}

      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-1.5 shadow-md group-hover:scale-105 transition-transform`}>
        <Icon width={20} height={20} className="text-white" />
      </div>

      <span className="text-[10px] font-extrabold text-slate-700 text-center leading-tight">{label}</span>
    </button>
  );
}