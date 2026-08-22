"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Building2,
  GraduationCap,
  FlaskConical,
  Landmark,
  BookOpen,
  Crown,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  ShieldCheck,
  Eye,
  LucideIcon,
  Compass,
} from "lucide-react";

/* ── Bangladesh Division & District Data ─────────────────── */
const DIVISION_DISTRICTS: Record<string, string[]> = {
  "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "নরসিংদী", "ফরিদপুর", "মানিকগঞ্জ", "মুন্সীগঞ্জ", "রাজবাড়ী", "মাদারীপুর", "গোপালগঞ্জ", "শরীয়তপুর", "কিশোরগঞ্জ"],
  "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ফেনী", "নোয়াখালী", "লক্ষ্মীপুর", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "খাগড়াছড়ি", "রাঙ্গামাটি", "বান্দরবান"],
  "রাজশাহী": ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নওগাঁ", "নাটোর", "চাপাইনবাবগঞ্জ", "জয়পুরহাট"],
  "খুলনা": ["খুলনা", "যশোর", "কুষ্টিয়া", "সাতক্ষীরা", "বাগেরহাট", "ঝিনাইদহ", "চুয়াডাঙ্গা", "মেহেরপুর", "নড়াইল", "মাগুরা"],
  "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"],
  "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  "রংপুর": ["রংপুর", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "লালমনিরহাট"],
  "ময়মনসিংহ": ["ময়মনসিংহ", "জামালপুর", "নেত্রকোণা", "শেরপুর"],
};

const DIVISIONS = Object.keys(DIVISION_DISTRICTS);

/* ── Class Options ────────────────────────────────────────── */
type ClassOption = {
  id: string;
  name: string;
  code: string;
  hasGroups: boolean;
  icon: LucideIcon;
  subTitle: string;
  color: string;
};

const CLASSES: ClassOption[] = [
  { id: "class6", name: "ষষ্ঠ শ্রেণী", code: "Class 6", hasGroups: false, icon: BookOpen, subTitle: "সকল বিষয় ও মৌলিক প্রশ্নাবলী", color: "#0D9488" },
  { id: "class7", name: "সপ্তম শ্রেণী", code: "Class 7", hasGroups: false, icon: Calculator, subTitle: "উন্নত পাঠ্যবই ও মেধা পরীক্ষা", color: "#4F46E5" },
  { id: "class8", name: "অষ্টম শ্রেণী", code: "Class 8", hasGroups: false, icon: FlaskConical, subTitle: "জেএসসি প্রস্তুতি ও অধ্যায় কুইজ", color: "#D97706" },
  { id: "class9", name: "নবম শ্রেণী", code: "Class 9 (SSC)", hasGroups: true, icon: GraduationCap, subTitle: "এসএসসি স্পেশাল ও ৩টি গ্রুপ", color: "#E11D48" },
  { id: "class10", name: "দশম শ্রেণী", code: "Class 10 (SSC)", hasGroups: true, icon: GraduationCap, subTitle: "এসএসসি ফাইনাল প্রস্তুতি", color: "#DC2626" },
  { id: "class11", name: "একাদশ শ্রেণী", code: "Class 11 (HSC)", hasGroups: true, icon: Crown, subTitle: "এইচএসসি ফাউন্ডেশন ও গ্রুপ ভিত্তিক পাঠ", color: "#8B5CF6" },
  { id: "class12", name: "দ্বাদশ শ্রেণী", code: "Class 12 (HSC)", hasGroups: true, icon: Crown, subTitle: "এইচএসসি পরীক্ষা ও বোর্ড প্রশ্ন সমাধান", color: "#7C3AED" },
];

/* ── Group Options ────────────────────────────────────────── */
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
    desc: "বাংলাদেশ ও বিশ্বপরিচয়, ইতিহাস, অর্থনীতি, পৌরনীতি",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
    color: "#6366F1",
  },
];

