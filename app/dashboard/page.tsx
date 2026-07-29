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
  GraduationCap,
  LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/layout/BottomNav";
import BannerCarousel from "@/components/dashboard/BannerCarousel";
import { getSubjects } from "@/lib/firestore/subjects";
import { getStudentProfile } from "@/lib/firestore/student";
import { getActiveBanners, BannerSlide } from "@/lib/firestore/banners";
import { Student } from "@/types/firestore";

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

type SubjectItem = {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  shadowColor: string;
  progress: number;
  chaptersCount?: number;
  completedChapters?: number;
  tagline?: string;
  imageUrl?: string;
};

const defaultPalette = [
  { color: "#0D9488", gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #047857 100%)", shadowColor: "rgba(13, 148, 136, 0.4)", icon: BookOpen },
  { color: "#F43F5E", gradient: "linear-gradient(135deg, #E11D48 0%, #F43F5E 50%, #BE123C 100%)", shadowColor: "rgba(244, 63, 94, 0.4)", icon: Languages },
  { color: "#6366F1", gradient: "linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #3730A3 100%)", shadowColor: "rgba(99, 102, 241, 0.4)", icon: Calculator },
  { color: "#D97706", gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)", shadowColor: "rgba(245, 158, 11, 0.4)", icon: FlaskConical },
  { color: "#0284C7", gradient: "linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #075985 100%)", shadowColor: "rgba(2, 132, 199, 0.4)", icon: Globe2 },
  { color: "#DB2777", gradient: "linear-gradient(135deg, #BE185D 0%, #DB2777 50%, #9D174D 100%)", shadowColor: "rgba(219, 39, 119, 0.4)", icon: BarChart3 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [bannerList, setBannerList] = useState<BannerSlide[]>([]);
  const [greeting, setGreeting] = useState("শুভ দিন");
  const [greetingEmoji, setGreetingEmoji] = useState("✨");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) { setGreeting("শুভ সকাল"); setGreetingEmoji("☀️"); }
    else if (hour >= 12 && hour < 17) { setGreeting("শুভ দুপুর"); setGreetingEmoji("🌤️"); }
    else if (hour >= 17 && hour < 20) { setGreeting("শুভ সন্ধ্যা"); setGreetingEmoji("<ctrl42>"); }
    else { setGreeting("শুভ রাত্রি"); setGreetingEmoji("🌙"); }

    async function loadData() {
      try {
        let studentProfile = null;
        if (session?.user?.email) {
          studentProfile = await getStudentProfile(session.user.email);
          if (studentProfile) setStudent(studentProfile);
        }

        const activeBanners = await getActiveBanners();
        setBannerList(activeBanners || []);

        let localImages: Record<string, string> = {};
        try {
          const cached = localStorage.getItem("quiz_mate_subject_images");
          if (cached) localImages = JSON.parse(cached);
        } catch (e) {}

        const targetClassId = studentProfile?.classId || "class6";
        const targetGroup = studentProfile?.group || "all";
        const firestoreSubjects = await getSubjects(targetClassId, targetGroup);
        if (firestoreSubjects && firestoreSubjects.length > 0) {
          const mapped: SubjectItem[] = firestoreSubjects.map((s, idx) => {
            const pal = defaultPalette[idx % defaultPalette.length];
            const img = s.imageUrl || localImages[s.id] || localImages[s.slug];
            return {
              id: s.id,
              name: s.name,
              slug: s.slug || s.id,
              icon: pal.icon,
              color: s.color || pal.color,
              gradient: s.color ? `linear-gradient(135deg, ${s.color} 0%, #0F766E 100%)` : pal.gradient,
              shadowColor: s.color ? `${s.color}60` : pal.shadowColor,
              progress: 0,
              chaptersCount: 0,
              completedChapters: 0,
              tagline: s.description || "পাঠ্যবই ও অনুশীলনী",
              imageUrl: img,
            };
          });
          setSubjectsList(mapped);
        } else {
          setSubjectsList([]);
        }
      } catch (err) { console.error("Error loading dashboard data:", err); }
    }
    loadData();
  }, [session]);

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ===== 1. FIXED TOP HEADER (YELLOW SECTION) ===== */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 bg-slate-50/95 backdrop-blur-md z-30 border-b border-slate-200/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar with online status */}
              <div className="relative">
                <div className="h-12 w-12 rounded-full p-[2.5px] bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-500 shadow-md">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center border border-white/10 overflow-hidden">
                    {student?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-teal-300 font-black text-lg">
                        {(student?.name || session?.user?.name || "S").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-slate-50 shadow">✓</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/90 shadow-2xs">
                    Lvl {student?.level || 12} · Pro
                  </span>
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/90 flex items-center gap-1 shadow-2xs">
                    <GraduationCap width={11} height={11} className="text-indigo-600" />
                    {CLASS_NAMES[student?.classId || "class6"] || student?.classId || "ষষ্ঠ শ্রেণী"}
                    {student?.group && student.group !== "all" ? ` (${GROUP_NAMES[student.group] || student.group})` : ""}
                  </span>
                </div>
                <p className="text-slate-900 text-base font-extrabold leading-tight tracking-tight mt-0.5">
                  {greeting}, {student?.name || session?.user?.name || "শিক্ষার্থী"} {greetingEmoji}
                </p>
              </div>
            </div>

            {/* Streak Fire Pill */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/80 px-3 py-2 shadow-[0_4px_12px_rgba(249,115,22,0.15)] flex-shrink-0">
              <Flame width={16} height={16} className="text-orange-500 fill-orange-500 animate-flame-pulse" />
              <div>
                <p className="text-sm font-black text-orange-700 leading-none">{student?.streak || 0}</p>
                <p className="text-[8px] font-bold text-orange-400 leading-none">দিন 🔥</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SCROLLABLE CONTENT AREA ===== */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 space-y-4 no-scrollbar">

          {/* ===== 2. RED SECTION (SCROLLABLE - ABOVE BANNER) ===== */}
          {/* 4-STAT GRID */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Target, label: "পরীক্ষা", value: String(student?.totalExam || 0), color: "#0F766E", bg: "#E6F4F1" },
              { icon: Star, label: "XP", value: String(student?.point || 0), color: "#BE123C", bg: "#FFE4E6" },
              { icon: Flame, label: "স্ট্রিক", value: `${student?.streak || 0}d`, color: "#B45309", bg: "#FEF3C7" },
              { icon: TrendingUp, label: "লেভেল", value: `Lvl ${student?.level || 1}`, color: "#4338CA", bg: "#E0E7FF" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl flex flex-col items-center py-2.5 px-1 gap-1 border active:scale-95 transition-all shadow-2xs"
                style={{ background: s.bg, borderColor: `${s.color}30`, boxShadow: `0 2px 8px ${s.color}12` }}
              >
                <s.icon width={16} height={16} style={{ color: s.color }} />
                <span className="text-sm font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[8px] font-bold opacity-70" style={{ color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* 3 QUICK ACTIONS */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">দ্রুত অ্যাকশন</p>
            <div className="grid grid-cols-3 gap-2.5">
              <QuickActionButton icon={Play} label="কুইজ খেলুন" badge="HOT" onClick={() => router.push("/quiz/setup")} gradient="from-teal-500 to-emerald-600" />
              <QuickActionButton icon={Swords} label="১v১ ব্যাটেল" badge="LIVE" onClick={() => router.push("/community")} gradient="from-violet-500 to-indigo-600" live />
              <QuickActionButton icon={BarChart3} label="পারফরম্যান্স" badge="নতুন" onClick={() => router.push("/progress")} gradient="from-rose-500 to-pink-600" />
            </div>
          </div>

          {/* ===== 3. GREEN SECTION (DYNAMIC BANNER CAROUSEL / IMAGE SLIDER) ===== */}
          <BannerCarousel slides={bannerList} />

          {/* ===== SUBJECT BOOK GRID ===== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles width={14} height={14} className="text-amber-500 fill-amber-400" />
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">পাঠ্যবই ও বিষয়সমূহ</p>
              </div>
              <span onClick={() => router.push("/subjects")} className="text-[10px] font-extrabold text-teal-700 cursor-pointer hover:text-teal-900 transition-colors flex items-center gap-0.5 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                সব দেখুন <ChevronRight width={12} height={12} />
              </span>
            </div>

            {subjectsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white border border-slate-200/80 text-center shadow-2xs space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <BookOpen width={24} height={24} />
                </div>
                <p className="text-xs font-extrabold text-slate-800">কোনো বিষয় যোগ করা হয়নি</p>
                <p className="text-[10px] text-slate-500 max-w-xs">এডমিন প্যানেল থেকে বিষয় যুক্ত করলে এখানে দেখতে পাবেন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {subjectsList.map((subject) => {
                  const totalCh = subject.chaptersCount || 0;
                  const completedCh = subject.completedChapters || 0;

                  return (
                    <div
                      key={subject.id}
                      onClick={() => router.push(`/subject/${subject.slug}`)}
                      className="relative rounded-2xl p-2 flex flex-col justify-between cursor-pointer active:scale-95 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group aspect-[3/4] min-h-[145px] border border-white/25 shadow-lg"
                      style={{
                        background: subject.gradient,
                        boxShadow: `0 10px 22px ${subject.shadowColor || "rgba(0,0,0,0.25)"}`,
                      }}
                    >
                      {/* Subject Cover Image */}
                      {subject.imageUrl ? (
                        <div className="absolute inset-0 z-0">
                          <img
                            src={subject.imageUrl}
                            alt={subject.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                        </div>
                      ) : null}

                      {/* 3D Real Book Spine Edge */}
                      <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/60 via-black/30 to-transparent border-r border-white/20 pointer-events-none z-10" />

                      {/* Top Page Stack Paper Lines Effect */}
                      <div className="absolute top-0 right-2.5 left-2.5 h-0.5 bg-white/30 rounded-b pointer-events-none z-10" />

                      {/* Ambient Floating Glow Orb */}
                      <div className="absolute -top-5 -right-5 w-14 h-14 bg-white/15 rounded-full blur-md pointer-events-none group-hover:scale-150 transition-transform duration-500 z-10" />

                      {/* Top Row: Progress Badge */}
                      <div className="flex items-center justify-end relative z-10">
                        <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.2 rounded-full border border-white/20 text-[8px] font-black text-white shadow-2xs">
                          <Zap width={8} height={8} className="text-amber-300 fill-amber-300" />
                          <span>{subject.progress}%</span>
                        </div>
                      </div>

                      {/* Middle & Bottom: Subject Info */}
                      <div className="relative z-10 mt-auto pt-1 pl-0.5">
                        <span className="text-[7.5px] font-black text-amber-200 uppercase tracking-tight bg-black/30 backdrop-blur-xs px-1 py-0.2 rounded border border-white/15 inline-block mb-0.5">
                          {completedCh}/{totalCh} অধ্যায়
                        </span>

                        <h4 className="text-[11.5px] font-black text-white leading-snug truncate group-hover:text-amber-200 transition-colors">
                          {subject.name}
                        </h4>

                        <p className="text-[8px] font-semibold text-white/80 truncate mt-0.5">
                          {subject.tagline || "পাঠ্যবই"}
                        </p>

                        {/* Progress Bar & Read Action */}
                        <div className="mt-1.5 space-y-0.5">
                          <div className="h-1 w-full rounded-full bg-black/40 overflow-hidden border border-white/15">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-700"
                              style={{ width: `${subject.progress}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-0.5 text-[8px] font-black text-white/90">
                            <span className="group-hover:text-amber-200 transition-colors truncate">পড়া শুরু</span>
                            <div className="h-3.5 w-3.5 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all flex-shrink-0">
                              <ChevronRight width={8} height={8} className="text-white group-hover:text-slate-900 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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