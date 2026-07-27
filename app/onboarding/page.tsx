"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Trophy,
  Swords,
  GraduationCap,
  FlaskConical,
  Landmark,
  BookOpen,
  Calculator,
  Crown,
  ChevronRight,
  Zap,
  Flame,
  Target,
  Star,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  LucideIcon,
} from "lucide-react";

type ClassOption = {
  id: string;
  name: string;
  hasGroups: boolean;
};

type ClassDisplayConfig = {
  subTitle: string;
  badge: string;
  gradient: string;
  icon: LucideIcon;
};

const CLASS_CONFIGS: Record<string, ClassDisplayConfig> = {
  class6: {
    subTitle: "সকল বিষয় ও মৌলিক কুইজ",
    badge: "ষষ্ঠ শ্রেণী",
    gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #047857 100%)",
    icon: BookOpen,
  },
  class7: {
    subTitle: "উন্নত পাঠ্যবই ও মেধা পরীক্ষা",
    badge: "সপ্তম শ্রেণী",
    gradient: "linear-gradient(135deg, #4338CA 0%, #4F46E5 50%, #3730A3 100%)",
    icon: Calculator,
  },
  class8: {
    subTitle: "জেএসসি প্রস্তুতি ও অধ্যায় কুইজ",
    badge: "অষ্টম শ্রেণী",
    gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)",
    icon: FlaskConical,
  },
  class9_10: {
    subTitle: "এসএসসি স্পেশাল ও ৩টি গ্রুপ",
    badge: "নবম-দশম (SSC)",
    gradient: "linear-gradient(135deg, #BE123C 0%, #E11D48 50%, #9F1239 100%)",
    icon: GraduationCap,
  },
  class11_12: {
    subTitle: "এইচএসসি ও অ্যাডমিশন প্রস্তুতি",
    badge: "একাদশ-দ্বাদশ (HSC)",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #5B21B6 100%)",
    icon: Crown,
  },
};

const DEFAULT_CLASSES: ClassOption[] = [
  { id: "class6", name: "ষষ্ঠ শ্রেণী", hasGroups: false },
  { id: "class7", name: "সপ্তম শ্রেণী", hasGroups: false },
  { id: "class8", name: "অষ্টম শ্রেণী", hasGroups: false },
  { id: "class9_10", name: "নবম-দশম শ্রেণী (SSC)", hasGroups: true },
  { id: "class11_12", name: "একাদশ-দ্বাদশ শ্রেণী (HSC)", hasGroups: true },
];