/* ── Motion Variants ──────────────────────────────────────── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Current Step state (1: Personal, 2: Class, 3: Group, 4: Complete Summary)
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form Fields
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("class9");
  const [selectedGroup, setSelectedGroup] = useState<string>("science");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check preview mode & existing profile completion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("preview") === "true") {
        setTimeout(() => setIsPreview(true), 0);
      }
    }
  }, []);

  useEffect(() => {
    if (!isPreview && status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router, isPreview]);

  useEffect(() => {
    async function initProfileCheck() {
      try {
        if (!isPreview) {
          const res = await fetch("/api/student-data");
          if (res.ok) {
            const { student } = await res.json();
            if (student) {
              if (
                student.profileComplete === true ||
                (student.classId && student.profileComplete !== false) ||
                student.totalExam > 0
              ) {
                router.replace("/dashboard");
                return;
              }
              if (student.name) setName(student.name);
              if (student.division) setDivision(student.division);
              if (student.district) setDistrict(student.district);
              if (student.upazila) setUpazila(student.upazila);
              if (student.classId) setSelectedClassId(student.classId);
              if (student.group) setSelectedGroup(student.group);
            }
          }
        }
      } catch (err) {
        console.error("Error loading student profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isPreview || status === "authenticated") {
      if (session?.user?.name && !name) {
        setName(session.user.name);
      }
      initProfileCheck();
    }
  }, [status, session, router, isPreview]);

  // Selected Class configuration
  const currentClassObj = CLASSES.find((c) => c.id === selectedClassId) || CLASSES[3];
  const requiresGroup = currentClassObj.hasGroups;

  // Maximum Steps depending on whether group selection is required
  const totalSteps = requiresGroup ? 3 : 2;

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError("অনুগ্রহ করে আপনার নাম প্রদান করুন");
        return;
      }
      if (!division) {
        setError("অনুগ্রহ করে আপনার বিভাগ নির্বাচন করুন");
        return;
      }
      if (!district) {
        setError("অনুগ্রহ করে আপনার জেলা নির্বাচন করুন");
        return;
      }
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      if (!selectedClassId) {
        setError("অনুগ্রহ করে আপনার শ্রেণী নির্বাচন করুন");
        return;
      }
      if (requiresGroup) {
        setDirection(1);
        setStep(3);
      } else {
        // Class 6-8 doesn't need group, submit directly!
        handleFinalSubmit();
      }
    } else if (step === 3) {
      if (!selectedGroup) {
        setError("অনুগ্রহ করে আপনার গ্রুপ নির্বাচন করুন");
        return;
      }
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      division,
      district,
      upazila: upazila.trim(),
      classId: selectedClassId,
      group: requiresGroup ? selectedGroup : "all",
    };

    if (isPreview) {
      setTimeout(() => {
        setDirection(1);
        setStep(4);
        setSubmitting(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch("/api/student-data/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "সেভ করতে সমস্যা হয়েছে");
      }

      setDirection(1);
      setStep(4);
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err instanceof Error ? err.message : "সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isPreview && (status === "loading" || loading)) {
    return (
      <div className="h-screen bg-slate-900 font-sans flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 width={36} height={36} className="text-teal-400 animate-spin" />
        <p className="text-xs font-black tracking-wide text-slate-300">প্রোফাইল সেটআপ লোড হচ্ছে...</p>
      </div>
    );
  }

  const availableDistricts = division ? DIVISION_DISTRICTS[division] || [] : [];

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-950 text-white selection:bg-teal-500 selection:text-white">
      {/* Background Ambient Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "-3s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "-1.5s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">
        
        {/* ── TOP APP BAR & STEP PROGRESS INDICATOR ── */}
        <div className="flex-shrink-0 px-5 pt-4 pb-2 relative z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-400 via-emerald-400 to-indigo-500 p-[2px] shadow-lg">
                <div className="h-full w-full rounded-xl bg-slate-900 flex items-center justify-center">
                  <Zap width={16} height={16} className="text-teal-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-tight leading-none">
                  QuizMate
                </h1>
                <p className="text-[10px] text-teal-400 font-bold leading-none mt-0.5">
                  প্রোফাইল অনবোর্ডিং
                </p>
              </div>
            </div>

            {isPreview ? (
              <div className="flex items-center gap-1 text-[10px] font-black text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                <Eye width={12} height={12} className="text-indigo-400" />
                <span>প্রিভিউ</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full backdrop-blur-md">
                <Flame width={12} height={12} className="fill-amber-400 text-amber-400" />
                <span>+১০০ XP বোনাস</span>
              </div>
            )}
          </div>

          {/* Step Progress Dots Bar */}
          {step <= 3 && (
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2 flex-1 mr-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-teal-400 font-mono">
                  {step}/{totalSteps}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => {
                  if (s === 3 && !requiresGroup) return null;
                  const isActive = step === s;
                  const isDone = step > s;
                  return (
                    <div
                      key={s}
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        isDone
                          ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                          : isActive
                          ? "bg-indigo-500 ring-2 ring-indigo-400/50 scale-110"
                          : "bg-slate-800"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── STEP CONTENT AREA ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-4 no-scrollbar relative">
          <AnimatePresence custom={direction} mode="wait">
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-4"
              >
                {/* Section Title */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/40 rounded-2xl p-4 border border-teal-500/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <User width={16} height={16} />
                    </div>
                    <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">
                      ধাপ ১ • ব্যক্তিগত তথ্য
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white leading-tight">
                    তোমার পরিচয় ও ঠিকানা দাও 📍
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    সঠিক এলাকা নির্বাচন করলে জেলা ও বিভাগভিত্তিক লিডারবোর্ডে অংশ নিতে পারবে।
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <User width={13} height={13} className="text-teal-400" />
                    <span>আপনার পুরো নাম</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: শামীম হোসেন"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                  />
                </div>

                {/* Division Selection */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Compass width={13} height={13} className="text-indigo-400" />
                    <span>বিভাগ নির্বাচন করুন</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIVISIONS.map((div) => {
                      const isSelected = division === div;
                      return (
                        <button
                          type="button"
                          key={div}
                          onClick={() => {
                            setDivision(div);
                            setDistrict("");
                            setError(null);
                          }}
                          className={`py-2 px-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border text-center ${
                            isSelected
                              ? "bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.4)] scale-[1.02]"
                              : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {div}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* District Selection */}
                {division && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[11px] font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <MapPin width={13} height={13} className="text-amber-400" />
                      <span>জেলা নির্বাচন করুন ({division} বিভাগ)</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setError(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                    >
                      <option value="">জেলা বেছে নিন...</option>
                      {availableDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist} জেলা
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* Upazila / Thana Input */}
                {district && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <Building2 width={13} height={13} className="text-emerald-400" />
                      <span>উপজেলা / থানা (ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      placeholder="যেমন: ধানমন্ডি / মিরপুর / পটিয়া"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: CLASS SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-3"
              >
                {/* Section Title */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 rounded-2xl p-4 border border-indigo-500/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <GraduationCap width={16} height={16} />
                    </div>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                      ধাপ ২ • শ্রেণী নির্বাচন
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white leading-tight">
                    তুমি কোন শ্রেণীতে পড়ো? 📚
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    তোমার শ্রেণীর অনুযায়ী সঠিক সিলেবাস ও কুইজ প্রশ্ন প্রস্তুত করা হবে।
                  </p>
                </div>

                {/* Class Options Grid */}
                <div className="space-y-2">
                  {CLASSES.map((cls) => {
                    const isSelected = cls.id === selectedClassId;
                    const Icon = cls.icon;
                    return (
                      <div
                        key={cls.id}
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setError(null);
                        }}
                        className={`rounded-2xl p-3 relative cursor-pointer active:scale-[0.98] transition-all duration-300 border overflow-hidden ${
                          isSelected
                            ? "bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border-teal-500 shadow-[0_4px_20px_rgba(20,184,166,0.3)] ring-1 ring-teal-400"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                              style={{ backgroundColor: `${cls.color}33`, border: `1px solid ${cls.color}66` }}
                            >
                              <Icon width={20} height={20} style={{ color: cls.color }} />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white leading-tight">
                                  {cls.name}
                                </span>
                                <span className="text-[9px] font-mono font-extrabold px-2 py-0.2 rounded-full bg-white/10 text-slate-300">
                                  {cls.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {cls.subTitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="h-7 w-7 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg">
                                <Check width={16} height={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: GROUP SELECTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-3"
              >
                {/* Section Title */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/40 rounded-2xl p-4 border border-amber-500/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Sparkles width={16} height={16} />
                    </div>
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                      ধাপ ৩ • গ্রুপ নির্বাচন ({currentClassObj.name})
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white leading-tight">
                    তোমার অধ্যয়নের গ্রুপ সিলেক্ট করো 🧪
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    গ্রুপ অনুযায়ী উচ্চতর বিষয়সমূহের প্রশ্নাবলী সাজানো থাকবে।
                  </p>
                </div>

                {/* Group Options */}
                <div className="space-y-2.5">
                  {GROUPS.map((grp) => {
                    const isSelected = selectedGroup === grp.id;
                    const Icon = grp.icon;
                    return (
                      <div
                        key={grp.id}
                        onClick={() => {
                          setSelectedGroup(grp.id);
                          setError(null);
                        }}
                        className={`rounded-2xl p-3.5 relative cursor-pointer active:scale-[0.98] transition-all duration-300 border overflow-hidden ${
                          isSelected
                            ? "ring-2 ring-amber-400 border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] scale-[1.01]"
                            : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                        }`}
                        style={{ background: isSelected ? grp.gradient : undefined }}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md flex-shrink-0">
                              <Icon width={22} height={22} className="text-white" />
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-white leading-tight">
                                  {grp.label}
                                </span>
                                <span className="text-[9px] font-extrabold text-white/80">
                                  ({grp.subLabel})
                                </span>
                              </div>
                              <p className="text-[10.5px] text-white/80 font-medium mt-0.5">
                                {grp.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <div className="h-7 w-7 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg">
                                <Check width={16} height={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS SUMMARY CARD */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 py-2"
              >
                {/* Success Celebration Banner */}
                <div className="rounded-3xl p-5 bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 border border-teal-500/30 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />

                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-teal-400 p-[2px] mx-auto mb-3 shadow-xl">
                    <div className="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center">
                      <Trophy width={28} height={28} className="text-amber-400 fill-amber-400 animate-bounce-short" />
                    </div>
                  </div>

                  <h2 className="text-xl font-black text-white leading-tight">
                    অভিনন্দন, {name}! 🎉
                  </h2>
                  <p className="text-xs text-teal-300 font-bold mt-1">
                    তোমার QuizMate অ্যাকাউন্ট পুরোপুরি প্রস্তুত!
                  </p>

                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-black">
                    <Zap width={14} height={14} className="fill-amber-400 text-amber-400" />
                    <span>+১০০ XP অনবোর্ডিং বোনাস যোগ হয়েছে!</span>
                  </div>
                </div>

                {/* Summary Card Details */}
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck width={14} height={14} className="text-teal-400" />
                      প্রোফাইল পাস
                    </span>
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                      VERIFIED STUDENT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9.5px] font-bold text-slate-500 block mb-0.5">শিক্ষার্থী</span>
                      <span className="font-extrabold text-white truncate block">{name}</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9.5px] font-bold text-slate-500 block mb-0.5">শ্রেণী ও গ্রুপ</span>
                      <span className="font-extrabold text-teal-300 truncate block">
                        {currentClassObj.name} {requiresGroup ? `(${selectedGroup.toUpperCase()})` : ""}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 col-span-2">
                      <span className="text-[9.5px] font-bold text-slate-500 block mb-0.5">ঠিকানা / এলাকা</span>
                      <span className="font-extrabold text-white truncate block">
                        {upazila ? `${upazila}, ` : ""}{district} জেলা, {division} বিভাগ
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-rose-300 text-xs font-bold text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </div>

        {/* ── FOOTER NAVIGATION CONTROLS ── */}
        <div className="flex-shrink-0 px-5 pb-6 pt-3 relative z-20 bg-slate-950/90 backdrop-blur-md border-t border-slate-900">
          {step <= 3 ? (
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft width={16} height={16} />
                  <span>পেছনে</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={submitting}
                className="flex-1 rounded-xl py-3.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 text-slate-950 font-black text-xs shadow-[0_8px_20px_rgba(20,184,166,0.3)] active:scale-[0.98] hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 width={16} height={16} className="animate-spin text-slate-950" />
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>{step === totalSteps ? "সেটআপ সম্পন্ন করি" : "পরবর্তী ধাপ"}</span>
                    <ChevronRight width={16} height={16} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.replace("/dashboard")}
              className="w-full rounded-xl py-4 bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 text-slate-950 font-black text-sm shadow-[0_10px_25px_rgba(45,212,191,0.4)] active:scale-[0.98] hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ড্যাশবোর্ডে প্রবেশ করি</span>
              <ChevronRight width={18} height={18} strokeWidth={3} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}