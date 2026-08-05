"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/layout/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActionsDock from "@/components/dashboard/QuickActionsDock";
import DailyMissionsCard from "@/components/dashboard/DailyMissionsCard";
import ContinueLearningSection from "@/components/dashboard/ContinueLearningSection";
import BannerCarousel from "@/components/dashboard/BannerCarousel";
import SubjectGridSection, { SubjectItem } from "@/components/dashboard/SubjectGridSection";
import { getSubjects } from "@/lib/firestore/subjects";
import { getStudentProfile } from "@/lib/firestore/student";
import { getActiveBanners, BannerSlide } from "@/lib/firestore/banners";
import { getUserResults } from "@/lib/firestore/results";
import { Student } from "@/types/firestore";

const defaultPalette = [
  { color: "#0D9488", gradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #047857 100%)", shadowColor: "rgba(13, 148, 136, 0.4)" },
  { color: "#F43F5E", gradient: "linear-gradient(135deg, #E11D48 0%, #F43F5E 50%, #BE123C 100%)", shadowColor: "rgba(244, 63, 94, 0.4)" },
  { color: "#6366F1", gradient: "linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #3730A3 100%)", shadowColor: "rgba(99, 102, 241, 0.4)" },
  { color: "#D97706", gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #B45309 100%)", shadowColor: "rgba(245, 158, 11, 0.4)" },
  { color: "#0284C7", gradient: "linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #075985 100%)", shadowColor: "rgba(2, 132, 199, 0.4)" },
  { color: "#DB2777", gradient: "linear-gradient(135deg, #BE185D 0%, #DB2777 50%, #9D174D 100%)", shadowColor: "rgba(219, 39, 119, 0.4)" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("qm_cached_dashboard_subjects");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isSubjectsLoading, setIsSubjectsLoading] = useState<boolean>(() => subjectsList.length === 0);
  const [student, setStudent] = useState<Student | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [bannerList, setBannerList] = useState<BannerSlide[]>([]);
  const [greeting, setGreeting] = useState("শুভ দিন");
  const [greetingEmoji, setGreetingEmoji] = useState("✨");
  const [userResultsList, setUserResultsList] = useState<any[]>([]);

  useEffect(() => {
    const userEmail = session?.user?.email?.toLowerCase() || null;
    const userAvatarKey = userEmail ? `qm_avatar_${userEmail}` : null;

    if (userAvatarKey) {
      const cachedAvatar = localStorage.getItem(userAvatarKey);
      if (cachedAvatar) setUserAvatar(cachedAvatar);
      else setUserAvatar(null);
    } else {
      setUserAvatar(null);
    }

    const handleAvatarUpdate = () => {
      if (userAvatarKey) {
        const updated = localStorage.getItem(userAvatarKey);
        setUserAvatar(updated || null);
      }
    };

    const handleSubjectsUpdate = () => {
      loadData();
    };

    window.addEventListener("qm_avatar_updated", handleAvatarUpdate);
    window.addEventListener("qm_subjects_updated", handleSubjectsUpdate);
    window.addEventListener("storage", handleAvatarUpdate);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) { setGreeting("শুভ সকাল"); setGreetingEmoji("☀️"); }
    else if (hour >= 12 && hour < 17) { setGreeting("শুভ দুপুর"); setGreetingEmoji("🌤️"); }
    else if (hour >= 17 && hour < 20) { setGreeting("শুভ সন্ধ্যা"); setGreetingEmoji("🌅"); }
    else { setGreeting("শুভ রাত্রি"); setGreetingEmoji("🌙"); }

    async function loadData() {
      const avatarKey = session?.user?.email ? `qm_avatar_${session.user.email.toLowerCase()}` : null;
      try {
        let currentStudentProfile: any = null;
        try {
          const pRes = await fetch("/api/profile");
          const pData = await pRes.json();
          if (pRes.ok && pData.student) {
            currentStudentProfile = pData.student;
            setStudent(pData.student);
            if (pData.student.avatarUrl && avatarKey) {
              setUserAvatar(pData.student.avatarUrl);
              localStorage.setItem(avatarKey, pData.student.avatarUrl);
            } else if (!pData.student.avatarUrl) {
              if (avatarKey) localStorage.removeItem(avatarKey);
              setUserAvatar(null);
            }
          }
        } catch {}

        if (currentStudentProfile && currentStudentProfile.profileComplete === false) {
          router.replace("/onboarding");
          return;
        }

        if (!currentStudentProfile && session?.user?.email) {
          currentStudentProfile = await getStudentProfile(session.user.email);
          if (currentStudentProfile) {
            setStudent(currentStudentProfile);
            if (currentStudentProfile.avatarUrl && avatarKey) {
              setUserAvatar(currentStudentProfile.avatarUrl);
              localStorage.setItem(avatarKey, currentStudentProfile.avatarUrl);
            } else if (!currentStudentProfile.avatarUrl) {
              if (avatarKey) localStorage.removeItem(avatarKey);
              setUserAvatar(null);
            }
          }
        }

        const activeBanners = await getActiveBanners();
        setBannerList(activeBanners || []);

        let localImages: Record<string, string> = {};
        try {
          const cached = localStorage.getItem("quiz_mate_subject_images");
          if (cached) localImages = JSON.parse(cached);
        } catch (e) {}

        const targetClassId = currentStudentProfile?.classId || "class6";
        const targetGroup = currentStudentProfile?.group || "all";

        const [firestoreSubjects, userResults] = await Promise.all([
          getSubjects(targetClassId, targetGroup),
          userEmail ? getUserResults(userEmail) : Promise.resolve([]),
        ]);

        setUserResultsList(userResults || []);

        if (firestoreSubjects && firestoreSubjects.length > 0) {
          const mapped: SubjectItem[] = firestoreSubjects.map((s, idx) => {
            const pal = defaultPalette[idx % defaultPalette.length];
            const img = s.imageUrl || localImages[s.id] || localImages[s.slug];
            const subSlug = (s.slug || s.id).toLowerCase();

            const matchingResults = userResults.filter(
              (r) =>
                r.chapterId &&
                (r.chapterId.toLowerCase().includes(subSlug) || r.chapterId.toLowerCase().includes(s.id.toLowerCase()))
            );

            const subProgress =
              matchingResults.length > 0
                ? Math.round(
                    matchingResults.reduce(
                      (acc, curr) =>
                        acc +
                        (curr.percentage !== undefined
                          ? curr.percentage
                          : Math.round((curr.score / Math.max(1, curr.correct + curr.wrong)) * 100)),
                      0
                    ) / matchingResults.length
                  )
                : 0;

            return {
              id: s.id,
              name: s.name,
              slug: s.slug || s.id,
              color: s.color || pal.color,
              gradient: s.color ? `linear-gradient(135deg, ${s.color} 0%, #0F766E 100%)` : pal.gradient,
              shadowColor: s.color ? `${s.color}60` : pal.shadowColor,
              progress: subProgress,
              chaptersCount: 0,
              completedChapters: matchingResults.length,
              tagline: s.description || "পাঠ্যবই ও অনুশীলনী",
              imageUrl: img,
            };
          });
          setSubjectsList(mapped);
          try {
            localStorage.setItem("qm_cached_dashboard_subjects", JSON.stringify(mapped));
          } catch (e) {}
        } else {
          setSubjectsList([]);
          try {
            localStorage.removeItem("qm_cached_dashboard_subjects");
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsSubjectsLoading(false);
      }
    }
    loadData();

    return () => {
      window.removeEventListener("qm_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("qm_subjects_updated", handleSubjectsUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, [session]);

  const totalCorrect = userResultsList.reduce((acc, curr) => acc + (curr.correct || 0), 0);

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* Ambient Floating Glow Background Orbs */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* 1. FIXED GLASSMORPHIC TOP HEADER */}
        <DashboardHeader
          student={student}
          sessionUser={session?.user || null}
          userAvatar={userAvatar}
          greeting={greeting}
          greetingEmoji={greetingEmoji}
        />

        {/* ===== SCROLLABLE MAIN CONTENT AREA ===== */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3.5 pb-8 space-y-4.5 no-scrollbar">

          {/* 1. HERO PROMOTIONAL BANNER CAROUSEL */}
          <BannerCarousel slides={bannerList} />

          {/* 2. QUICK ACTIONS SHORTCUT DOCK */}
          <QuickActionsDock />

          {/* 3. CONTINUE LEARNING (ACTIVE SUBJECT FOCUS) */}
          <ContinueLearningSection subjectsList={subjectsList} />

          {/* 4. CURRICULUM HUB (ALL SUBJECTS GRID) */}
          <SubjectGridSection subjectsList={subjectsList} isLoading={isSubjectsLoading} />

          {/* 5. GAMIFIED DAILY MISSIONS & REWARDS */}
          <DailyMissionsCard
            totalExamsPlayed={student?.totalExam || userResultsList.length}
            correctAnswersCount={totalCorrect}
            userEmail={session?.user?.email}
          />

        </div>
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <BottomNav activeTab="home" />
    </div>
  );
}