const GROUPS = [
  {
    id: "science",
    label: "বিজ্ঞান",
    subLabel: "Science Stream",
    desc: "পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান",
    icon: FlaskConical,
    gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
    color: "#0D9488",
  },
  {
    id: "commerce",
    label: "ব্যবসায় শিক্ষা",
    subLabel: "Commerce Stream",
    desc: "হিসাববিজ্ঞান, ফিন্যান্স, ব্যবসায় উদ্যোগ",
    icon: Landmark,
    gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
    color: "#F59E0B",
  },
  {
    id: "arts",
    label: "মানবিক",
    subLabel: "Arts Stream",
    desc: "বাংলাদেশ ও বিশ্বপরিচয়, ইতিহাস, অর্থনীতি",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
    color: "#6366F1",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();

  const [isPreview, setIsPreview] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>(DEFAULT_CLASSES);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>("class9_10");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if URL has ?preview=true or if user is previewing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("preview") === "true") {
        // setTimeout দিয়ে setState কল করা হচ্ছে যাতে
        // useEffect-এর মধ্যে synchronous cascading render না হয়
        setTimeout(() => setIsPreview(true), 0);
      }
    }
  }, []);

  // Redirect if not authenticated (unless preview mode)
  useEffect(() => {
    if (!isPreview && status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router, isPreview]);

  useEffect(() => {
    async function loadInitial() {
      try {
        if (!isPreview) {
          const studentRes = await fetch("/api/student-data");
          if (studentRes.ok) {
            const { student } = await studentRes.json();
            if (student?.profileComplete) {
              router.replace("/dashboard");
              return;
            }
          }
        }

        const classesRes = await fetch("/api/classes");
        if (classesRes.ok) {
          const { classes: fetchedClasses } = await classesRes.json();
          if (fetchedClasses && fetchedClasses.length > 0) {
            setClasses(fetchedClasses);
          }
        }
      } catch (err) {
        console.error("Error loading onboarding classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    }

    if (isPreview || status === "authenticated") {
      loadInitial();
    }
  }, [status, router, isPreview]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;
  const needsGroup = selectedClass?.hasGroups ?? false;
  const canSubmit = Boolean(selectedClassId) && (!needsGroup || Boolean(selectedGroup));

  function handleSelectClass(classId: string) {
    setSelectedClassId(classId);
    setSelectedGroup(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    if (isPreview) {
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      return;
    }

    try {
      const res = await fetch("/api/student-data/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, group: selectedGroup }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "সেভ করতে সমস্যা হয়েছে");
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "সেভ করতে সমস্যা হয়েছে");
      setSubmitting(false);
    }
  }

  if (!isPreview && (status === "loading" || loadingClasses)) {
    return (
      <div className="h-screen bg-slate-50 font-sans flex flex-col items-center justify-center gap-3">
        <Loader2 width={36} height={36} className="text-teal-600 animate-spin" />
        <p className="text-xs font-black text-slate-600">QuizMate সেটআপ হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ── TOP HEADER (Dashboard style) ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-1 relative z-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-600 p-[2px] shadow-md">
                <div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center">
                  <Zap width={16} height={16} className="text-teal-300" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  QuizMate Onboarding
                </h1>
                <p className="text-[10px] text-teal-700 font-bold leading-none mt-0.5">
                  তোমার প্রোফাইল সেটআপ
                </p>
              </div>
            </div>

            {isPreview ? (
              <div className="flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
                <Eye width={12} height={12} className="text-indigo-600" />
                <span>প্রিভিউ মোড</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-black text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 shadow-2xs">
                <Flame width={12} height={12} className="fill-orange-500 text-orange-500" />
                <span>১০০+ XP ফ্রি</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-6 space-y-4 no-scrollbar">

          {/* ── GRAND HERO BANNER (Leaderboard / Dashboard Banner Style) ── */}
          <div
            className="rounded-3xl p-4 relative overflow-hidden shadow-[0_16px_36px_-8px_rgba(13,148,136,0.4)] border border-white/30"
            style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4338CA 100%)" }}
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles width={15} height={15} className="text-amber-300" />
                  <span className="text-[10px] font-extrabold text-teal-100 uppercase tracking-wider">
                    শেখা হবে আনন্দময়!
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  তোমার বিষয় ও কুইজ সাজিয়ে নাও 📚
                </h2>
              </div>

              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md flex-shrink-0">
                <Trophy width={20} height={20} className="text-amber-300 fill-amber-300" />
              </div>
            </div>

            {/* 3 Live Feature Highlights Chips */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 pt-1">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 border border-white/20 flex flex-col items-center text-center">
                <Target width={14} height={14} className="text-teal-200 mb-0.5" />
                <span className="text-[9px] font-black text-white leading-tight">অধ্যায় কুইজ</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 border border-white/20 flex flex-col items-center text-center">
                <Swords width={14} height={14} className="text-amber-300 mb-0.5" />
                <span className="text-[9px] font-black text-white leading-tight">১v১ ব্যাটেল</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 border border-white/20 flex flex-col items-center text-center">
                <Star width={14} height={14} className="text-amber-300 fill-amber-300 mb-0.5" />
                <span className="text-[9px] font-black text-white leading-tight">লিডারবোর্ড</span>
              </div>
            </div>
          </div>

          {/* ── CLASS SELECTION SECTION (Dashboard Book Style Cards) ── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <GraduationCap width={15} height={15} className="text-teal-700" />
                <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                  তোমার শ্রেণী বেছে নাও
                </h3>
              </div>
              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                এক ক্লিকে নির্বাচন
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {classes.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                const conf = CLASS_CONFIGS[cls.id] || {
                  subTitle: "বইভিত্তিক প্রশ্নাবলী",
                  badge: cls.name,
                  gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
                  icon: BookOpen,
                };
                const Icon = conf.icon;

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`rounded-2xl p-3.5 relative cursor-pointer active:scale-[0.98] transition-all duration-300 overflow-hidden group ${
                      isSelected
                        ? "ring-2 ring-teal-500 shadow-[0_8px_25px_rgba(13,148,136,0.35)] scale-[1.01]"
                        : "hover:shadow-md shadow-2xs opacity-95 hover:opacity-100"
                    }`}
                    style={{ background: conf.gradient }}
                  >
                    {/* Book spine overlay */}
                    <div className="absolute top-0 bottom-0 left-0 w-2 bg-black/20 pointer-events-none" />
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-md pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md flex-shrink-0">
                          <Icon width={22} height={22} className="text-white" />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-white leading-tight">
                              {cls.name}
                            </span>
                            {cls.hasGroups && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                                ৩টি গ্রুপ
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/80 font-medium mt-0.5">
                            {conf.subTitle}
                          </p>
                        </div>
                      </div>

                      {/* Selection Checkmark Ring */}
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="h-8 w-8 rounded-full bg-white text-teal-800 flex items-center justify-center shadow-lg animate-bounce-short">
                            <Check width={18} height={18} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-white/20 border border-white/40 backdrop-blur-md" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── GROUP SELECTION SECTION (For Class 9-10 & Class 11-12) ── */}
          {needsGroup && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles width={14} height={14} className="text-amber-500" />
                  <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                    তোমার গ্রুপ সিলেক্ট করো
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {GROUPS.map((grp) => {
                  const isSelected = grp.id === selectedGroup;
                  const Icon = grp.icon;

                  return (
                    <div
                      key={grp.id}
                      onClick={() => {
                        setSelectedGroup(grp.id);
                        setError(null);
                      }}
                      className={`rounded-2xl p-3.5 relative cursor-pointer active:scale-[0.98] transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.35)] scale-[1.01]"
                          : "hover:shadow-md shadow-2xs opacity-90 hover:opacity-100"
                      }`}
                      style={{ background: grp.gradient }}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md flex-shrink-0">
                            <Icon width={20} height={20} className="text-white" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-white leading-tight">
                                {grp.label}
                              </span>
                              <span className="text-[8px] font-bold text-white/80">
                                ({grp.subLabel})
                              </span>
                            </div>
                            <p className="text-[10px] text-white/80 font-medium mt-0.5">
                              {grp.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="h-7 w-7 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-lg">
                              <Check width={16} height={16} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-white/20 border border-white/40" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 flex items-center gap-2 text-rose-700 text-xs font-bold shadow-2xs">
              <AlertCircle width={16} height={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* ── FOOTER SUBMIT BUTTON ── */}
        <div className="flex-shrink-0 px-5 pb-6 pt-3 relative z-20 bg-slate-50/90 backdrop-blur-md border-t border-slate-200/60">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full rounded-2xl py-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white text-sm font-black shadow-[0_12px_28px_rgba(13,148,136,0.35)] active:scale-[0.98] hover:shadow-xl transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 width={18} height={18} className="animate-spin" />
                <span>প্রোফাইল তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>ড্যাশবোর্ডে প্রবেশ করি</span>
                <ChevronRight width={18} height={18} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}