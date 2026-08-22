"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/layout/BottomNav";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActionsDock from "@/components/dashboard/QuickActionsDock";
import BannerCarousel from "@/components/dashboard/BannerCarousel";
import SubjectGridSection, { SubjectItem } from "@/components/dashboard/SubjectGridSection";
import { getSubjects } from "@/lib/firestore/subjects";
import { getStudentProfile } from "@/lib/firestore/student";
import { getActiveBanners, BannerSlide } from "@/lib/firestore/banners";
import { getUserResults } from "@/lib/firestore/results";
import { getAllChapters, matchChapterToSubject } from "@/lib/firestore/chapters";
import {
  getDailyMissionsConfig,
  getDailyMissionsSettings,
  DailyMissionConfig,
  DailyMissionsGlobalSettings,
} from "@/lib/firestore/missions";
import { listenToActiveLiveQuiz } from "@/lib/firestore/quizzes";
import { Student, Quiz } from "@/types/firestore";

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
  const [dailyMissionsList, setDailyMissionsList] = useState<DailyMissionConfig[]>([]);
  const [missionsSettings, setMissionsSettings] = useState<DailyMissionsGlobalSettings | null>(null);
  const [liveQuiz, setLiveQuiz] = useState<Quiz | null>(null);

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

    const handlePointsUpdated = (e: any) => {
      if (e.detail?.newPoints !== undefined) {
        setStudent((prev) => {
          if (!prev) return prev;
          const newPts = e.detail.newPoints;
          return {
            ...prev,
            point: newPts,
            level: Math.floor(newPts / 100) + 1,
          };
        });
      } else {
        loadData();
      }
    };

    window.addEventListener("qm_avatar_updated", handleAvatarUpdate);
    window.addEventListener("qm_subjects_updated", handleSubjectsUpdate);
    window.addEventListener("qm_points_updated", handlePointsUpdated);
    window.addEventListener("qm_profile_updated", handleSubjectsUpdate);
    window.addEventListener("storage", handleAvatarUpdate);

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) { setGreeting("শুভ সকাল"); setGreetingEmoji("☀️"); }
    else if (hour >= 12 && hour < 17) { setGreeting("শুভ দুপুর"); setGreetingEmoji("🌤️"); }
    else if (hour >= 17 && hour < 20) { setGreeting("শুভ সন্ধ্যা"); setGreetingEmoji("🌅"); }
    else { setGreeting("শুভ রাত্রি"); setGreetingEmoji("🌙"); }

    async function loadData() {
      const avatarKey = session?.user?.email ? `qm_avatar_${session.user.email.toLowerCase()}` : null;
      try {
        // Parallelize queries (profile, banners, results, chapters, missions) for maximum speed
        const [
          profileRes,
          activeBanners,
          userResults,
          allChapters,
          missionsConfig,
          missionSettingsRes,
        ] = await Promise.all([
          fetch("/api/profile").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          getActiveBanners().catch(() => []),
          userEmail ? getUserResults(userEmail).catch(() => []) : Promise.resolve([]),
          getAllChapters().catch(() => []),
          getDailyMissionsConfig().catch(() => []),
          getDailyMissionsSettings().catch(() => null),
        ]);

        let currentStudentProfile = profileRes?.student || null;

        // Fallback to direct student profile if api/profile returned empty
        if (!currentStudentProfile && session?.user?.email) {
          currentStudentProfile = await getStudentProfile(session.user.email).catch(() => null);
        }

        if (currentStudentProfile) {
          setStudent(currentStudentProfile);
          if (currentStudentProfile.avatarUrl && avatarKey) {
            setUserAvatar(currentStudentProfile.avatarUrl);
            try { localStorage.setItem(avatarKey, currentStudentProfile.avatarUrl); } catch (e) {}
          } else if (!currentStudentProfile.avatarUrl && avatarKey) {
            try { localStorage.removeItem(avatarKey); } catch (e) {}
            setUserAvatar(null);
          }

          // Only redirect to onboarding if user is truly brand new and has not configured their class
          const isBrandNewUser =
            currentStudentProfile.profileComplete === false &&
            !currentStudentProfile.classId &&
            !currentStudentProfile.totalExam;

          if (isBrandNewUser) {
            router.replace("/onboarding");
            return;
          }
        }

        setBannerList(activeBanners || []);
        setUserResultsList(userResults || []);
        if (missionsConfig && missionsConfig.length > 0) setDailyMissionsList(missionsConfig);
        if (missionSettingsRes) setMissionsSettings(missionSettingsRes);

        let localImages: Record<string, string> = {};
        try {
          const cached = localStorage.getItem("quiz_mate_subject_images");
          if (cached) localImages = JSON.parse(cached);
        } catch (e) {}

        const targetClassId = currentStudentProfile?.classId || "class6";
        const targetGroup = currentStudentProfile?.group || "all";

        const firestoreSubjects = await getSubjects(targetClassId, targetGroup).catch(() => []);

        if (firestoreSubjects && firestoreSubjects.length > 0) {
          const mapped: SubjectItem[] = firestoreSubjects.map((s, idx) => {
            const pal = defaultPalette[idx % defaultPalette.length];
            const img = s.imageUrl || localImages[s.id] || localImages[s.slug];
            const subSlug = (s.slug || s.id).toLowerCase();
            const subId = s.id.toLowerCase();

            // Find all chapters matching this subject
            const subjectChapters = allChapters.filter((ch) => matchChapterToSubject(ch, s));
            const totalChaptersCount = subjectChapters.length;

            // Results matching this subject
            const matchingResults = userResults.filter(
              (r) =>
                r.chapterId &&
                (r.chapterId.toLowerCase().includes(subSlug) ||
                  r.chapterId.toLowerCase().includes(subId) ||
                  subjectChapters.some((ch) => ch.id.toLowerCase() === r.chapterId?.toLowerCase()))
            );

            // Count completed chapters for this subject
            let completedChaptersCount = 0;
            if (totalChaptersCount > 0) {
              completedChaptersCount = subjectChapters.filter((ch) => {
                const chIdLower = ch.id.toLowerCase();
                return userResults.some((r) => {
                  if (!r.chapterId) return false;
                  const rChLower = r.chapterId.toLowerCase();
                  return (
                    rChLower === chIdLower ||
                    rChLower.includes(chIdLower) ||
                    chIdLower.includes(rChLower)
                  );
                });
              }).length;
            } else {
              const uniqueChIds = new Set(matchingResults.map((r) => r.chapterId?.toLowerCase()).filter(Boolean));
              completedChaptersCount = uniqueChIds.size;
            }

            // Calculate progress percentage
            let subProgress = 0;
            if (totalChaptersCount > 0) {
              subProgress = Math.round((completedChaptersCount / totalChaptersCount) * 100);
            } else if (matchingResults.length > 0) {
              subProgress = Math.round(
                matchingResults.reduce(
                  (acc, curr) =>
                    acc +
                    (curr.percentage !== undefined
                      ? curr.percentage
                      : Math.round((curr.score / Math.max(1, curr.correct + curr.wrong)) * 100)),
                  0
                ) / matchingResults.length
              );
            }

            return {
              id: s.id,
              name: s.name,
              slug: s.slug || s.id,
              color: s.color || pal.color,
              gradient: s.color ? `linear-gradient(135deg, ${s.color} 0%, #0F766E 100%)` : pal.gradient,
              shadowColor: s.color ? `${s.color}60` : pal.shadowColor,
              progress: subProgress,
              chaptersCount: totalChaptersCount,
              completedChapters: completedChaptersCount,
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
      window.removeEventListener("qm_points_updated", handlePointsUpdated);
      window.removeEventListener("qm_profile_updated", handleSubjectsUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, [session, router]);

  // Real-time listener for active live quizzes matching student's class
  useEffect(() => {
    const unsub = listenToActiveLiveQuiz(student?.classId, (quiz) => {
      setLiveQuiz(quiz);
    });
    return () => unsub();
  }, [student?.classId]);

  // Today's results calculation for dynamic Daily Missions & Target
  const todayDateString = new Date().toDateString();
  const todayResults = userResultsList.filter((r) => {
    if (!r.createdAt) return false;
    const itemDate = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
    return itemDate.toDateString() === todayDateString;
  });

  const todayExamsPlayed = todayResults.length;
  const todayCorrectAnswers = todayResults.reduce((acc, curr) => acc + (curr.correct || 0), 0);
  const todayHighestScore = todayResults.reduce((max, curr) => Math.max(max, curr.percentage || 0), 0);

  const handlePointsClaimed = (newPoints: number, newLevel: number) => {
    setStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        point: newPoints,
        level: newLevel,
      };
    });
  };

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

          {/* 1. QUICK ACTIONS SHORTCUT DOCK (Includes Live Quiz Trigger & Popup & Missions Modal) */}
          <QuickActionsDock
            liveQuiz={liveQuiz}
            missionData={{
              missions: dailyMissionsList,
              todayExamsPlayed,
              todayCorrectAnswers,
              todayHighestScore,
              userEmail: session?.user?.email,
              onPointsClaimed: handlePointsClaimed,
              masterBonusXP: missionsSettings?.allClearBonusXP,
            }}
          />

          {/* 2. HERO PROMOTIONAL BANNER CAROUSEL */}
          <BannerCarousel slides={bannerList} />

          {/* 3. CURRICULUM HUB (ALL SUBJECTS GRID WITH INTEGRATED PROGRESS BARS) */}
          <SubjectGridSection subjectsList={subjectsList} isLoading={isSubjectsLoading} />

          {/* Daily Missions are now accessible via the Mission button in QuickActionsDock */}

        </div>
      </div>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <BottomNav activeTab="home" />
    </div>
  );
}