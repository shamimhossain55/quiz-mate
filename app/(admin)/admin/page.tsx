"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ListChecks,
  Trophy,
  Settings,
  LogOut,
  TrendingUp,
  Zap,
  Activity,
  Plus,
  Search,
  ChevronRight,
  BarChart3,
  Circle,
  Flame,
  Star,
  Shield,
  Trash2,
  X,
  CheckCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileCode,
  Edit3,
  HelpCircle,
  Upload,
  Check,
  Layers,
  Menu,
  Crown,
  UserCheck,
  ChevronDown,
  Target,
  Swords,
  Award,
  Gift,
  Clock,
  Play,
  Radio,
  Eye,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Calendar,
  Copy,
} from "lucide-react";

import {
  getAllStudents,
  addStudent,
  updateStudentStatus,
  updateStudentRole,
  deleteStudent,
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getAllQuizzes,
  addQuiz,
  updateQuizDoc,
  toggleQuizLiveStatus,
  deleteQuizDoc,
  getAllClasses,
  getChaptersBySubject,
  getAllChapters,
  addChapter,
  updateChapter,
  deleteChapter,
  getAllQuestions,
  getPaginatedQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addBulkQuestions,
  getAllBanners,
  addBannerDoc,
  updateBannerDoc,
  deleteBannerDoc,
  AdminUser,
  AdminSubject,
  AdminQuiz,
  AdminClass,
  AdminChapter,
  AdminQuestion,
} from "@/lib/firestore/admin";
import { BannerSlide } from "@/lib/firestore/banners";
import {
  DailyMissionConfig,
  DailyMissionsGlobalSettings,
  MissionTargetType,
  DEFAULT_DAILY_MISSIONS,
  DEFAULT_GLOBAL_SETTINGS,
  getDailyMissionsConfig,
  getDailyMissionsSettings,
  saveDailyMissionsSettings,
  addDailyMissionDoc,
  updateDailyMissionDoc,
  deleteDailyMissionDoc,
  resetDefaultDailyMissions,
} from "@/lib/firestore/missions";
import {
  logAdminActivity,
  getAdminActivityLogs,
  AdminActivityLog,
  ACTION_LABELS,
  ENTITY_LABELS,
  ACTION_COLORS,
  ENTITY_COLORS,
  ENTITY_ICONS,
  formatRelativeTime,
  formatFullDateTime,
} from "@/lib/firestore/activity-logs";

// ===== Types =====
type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
};

// Sample JSON Template for bulk upload
const sampleJsonTemplate = `[
  {
    "questionText": "বাংলাদেশের রাজধানী কোনটি?",
    "options": ["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী"],
    "correctAnswer": 0,
    "explanation": "ঢাকা বাংলাদেশের রাজধানী ও বৃহত্তম শহর।"
  },
  {
    "questionText": "২ + ২ = কত?",
    "options": ["৩", "৪", "৫", "৬"],
    "correctAnswer": 1,
    "explanation": "২ এর সাথে ২ যোগ করলে ৪ হয়।"
  }
]`;

// Preset Options for Banner Management
const PRESET_BANNER_ROUTES = [
  { label: "🎯 কুইজ সেটআপ (/quiz/setup)", value: "/quiz/setup" },
  { label: "⚔️ ১v১ ফ্রেন্ড ব্যাটেল (/community)", value: "/community" },
  { label: "🏆 লিডারবোর্ড (/leaderboard)", value: "/leaderboard" },
  { label: "📊 অগ্রগতি ও স্ট্যাটস (/progress)", value: "/progress" },
  { label: "🏠 ড্যাশবোর্ড (/dashboard)", value: "/dashboard" },
  { label: "⚙️ প্রোফাইল ও সেটিংস (/settings)", value: "/settings" },
  { label: "🔗 কাস্টম ইউআরএল (Custom Link)", value: "custom" },
];

const PRESET_BANNER_GRADIENTS = [
  { label: "Teal Oceanic", value: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)" },
  { label: "Purple Nebula", value: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #D946EF 100%)" },
  { label: "Sunset Flame", value: "linear-gradient(135deg, #D97706 0%, #EA580C 50%, #DC2626 100%)" },
  { label: "Emerald Forest", value: "linear-gradient(135deg, #059669 0%, #10B981 50%, #047857 100%)" },
  { label: "Midnight Dark", value: "linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #334155 100%)" },
];

const PRESET_BADGE_TAGS = [
  "NEW FEATURE 🔥",
  "PROMO ⚡",
  "CHALLENGE 🏆",
  "LIVE BATTLE ⚔️",
  "UPDATE 📢",
];

const PRESET_SECTION_TAGS = [
  "গদ্য",
  "কবিতা",
  "উপন্যাস",
  "নাটক",
  "১ম পত্র",
  "২য় পত্র",
  "Grammar",
  "First Paper",
  "Second Paper",
  "Vocabulary",
  "সৃজনশীল (CQ)",
  "এমসিকিউ (MCQ)",
];

// Preset Options for Daily Missions Management
const PRESET_MISSION_METRICS: { label: string; value: MissionTargetType; defaultAction: string; hint: string }[] = [
  { label: "🎯 কুইজ সংখ্যা (Quiz Count)", value: "quiz_count", defaultAction: "কুইজ খেলুন", hint: "আজকে নির্দিষ্ট সংখ্যক কুইজ সম্পন্ন করা" },
  { label: "✨ সঠিক উত্তরের সংখ্যা (Correct Answers)", value: "correct_answers", defaultAction: "অনুশীলন করুন", hint: "আজকের কুইজে নির্দিষ্ট সংখ্যক প্রশ্নের সঠিক উত্তর দেওয়া" },
  { label: "🏆 নূন্যতম স্কোর শতকরা হার (Min Score %)", value: "min_score_percent", defaultAction: "চ্যালেঞ্জ নিন", hint: "যেকোনো কুইজে নূন্যতম ৮০% বা ১০০% স্কোর অর্জন" },
  { label: "⚔️ ব্যাটেল / ম্যাচ সংখ্যা (Battle Count)", value: "battle_count", defaultAction: "ব্যাটেল খেলুন", hint: "১v১ বা মাল্টিপ্লেয়ার ব্যাটেলে অংশগ্রহণ করা" },
];

const PRESET_MISSION_ICONS = [
  { label: "🎯 টার্গেট (Target)", value: "Target" },
  { label: "✨ স্পার্কল (Sparkles)", value: "Sparkles" },
  { label: "🏆 ট্রফি (Trophy)", value: "Trophy" },
  { label: "⚔️ ব্যাটেল সোর্ড (Swords)", value: "Swords" },
  { label: "⚡ বাজ / এক্সপি (Zap)", value: "Zap" },
  { label: "🔥 স্ট্রিক ফ্লেম (Flame)", value: "Flame" },
  { label: "🎁 গিফট বক্স (Gift)", value: "Gift" },
  { label: "🎖️ অ্যাওয়ার্ড (Award)", value: "Award" },
  { label: "📖 বই ও পাঠ্য (BookOpen)", value: "BookOpen" },
];

const PRESET_MISSION_THEMES = [
  { label: "Ocean Teal (সবুজ নীল)", color: "#0F766E", bg: "bg-teal-50 border-teal-200/80 text-teal-700" },
  { label: "Amber Gold (স্বর্ণালী)", color: "#D97706", bg: "bg-amber-50 border-amber-200/80 text-amber-700" },
  { label: "Indigo Purple (নীল বেগুনি)", color: "#6366F1", bg: "bg-indigo-50 border-indigo-200/80 text-indigo-700" },
  { label: "Rose Pink (গোলাপী)", color: "#E11D48", bg: "bg-rose-50 border-rose-200/80 text-rose-700" },
  { label: "Emerald Green (গাঢ় সবুজ)", color: "#059669", bg: "bg-emerald-50 border-emerald-200/80 text-emerald-700" },
  { label: "Violet Royal (রয়েল ভায়োলেট)", color: "#7C3AED", bg: "bg-purple-50 border-purple-200/80 text-purple-700" },
];

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // RBAC & Role Management State
  const [currentUserRole, setCurrentUserRole] = useState<
    "super_admin" | "admin" | "moderator" | "content_creator"
  >("super_admin");
  const [currentAdminInfo, setCurrentAdminInfo] = useState<{
    uid: string;
    email: string;
    name: string;
  }>({ uid: "", email: "", name: "অ্যাডমিন" });

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityAdminFilter, setActivityAdminFilter] = useState<string>("all");
  const [activityEntityFilter, setActivityEntityFilter] = useState<string>("all");
  const [activityActionFilter, setActivityActionFilter] = useState<string>("all");
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>("");
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "super_admin" | "admin" | "moderator" | "content_creator" | "user"
  >("user");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Firestore Data State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [banners, setBanners] = useState<BannerSlide[]>([]);

  // Daily Missions Management State
  const [missions, setMissions] = useState<DailyMissionConfig[]>([]);
  const [missionSettings, setMissionSettings] = useState<DailyMissionsGlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [isAddMissionOpen, setIsAddMissionOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<DailyMissionConfig | null>(null);
  const [newMission, setNewMission] = useState<Omit<DailyMissionConfig, "id">>({
    title: "",
    desc: "",
    targetType: "quiz_count",
    target: 1,
    rewardXP: 50,
    icon: "Target",
    color: "#0F766E",
    bg: "bg-teal-50 border-teal-200/80 text-teal-700",
    actionText: "কুইজ খেলুন",
    active: true,
    order: 1,
  });

  // Modals & Toast State
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<AdminQuiz | null>(null);
  const [viewingQuizQuestions, setViewingQuizQuestions] = useState<AdminQuiz | null>(null);
  const [quizClassFilter, setQuizClassFilter] = useState<string>("all");
  const [quizStatusFilter, setQuizStatusFilter] = useState<string>("all");
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [selectedBannerRoutePreset, setSelectedBannerRoutePreset] = useState<string>("/quiz/setup");
  const [customBannerRouteUrl, setCustomBannerRouteUrl] = useState<string>("");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(null);
  const [selectedSubjectClassFilter, setSelectedSubjectClassFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chapter Management State
  const [allChapters, setAllChapters] = useState<AdminChapter[]>([]);
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [chapterClassFilter, setChapterClassFilter] = useState<string>("all");
  const [chapterSubjectFilter, setChapterSubjectFilter] = useState<string>("all");
  const [newChapter, setNewChapter] = useState({ name: "", subjectId: "", chapterNo: 1, sectionName: "" });

  // Form Cascading Select States for Quiz Creation
  const [selectedClassId, setSelectedClassId] = useState("class6");
  const [selectedSubjectId, setSelectedSubjectId] = useState("bangla");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const [quizForm, setQuizForm] = useState<{
    title: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    duration: number;
    status: "live" | "scheduled" | "published" | "draft" | "completed";
    negativeMarking: boolean;
    startTime: string;
    endTime: string;
    jsonInput: string;
    jsonError: string | null;
    parsedQuestions: Array<{
      id?: string;
      questionText: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
  }>({
    title: "",
    classId: "class6",
    subjectId: "",
    chapterId: "",
    duration: 15,
    status: "published",
    negativeMarking: false,
    startTime: "",
    endTime: "",
    jsonInput: "",
    jsonError: null,
    parsedQuestions: [],
  });

  const [newQuiz, setNewQuiz] = useState({ name: "", questionsCount: 10, status: "published" as const });
  const [newSubject, setNewSubject] = useState({ name: "", slug: "", classId: "class6", group: "all", color: "#0D9488", imageUrl: "", sectionsText: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", class: "ক্লাস ৯" });
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    badge: "NEW FEATURE 🔥",
    ctaText: "কুইজ শুরু করুন 🚀",
    linkUrl: "/quiz/setup",
    imageUrl: "",
    bgGradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
  });

  // Bulk JSON State
  const [bulkJsonInput, setBulkJsonInput] = useState(sampleJsonTemplate);
  const [bulkMeta, setBulkMeta] = useState({ classId: "class6", subjectId: "bangla", chapterId: "", quizId: "" });

  // Question Bank Filter & Add States
  const [questionClassFilter, setQuestionClassFilter] = useState<string>("all");
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState<string>("all");
  const [questionChapterFilter, setQuestionChapterFilter] = useState<string>("all");

  // Filtered Subjects for Question Bank
  const questionBankAvailableSubjects = useMemo(() => {
    if (questionClassFilter === "all") return subjects;
    return subjects.filter((s) => s.classId === questionClassFilter);
  }, [subjects, questionClassFilter]);

  // Strict & Deduplicated Filtered Chapters for Question Bank
  const questionBankAvailableChapters = useMemo(() => {
    let list: AdminChapter[] = [];

    if (questionSubjectFilter !== "all") {
      const selSub = subjects.find((s) => s.id === questionSubjectFilter);
      const selSubId = (questionSubjectFilter || "").toLowerCase().trim();
      const selSlug = (selSub?.slug || "").toLowerCase().trim();

      list = allChapters.filter((c) => {
        const chSub = (c.subjectId || "").toLowerCase().trim();
        if (!chSub) return false;
        if (chSub === selSubId) return true;
        if (selSlug && chSub === selSlug) return true;
        if (selSub && (c.subjectId === selSub.id || (selSub.slug && c.subjectId === selSub.slug))) return true;
        return false;
      });
    } else if (questionClassFilter !== "all") {
      const classSubjects = subjects.filter((s) => s.classId === questionClassFilter);
      const validSubIds = new Set(
        classSubjects.flatMap((s) => [s.id?.toLowerCase().trim(), s.slug?.toLowerCase().trim()].filter(Boolean))
      );
      list = allChapters.filter((c) => {
        const chSub = (c.subjectId || "").toLowerCase().trim();
        return chSub && validSubIds.has(chSub);
      });
    } else {
      list = allChapters;
    }

    // Deduplicate by ID and unique (chapterNo + name) to never show duplicate entries
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const deduped: AdminChapter[] = [];

    for (const ch of list) {
      if (!ch.id || seenIds.has(ch.id)) continue;
      const key = `${ch.chapterNo}_${(ch.name || "").trim().toLowerCase()}`;
      if (seenKeys.has(key)) continue;
      seenIds.add(ch.id);
      seenKeys.add(key);
      deduped.push(ch);
    }

    return deduped.sort(
      (a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0)
    );
  }, [allChapters, subjects, questionSubjectFilter, questionClassFilter]);

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    classId: "class6",
    subjectId: "",
    chapterId: "",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  });

  // Question Bank Pagination & Filtering State
  const [lastQuestionDocId, setLastQuestionDocId] = useState<string | null>(null);
  const [hasMoreQuestions, setHasMoreQuestions] = useState<boolean>(true);
  const [loadingMoreQuestions, setLoadingMoreQuestions] = useState<boolean>(false);
  const [isFilteredMode, setIsFilteredMode] = useState<boolean>(false);

  // Fetch questions from Firestore with 20 items per page and active filters
  const fetchFilteredQuestions = async (filters: { classId?: string; subjectId?: string; chapterId?: string }) => {
    setQuestionsLoading(true);
    try {
      const res = await getPaginatedQuestions(20, null, filters);
      setQuestions(res.questions);
      setLastQuestionDocId(res.lastDocId);
      setHasMoreQuestions(res.hasMore);
      if (res.questions.length > 0) {
        showToast(`${res.questions.length}টি প্রশ্ন লোড হয়েছে 📄`);
      } else {
        showToast("কোনো প্রশ্ন পাওয়া যায়নি");
      }
    } catch {
      showToast("প্রশ্ন লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleLoadMoreQuestions = async () => {
    if (loadingMoreQuestions || !hasMoreQuestions) return;
    setLoadingMoreQuestions(true);
    try {
      const currentFilters = {
        classId: questionClassFilter,
        subjectId: questionSubjectFilter,
        chapterId: questionChapterFilter,
      };
      const res = await getPaginatedQuestions(20, lastQuestionDocId, currentFilters);
      if (res.questions.length > 0) {
        setQuestions((prev) => [...prev, ...res.questions]);
        setLastQuestionDocId(res.lastDocId);
        setHasMoreQuestions(res.hasMore);
        showToast(`${res.questions.length}টি পরবর্তী প্রশ্ন লোড হয়েছে! 📄`);
      } else {
        setHasMoreQuestions(false);
        showToast("আর কোনো প্রশ্ন নেই");
      }
    } catch (e) {
      showToast("পরবর্তী প্রশ্ন লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoadingMoreQuestions(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  const fetchActivityLogs = async () => {
    setActivityLoading(true);
    try {
      const logs = await getAdminActivityLogs(50);
      setActivityLogs(logs);
    } catch (e) {
      console.error("Failed to load activity logs", e);
    } finally {
      setActivityLoading(false);
    }
  };

  const logAction = (
    action: Parameters<typeof logAdminActivity>[0]["action"],
    entityType: Parameters<typeof logAdminActivity>[0]["entityType"],
    entityName: string,
    details?: string
  ) => {
    const newLogItem = {
      adminId: currentAdminInfo.uid || "unknown",
      adminName: currentAdminInfo.name || "অ্যাডমিন",
      adminEmail: currentAdminInfo.email || "",
      adminRole: currentUserRole,
      action,
      entityType,
      entityName,
      details,
    };
    logAdminActivity(newLogItem);
    setActivityLogs((prev) => [
      {
        id: "temp_" + Date.now(),
        ...newLogItem,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  // Load Real Data & Admin Session from Firestore on Mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role) {
            setCurrentUserRole(data.user.role);
          }
          if (data.user?.uid) {
            setCurrentAdminInfo({
              uid: data.user.uid,
              email: data.user.email || "",
              name: data.user.email?.split("@")[0] || "অ্যাডমিন",
            });
          }
        }
      } catch (e) {
        console.error("Failed to load admin session role", e);
      }
    }

    async function loadData() {
      setLoading(true);
      try {
        // Optimized: Only load essential dashboard data on mount (avoid downloading whole DB)
        const [
          firestoreClasses,
          firestoreSubjects,
          firestoreQuizzes,
          firestoreBanners,
          firestoreMissions,
          firestoreMissionSettings,
        ] = await Promise.all([
          getAllClasses(),
          getAllSubjects(),
          getAllQuizzes(),
          getAllBanners(),
          getDailyMissionsConfig().catch(() => DEFAULT_DAILY_MISSIONS),
          getDailyMissionsSettings().catch(() => DEFAULT_GLOBAL_SETTINGS),
        ]);

        setClasses(firestoreClasses);
        setSubjects(firestoreSubjects);
        setQuizzes(firestoreQuizzes);
        setBanners(firestoreBanners);
        setMissions(firestoreMissions);
        setMissionSettings(firestoreMissionSettings);
      } catch (err) {
        console.error("Error loading Firestore admin data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
    loadData();
  }, []);

  // Lazy tab loading: fetch large collections (questions, users, logs, chapters) ONLY when tab is selected
  useEffect(() => {
    if (activeNav === "questions") {
      if (questions.length === 0 && !questionsLoading) {
        setQuestionsLoading(true);
        getPaginatedQuestions(20)
          .then((res) => {
            setQuestions(res.questions);
            setLastQuestionDocId(res.lastDocId);
            setHasMoreQuestions(res.hasMore);
          })
          .catch(() => {})
          .finally(() => setQuestionsLoading(false));
      }
      if (allChapters.length === 0 && !chaptersLoading) {
        setChaptersLoading(true);
        getAllChapters(true)
          .then((chs) => setAllChapters(chs))
          .catch(() => {})
          .finally(() => setChaptersLoading(false));
      }
    } else if (activeNav === "users" && users.length === 0 && !usersLoading) {
      setUsersLoading(true);
      getAllStudents()
        .then((u) => setUsers(u))
        .catch(() => {})
        .finally(() => setUsersLoading(false));
    } else if (activeNav === "subjects" && allChapters.length === 0 && !chaptersLoading) {
      setChaptersLoading(true);
      getAllChapters()
        .then((chs) => setAllChapters(chs))
        .catch(() => {})
        .finally(() => setChaptersLoading(false));
    } else if (activeNav === "activity" && activityLogs.length === 0 && !activityLoading) {
      fetchActivityLogs();
    }
  }, [activeNav, questions.length, users.length, allChapters.length, activityLogs.length, questionsLoading, usersLoading, chaptersLoading, activityLoading]);

  const handleUpdateRole = async (
    userId: string,
    newRole: "super_admin" | "admin" | "moderator" | "content_creator" | "user"
  ) => {
    try {
      const targetUser = users.find((u) => u.id === userId);
      await updateStudentRole(userId, newRole, targetUser?.email);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      logAction("role_change", "user", targetUser?.name || userId, `নতুন রোল: ${newRole}`);
      showToast(`ইউজার রোল পরিবর্তন করা হয়েছে: ${newRole.toUpperCase()} 🛡️`);
      setRoleModalUser(null);
    } catch (err: any) {
      showToast(`ত্রুটি: ${err.message || "রোল পরিবর্তন করা যায়নি"}`);
    }
  };

  // Update chapters when subject selected in dropdowns
  useEffect(() => {
    async function loadChapters() {
      if (!selectedSubjectId) return;
      const chs = await getChaptersBySubject(selectedSubjectId);
      setChapters(chs);
      if (chs.length > 0) setSelectedChapterId(chs[0].id);
    }
    loadChapters();
  }, [selectedSubjectId]);

  // Helper for compressing phone storage photos into optimized Base64
  const compressImageFile = (file: File, maxWidth = 600, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/jpeg", quality);
            resolve(base64);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("ফোন গ্যালারি থেকে ছবি প্রসেস হচ্ছে... ⏳");
      const base64Data = await compressImageFile(file);
      if (isEditing && editingSubject) {
        setEditingSubject({ ...editingSubject, imageUrl: base64Data });
      } else {
        setNewSubject({ ...newSubject, imageUrl: base64Data });
      }
      showToast("গ্যালারি থেকে ফটো Base64 হিসেবে যুক্ত হয়েছে! 🖼️");
    } catch (err) {
      showToast("ছবি প্রসেস করতে ত্রুটি হয়েছে");
    }
  };

  const handleOpenAddQuiz = () => {
    if (allChapters.length === 0) {
      getAllChapters().then(setAllChapters).catch(() => {});
    }
    setEditingQuiz(null);
    const defaultSub = subjects[0]?.id || "";
    const defaultCh = allChapters.find((c) => c.subjectId === defaultSub)?.id || "";
    let initialParsed: any[] = [];
    try {
      initialParsed = JSON.parse(sampleJsonTemplate);
    } catch (e) {}

    setQuizForm({
      title: "",
      classId: "class6",
      subjectId: defaultSub,
      chapterId: defaultCh,
      duration: 15,
      status: "published",
      negativeMarking: false,
      startTime: "",
      endTime: "",
      jsonInput: sampleJsonTemplate,
      jsonError: null,
      parsedQuestions: initialParsed,
    });
    setIsAddQuizOpen(true);
  };

  const handleOpenEditQuiz = (quiz: AdminQuiz) => {
    if (allChapters.length === 0) {
      getAllChapters().then(setAllChapters).catch(() => {});
    }
    setEditingQuiz(quiz);
    const questionsList = quiz.questions || [];
    const jsonStr = questionsList.length > 0 ? JSON.stringify(questionsList, null, 2) : "";
    setQuizForm({
      title: quiz.title || quiz.name || "",
      classId: quiz.classId || "all",
      subjectId: quiz.subjectId || (subjects[0]?.id || ""),
      chapterId: quiz.chapterId || "",
      duration: quiz.duration || 15,
      status: quiz.status || "published",
      negativeMarking: !!quiz.negativeMarking,
      startTime: quiz.startTime || "",
      endTime: quiz.endTime || "",
      jsonInput: jsonStr,
      jsonError: null,
      parsedQuestions: questionsList.map((q, idx) => ({
        id: q.id || `q_${idx + 1}`,
        questionText: q.questionText || q.question || `প্রশ্ন ${idx + 1}`,
        options: q.options || ["", "", "", ""],
        correctAnswer: q.correctAnswer ?? 0,
        explanation: q.explanation || "",
      })),
    });
    setIsAddQuizOpen(true);
  };

  const handleJsonChange = (text: string) => {
    let err: string | null = null;
    let parsed: any[] = [];
    if (text.trim()) {
      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          err = "JSON ডেটা অবশ্যই একটি Array ([ ... ]) হতে হবে।";
        } else {
          parsed = data.map((item, idx) => ({
            id: item.id || `q_${idx + 1}`,
            questionText: item.questionText || item.question || `প্রশ্ন ${idx + 1}`,
            options: Array.isArray(item.options) ? item.options : ["", "", "", ""],
            correctAnswer: typeof item.correctAnswer === "number" ? item.correctAnswer : 0,
            explanation: item.explanation || "",
          }));
          if (parsed.some((p) => !p.questionText || p.options.length < 2)) {
            err = "প্রত্যেক প্রশ্নে questionText এবং কমপক্ষে ২টি options থাকতে হবে।";
          }
        }
      } catch (e: any) {
        err = "JSON সিনট্যাক্স সঠিক নয়: " + (e.message || "");
      }
    }
    setQuizForm((prev) => ({
      ...prev,
      jsonInput: text,
      jsonError: err,
      parsedQuestions: parsed,
    }));
  };

  const handleLoadSampleJson = () => {
    handleJsonChange(sampleJsonTemplate);
    showToast("নমুনা JSON লোড হয়েছে! 📝");
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleJsonChange(content);
      showToast("JSON ফাইল সফলভাবে আপলোড হয়েছে! 📂");
    };
    reader.readAsText(file);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      showToast("কুইজ টাইটেল লিখুন");
      return;
    }
    if (quizForm.jsonError) {
      showToast("JSON এর ভুলগুলো সংশোধন করুন");
      return;
    }

    try {
      const selectedSub = subjects.find((s) => s.id === quizForm.subjectId || s.slug === quizForm.subjectId);
      const selectedCh = allChapters.find((c) => c.id === quizForm.chapterId);
      const subName = selectedSub ? selectedSub.name : "সাধারণ";
      const chName = selectedCh ? selectedCh.name : "";

      const questionsToSave =
        quizForm.parsedQuestions.length > 0
          ? quizForm.parsedQuestions
          : editingQuiz?.questions || [];
      const questionsCount = questionsToSave.length;

      let startTime = quizForm.startTime || null;
      let endTime = quizForm.endTime || null;
      if (quizForm.status === "live") {
        startTime = new Date().toISOString();
        endTime = new Date(Date.now() + Number(quizForm.duration) * 60 * 1000).toISOString();
      }

      const payload: Partial<AdminQuiz> = {
        title: quizForm.title.trim(),
        name: quizForm.title.trim(),
        classId: quizForm.classId,
        subjectId: quizForm.subjectId,
        subject: subName,
        subjectName: subName,
        chapterId: quizForm.chapterId,
        chapterName: chName,
        duration: Number(quizForm.duration) || 15,
        questionsCount,
        totalQuestions: questionsCount,
        negativeMarking: quizForm.negativeMarking,
        status: quizForm.status,
        isLive: quizForm.status === "live",
        startTime,
        endTime,
        questions: questionsToSave,
      };

      if (editingQuiz) {
        await updateQuizDoc(editingQuiz.id, payload);
        setQuizzes(
          quizzes.map((q) =>
            q.id === editingQuiz.id ? { ...q, ...payload, id: editingQuiz.id } : q
          )
        );
        logAction("update", "quiz", payload.title || "কুইজ", `${questionsCount}টি প্রশ্ন, সময়: ${payload.duration} মিনিট`);
        showToast("কুইজ সফলভাবে আপডেট করা হয়েছে! ✨");
      } else {
        const newId = await addQuiz(payload as any);
        setQuizzes([
          { id: newId, ...payload, attempts: 0, avgScore: "০%" } as AdminQuiz,
          ...quizzes,
        ]);
        logAction("create", "quiz", payload.title || "কুইজ", `${questionsCount}টি প্রশ্ন, বিষয়: ${subName}`);
        showToast("নতুন কুইজ ও প্রশ্ন সফলভাবে তৈরি হয়েছে! 🔥");
      }

      setIsAddQuizOpen(false);
      setEditingQuiz(null);
    } catch (err: any) {
      showToast("ত্রুটি: " + (err.message || "কুইজ সেভ করা যায়নি"));
    }
  };

  const handleToggleLiveStatus = async (quiz: AdminQuiz) => {
    const isCurrentlyLive = quiz.status === "live" || quiz.isLive;
    try {
      if (isCurrentlyLive) {
        await toggleQuizLiveStatus(quiz.id, false);
        setQuizzes(
          quizzes.map((q) =>
            q.id === quiz.id ? { ...q, status: "completed", isLive: false } : q
          )
        );
        logAction("toggle_live", "quiz", quiz.title || quiz.name || "কুইজ", "লাইভ সমাপ্ত করা হয়েছে");
        showToast(`🔴 "${quiz.title || quiz.name}" লাইভ এক্সাম সমাপ্ত করা হয়েছে!`);
      } else {
        const duration = quiz.duration || 15;
        await toggleQuizLiveStatus(quiz.id, true, duration);
        const now = new Date();
        const endTime = new Date(now.getTime() + duration * 60 * 1000).toISOString();
        setQuizzes(
          quizzes.map((q) =>
            q.id === quiz.id
              ? { ...q, status: "live", isLive: true, startTime: now.toISOString(), endTime }
              : q
          )
        );
        logAction("toggle_live", "quiz", quiz.title || quiz.name || "কুইজ", `লাইভ শুরু (${duration} মিনিট)`);
        showToast(`🚀 "${quiz.title || quiz.name}" লাইভ শুরু হয়েছে! (${duration} মিনিট)`);
      }
    } catch (err: any) {
      showToast("লাইভ স্ট্যাটাস পরিবর্তন করা যায়নি: " + (err.message || ""));
    }
  };

  const handleOpenViewQuestions = (quiz: AdminQuiz) => {
    setViewingQuizQuestions(quiz);
  };

  const handleAddQuiz = handleSaveQuiz;

  const handleOpenBulkUpload = () => {
    if (allChapters.length === 0) {
      getAllChapters().then(setAllChapters).catch(() => {});
    }
    if (questions.length === 0) {
      getAllQuestions().then(setQuestions).catch(() => {});
    }
    const targetClass =
      questionClassFilter && questionClassFilter !== "all"
        ? questionClassFilter
        : classes[0]?.id || "class6";
    const availableSubs = subjects.filter((s) => s.classId === targetClass);
    const targetSubject =
      questionSubjectFilter &&
      questionSubjectFilter !== "all" &&
      availableSubs.some((s) => s.id === questionSubjectFilter)
        ? questionSubjectFilter
        : availableSubs[0]?.id || "";
    const availableChapters = allChapters.filter((c) => c.subjectId === targetSubject);
    const targetChapter =
      questionChapterFilter &&
      questionChapterFilter !== "all" &&
      availableChapters.some((c) => c.id === questionChapterFilter)
        ? questionChapterFilter
        : "";

    setBulkMeta({
      classId: targetClass,
      subjectId: targetSubject,
      chapterId: targetChapter,
      quizId: "",
    });
    setIsBulkUploadOpen(true);
  };

  const handleOpenAddQuestion = () => {
    if (allChapters.length === 0) {
      getAllChapters().then(setAllChapters).catch(() => {});
    }
    if (questions.length === 0) {
      getAllQuestions().then(setQuestions).catch(() => {});
    }
    const targetClass =
      questionClassFilter && questionClassFilter !== "all"
        ? questionClassFilter
        : classes[0]?.id || "class6";
    const availableSubs = subjects.filter((s) => s.classId === targetClass);
    const targetSubject =
      questionSubjectFilter &&
      questionSubjectFilter !== "all" &&
      availableSubs.some((s) => s.id === questionSubjectFilter)
        ? questionSubjectFilter
        : availableSubs[0]?.id || "";
    const availableChapters = allChapters.filter((c) => c.subjectId === targetSubject);
    const targetChapter =
      questionChapterFilter &&
      questionChapterFilter !== "all" &&
      availableChapters.some((c) => c.id === questionChapterFilter)
        ? questionChapterFilter
        : "";

    setNewQuestion({
      classId: targetClass,
      subjectId: targetSubject,
      chapterId: targetChapter,
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    });
    setIsAddQuestionOpen(true);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.questionText.trim() || newQuestion.options.some((o) => !o.trim())) {
      showToast("প্রশ্নের বিবরণ ও ৪টি অপশন পুরন করুন");
      return;
    }
    try {
      const payload = {
        classId: newQuestion.classId,
        subjectId: newQuestion.subjectId,
        chapterId: newQuestion.chapterId,
        questionText: newQuestion.questionText.trim(),
        options: newQuestion.options.map((o) => o.trim()),
        correctAnswer: newQuestion.correctAnswer,
        explanation: newQuestion.explanation.trim(),
      };
      const id = await addQuestion(payload);
      setQuestions([{ id, ...payload }, ...questions]);
      setIsAddQuestionOpen(false);
      logAction("create", "question", newQuestion.questionText.trim().substring(0, 50));
      showToast("নতুন প্রশ্ন সফলভাবে যোগ হয়েছে! 📝");
    } catch (err) {
      console.error("Error creating question:", err);
      showToast("ত্রুটি: প্রশ্ন যোগ করা যায়নি");
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array");

      const count = await addBulkQuestions(parsed, bulkMeta);
      logAction("bulk_upload", "question", `${count}টি প্রশ্ন আপলোড`, `বিষয়: ${bulkMeta.subjectId || "Default"}`);
      showToast(`${count}টি প্রশ্ন সফলভাবে Firebase-এ Bulk Upload হয়েছে! 🎉`);
      setIsBulkUploadOpen(false);

      // Refresh Questions List
      const updatedQ = await getAllQuestions();
      setQuestions(updatedQ);
    } catch (err: any) {
      showToast(`JSON ফরম্যাট ভুল: ${err.message}`);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      const payload = {
        classId: editingQuestion.classId || "",
        subjectId: editingQuestion.subjectId || "",
        chapterId: editingQuestion.chapterId || "",
        questionText: editingQuestion.questionText.trim(),
        options: editingQuestion.options.map((o) => o.trim()),
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation?.trim() || "",
      };
      await updateQuestion(editingQuestion.id, payload);
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? { ...editingQuestion, ...payload } : q)));
      logAction("update", "question", editingQuestion.questionText.trim().substring(0, 50));
      setEditingQuestion(null);
      showToast("প্রশ্ন সফলভাবে এডিট হয়েছে! ✏️");
    } catch (err) {
      showToast("প্রশ্ন এডিট করা যায়নি");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const q = questions.find((x) => x.id === id);
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
      logAction("delete", "question", q?.questionText?.substring(0, 50) || id);
      showToast("প্রশ্ন মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("প্রশ্ন ডিলিট করা যায়নি");
    }
  };

  const saveLocalSubjectImage = (key: string, url?: string) => {
    if (typeof window === "undefined" || !key) return;
    try {
      const cached = JSON.parse(localStorage.getItem("quiz_mate_subject_images") || "{}");
      if (url) {
        cached[key] = url;
      } else {
        delete cached[key];
      }
      localStorage.setItem("quiz_mate_subject_images", JSON.stringify(cached));
    } catch (e) {}
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name) return;
    try {
      const slugVal = newSubject.slug || newSubject.name.toLowerCase().replace(/\s+/g, "-");
      const parsedSections = newSubject.sectionsText
        ? newSubject.sectionsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const item: AdminSubject = {
        id: `${newSubject.classId}_${slugVal}`,
        name: newSubject.name,
        slug: slugVal,
        classId: newSubject.classId,
        group: newSubject.group || "all",
        color: newSubject.color,
        imageUrl: newSubject.imageUrl || undefined,
        sections: parsedSections,
        totalQuizzes: 0,
        totalStudents: 0,
        order: subjects.length + 1,
      };
      await addSubject(item);
      if (item.imageUrl) {
        saveLocalSubjectImage(item.id, item.imageUrl);
        saveLocalSubjectImage(item.slug, item.imageUrl);
      }
      setSubjects([...subjects, item]);
      logAction("create", "subject", item.name, `ক্লাস: ${item.classId}`);
      setIsAddSubjectOpen(false);
      setNewSubject({ name: "", slug: "", classId: "class6", group: "all", color: "#0D9488", imageUrl: "", sectionsText: "" });
      showToast("Firebase-এ নতুন বিষয় যুক্ত হয়েছে! 📚");
    } catch (err) {
      showToast("ত্রুটি: বিষয় যুক্ত করা যায়নি");
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.name) return;
    try {
      const parsedSections = (editingSubject as any).sectionsText !== undefined
        ? (editingSubject as any).sectionsText.split(",").map((s: string) => s.trim()).filter(Boolean)
        : editingSubject.sections;
      const updatedSubjectObj = { ...editingSubject, sections: parsedSections };

      await updateSubject(editingSubject.id, {
        name: editingSubject.name,
        classId: editingSubject.classId,
        slug: editingSubject.slug,
        group: editingSubject.group || "all",
        color: editingSubject.color,
        imageUrl: editingSubject.imageUrl || undefined,
        sections: parsedSections,
      });
      if (editingSubject.imageUrl) {
        saveLocalSubjectImage(editingSubject.id, editingSubject.imageUrl);
        saveLocalSubjectImage(editingSubject.slug, editingSubject.imageUrl);
      }
      setSubjects(subjects.map((s) => (s.id === editingSubject.id ? updatedSubjectObj : s)));
      logAction("update", "subject", editingSubject.name, `ক্লাস: ${editingSubject.classId}`);
      setEditingSubject(null);
      showToast("বিষয় সফলভাবে আপডেট ও নতুন ক্লাসে সেট হয়েছে! ✏️");
    } catch (err) {
      showToast("ত্রুটি: বিষয় আপডেট করা যায়নি");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const s = subjects.find((x) => x.id === id);
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
      logAction("delete", "subject", s?.name || id);
      showToast("বিষয় মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("ত্রুটি: বিষয় ডিলিট করা যায়নি");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    try {
      const userPayload = {
        name: newUser.name,
        email: newUser.email,
        class: newUser.class,
        xp: 0,
        streak: 1,
        status: "active" as const,
      };
      const newId = await addStudent(userPayload);
      setUsers([{ id: newId, ...userPayload }, ...users]);
      logAction("create", "user", userPayload.name, `ইমেইল: ${userPayload.email}, শ্রেণি: ${userPayload.class}`);
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", class: "ক্লাস ৯" });
      showToast("Firebase-এ নতুন ইউজার তৈরি হয়েছে! 👤");
    } catch (err) {
      showToast("ত্রুটি: ইউজার তৈরি করা যায়নি");
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: "active" | "inactive" | "banned") => {
    const nextStatus = currentStatus === "active" ? "banned" : "active";
    try {
      const u = users.find((x) => x.id === id);
      await updateStudentStatus(id, nextStatus);
      setUsers(users.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
      logAction("status_change", "user", u?.name || id, `নতুন স্ট্যাটাস: ${nextStatus}`);
      showToast(`ইউজার স্ট্যাটাস পরিবর্তন: ${nextStatus === "active" ? "অ্যাক্টিভ" : "ব্যান"} 🔄`);
    } catch (err) {
      showToast("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const q = quizzes.find((x) => x.id === id);
      await deleteQuizDoc(id);
      setQuizzes(quizzes.filter((q) => q.id !== id));
      logAction("delete", "quiz", q?.title || q?.name || id);
      showToast("Firebase থেকে কুইজ ডিলিট করা হয়েছে! 🗑️");
    } catch (err) {
      showToast("কুইজ ডিলিট করা যায়নি");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const u = users.find((x) => x.id === id);
      await deleteStudent(id);
      setUsers(users.filter((u) => u.id !== id));
      logAction("delete", "user", u?.name || id, `ইমেইল: ${u?.email || ""}`);
      showToast("Firebase থেকে ইউজার ডিলিট করা হয়েছে! 🗑️");
    } catch (err) {
      showToast("ইউজার ডিলিট করা যায়নি");
    }
  };

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setNewBanner({
      title: "",
      subtitle: "",
      badge: "NEW FEATURE 🔥",
      ctaText: "কুইজ শুরু করুন 🚀",
      linkUrl: "/quiz/setup",
      imageUrl: "",
      bgGradient: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
    });
    setSelectedBannerRoutePreset("/quiz/setup");
    setCustomBannerRouteUrl("");
    setIsAddBannerOpen(true);
  };

  const handleOpenEditBanner = (b: BannerSlide) => {
    setEditingBanner(b);
    setNewBanner({
      title: b.title || "",
      subtitle: b.subtitle || "",
      badge: b.badge || "NEW FEATURE 🔥",
      ctaText: b.ctaText || "কুইজ শুরু করুন 🚀",
      linkUrl: b.linkUrl || "/quiz/setup",
      imageUrl: b.imageUrl || "",
      bgGradient: b.bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
    });

    const isPreset = PRESET_BANNER_ROUTES.some((r) => r.value === b.linkUrl);
    if (isPreset) {
      setSelectedBannerRoutePreset(b.linkUrl || "/quiz/setup");
      setCustomBannerRouteUrl("");
    } else {
      setSelectedBannerRoutePreset("custom");
      setCustomBannerRouteUrl(b.linkUrl || "");
    }
    setIsAddBannerOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title.trim()) return;

    const finalLink =
      selectedBannerRoutePreset === "custom"
        ? customBannerRouteUrl.trim() || "/quiz/setup"
        : selectedBannerRoutePreset;

    const itemPayload = {
      title: newBanner.title.trim(),
      subtitle: newBanner.subtitle.trim(),
      badge: newBanner.badge?.trim() || "NEW FEATURE 🔥",
      ctaText: newBanner.ctaText?.trim() || "কুইজ শুরু করুন 🚀",
      linkUrl: finalLink,
      imageUrl: newBanner.imageUrl?.trim() || "",
      bgGradient: newBanner.bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
    };

    try {
      if (editingBanner) {
        await updateBannerDoc(editingBanner.id, itemPayload);
        setBanners(
          banners.map((b) => (b.id === editingBanner.id ? { ...b, ...itemPayload } : b))
        );
        logAction("update", "banner", itemPayload.title);
        showToast("ব্যানার ক্যারোজেল আপডেট হয়েছে! ✏️");
      } else {
        const itemWithOrder = { ...itemPayload, order: banners.length + 1 };
        const id = await addBannerDoc(itemWithOrder);
        setBanners([...banners, { ...itemWithOrder, id }]);
        logAction("create", "banner", itemPayload.title);
        showToast("নতুন ব্যানার ক্যারোজেল যোগ হয়েছে! 🎨");
      }
      setIsAddBannerOpen(false);
      setEditingBanner(null);
    } catch (err) {
      console.error("Error saving banner:", err);
      showToast("ত্রুটি: ব্যানার সংরক্ষণ করা যায়নি");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const b = banners.find((x) => x.id === id);
      await deleteBannerDoc(id);
      setBanners(banners.filter((b) => b.id !== id));
      logAction("delete", "banner", b?.title || id);
      showToast("ব্যানার মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("ব্যানার ডিলিট করা যায়নি");
    }
  };

  // ===== CHAPTER HANDLERS =====
  const handleOpenAddChapter = (preSelectedSubjectId?: string) => {
    setEditingChapter(null);
    setNewChapter({ name: "", subjectId: preSelectedSubjectId || (subjects[0]?.id || ""), chapterNo: 1, sectionName: "" });
    setIsAddChapterOpen(true);
  };

  const handleOpenEditChapter = (ch: AdminChapter) => {
    setEditingChapter(ch);
    setNewChapter({ name: ch.name, subjectId: ch.subjectId, chapterNo: ch.chapterNo, sectionName: ch.sectionName || "" });
    setIsAddChapterOpen(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.name.trim() || !newChapter.subjectId) return;
    try {
      const payload = {
        name: newChapter.name.trim(),
        subjectId: newChapter.subjectId,
        chapterNo: newChapter.chapterNo,
        order: newChapter.chapterNo,
        sectionName: newChapter.sectionName || undefined,
      };
      if (editingChapter) {
        await updateChapter(editingChapter.id, payload);
        setAllChapters(
          allChapters
            .map((c) => (c.id === editingChapter.id ? { ...c, ...payload } : c))
            .sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0))
        );
        logAction("update", "chapter", payload.name);
        showToast("অধ্যায় আপডেট হয়েছে! ✏️");
      } else {
        const id = await addChapter(payload);
        setAllChapters(
          [...allChapters, { ...payload, id }].sort(
            (a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0)
          )
        );
        logAction("create", "chapter", payload.name);
        showToast("নতুন অধ্যায় যোগ হয়েছে! 📚");
      }
      setIsAddChapterOpen(false);
      setEditingChapter(null);
    } catch (err) {
      console.error("Error saving chapter:", err);
      showToast("ত্রুটি: অধ্যায় সংরক্ষণ করা যায়নি");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    try {
      const ch = allChapters.find((c) => c.id === id);
      await deleteChapter(id);
      setAllChapters(allChapters.filter((c) => c.id !== id));
      logAction("delete", "chapter", ch?.name || id);
      showToast("অধ্যায় মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("অধ্যায় ডিলিট করা যায়নি");
    }
  };

  // ===== DAILY MISSIONS HANDLERS =====
  const handleOpenAddMission = () => {
    setEditingMission(null);
    setNewMission({
      title: "",
      desc: "",
      targetType: "quiz_count",
      target: 1,
      rewardXP: 50,
      icon: "Target",
      color: "#0F766E",
      bg: "bg-teal-50 border-teal-200/80 text-teal-700",
      actionText: "কুইজ খেলুন",
      active: true,
      order: missions.length + 1,
    });
    setIsAddMissionOpen(true);
  };

  const handleOpenEditMission = (m: DailyMissionConfig) => {
    setEditingMission(m);
    setNewMission({
      title: m.title,
      desc: m.desc,
      targetType: m.targetType,
      target: m.target,
      rewardXP: m.rewardXP,
      icon: m.icon,
      color: m.color,
      bg: m.bg,
      actionText: m.actionText,
      active: m.active,
      order: m.order,
    });
    setIsAddMissionOpen(true);
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMission.title.trim()) return;

    try {
      if (editingMission) {
        await updateDailyMissionDoc(editingMission.id, newMission);
        setMissions(
          missions.map((m) => (m.id === editingMission.id ? { id: editingMission.id, ...newMission } : m))
        );
        logAction("update", "mission", newMission.title, `টার্গেট: ${newMission.target}, এক্সপি: ${newMission.rewardXP}`);
        showToast("মিশন সফলভাবে আপডেট হয়েছে! 🎯");
      } else {
        const id = await addDailyMissionDoc(newMission);
        setMissions([...missions, { id, ...newMission }]);
        logAction("create", "mission", newMission.title, `টার্গেট: ${newMission.target}, এক্সপি: ${newMission.rewardXP}`);
        showToast("নতুন দৈনিক মিশন তৈরি হয়েছে! 🚀");
      }
      setIsAddMissionOpen(false);
      setEditingMission(null);
    } catch (err: any) {
      showToast("ত্রুটি: মিশন সংরক্ষণ করা যায়নি");
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই মিশনটি মুছে ফেলতে চান?")) return;
    try {
      const m = missions.find((x) => x.id === id);
      await deleteDailyMissionDoc(id);
      setMissions(missions.filter((m) => m.id !== id));
      logAction("delete", "mission", m?.title || id);
      showToast("মিশন মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("মিশন ডিলিট করা যায়নি");
    }
  };

  const handleToggleMissionActive = async (id: string, currentActive: boolean) => {
    try {
      const m = missions.find((x) => x.id === id);
      await updateDailyMissionDoc(id, { active: !currentActive });
      setMissions(missions.map((m) => (m.id === id ? { ...m, active: !currentActive } : m)));
      logAction("status_change", "mission", m?.title || id, !currentActive ? "সক্রিয় করা হয়েছে" : "নিষ্ক্রিয় করা হয়েছে");
      showToast(`মিশন ${!currentActive ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Inactive)"} করা হয়েছে! ✅`);
    } catch (err) {
      showToast("স্ট্যাটাস পরিবর্তন করা যায়নি");
    }
  };

  const handleSaveMissionSettings = async () => {
    try {
      await saveDailyMissionsSettings(missionSettings);
      logAction("update", "settings", "দৈনিক মিশন গ্লোবাল সেটিংস", `বোনাস এক্সপি: ${missionSettings.allClearBonusXP}`);
      showToast("দৈনিক মিশন সেটিংস সংরক্ষণ করা হয়েছে! ⚙️");
    } catch (err) {
      showToast("সেটিংস সেভ করতে ত্রুটি হয়েছে");
    }
  };

  const handleResetDefaultMissions = async () => {
    if (!confirm("আপনি কি সব মিশন রিসেট করে ডিফল্ট সেটিংসে ফিরিয়ে আনতে চান?")) return;
    try {
      const defs = await resetDefaultDailyMissions();
      setMissions(defs);
      setMissionSettings(DEFAULT_GLOBAL_SETTINGS);
      logAction("reset", "mission", "সব দৈনিক মিশন ডিফল্ট রিসেট");
      showToast("ডিফল্ট ৩টি মিশন এবং সেটিংস রিস্টোর করা হয়েছে! 🔄");
    } catch (err) {
      showToast("রিসেট করতে সমস্যা হয়েছে");
    }
  };

  const allNavItems: NavItem[] = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "missions", label: "দৈনিক মিশন কন্ট্রোল", icon: Target, badge: String(missions.length), badgeColor: "bg-emerald-100 text-emerald-800" },
    { id: "banners", label: "ব্যানার ক্যারোজেল", icon: Layers, badge: String(banners.length), badgeColor: "bg-teal-100 text-teal-800" },
    { id: "quizzes", label: "কুইজ ম্যানেজমেন্ট", icon: ListChecks, badge: String(quizzes.length), badgeColor: "bg-amber-100 text-amber-800" },
    { id: "questions", label: "প্রশ্ন ব্যাংক (Questions)", icon: HelpCircle, badge: String(questions.length), badgeColor: "bg-teal-100 text-teal-800" },
    { id: "subjects", label: "বিষয় ও অধ্যায়", icon: BookOpen, badge: String(subjects.length), badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "users", label: "ইউজারস ও পারমিশন", icon: Users, badge: String(users.length), badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "activity", label: "অ্যাডমিন অ্যাক্টিভিটি লগ", icon: Activity, badge: activityLogs.length > 0 ? String(activityLogs.length) : undefined, badgeColor: "bg-teal-500/20 text-teal-300 border border-teal-500/30" },
    { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
    { id: "settings", label: "সেটিংস", icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "admin") return item.id !== "settings";
    if (currentUserRole === "moderator") return item.id !== "users" && item.id !== "settings" && item.id !== "activity";
    if (currentUserRole === "content_creator") {
      return (
        item.id === "dashboard" ||
        item.id === "missions" ||
        item.id === "quizzes" ||
        item.id === "questions" ||
        item.id === "subjects"
      );
    }
    return true;
  });

  const filteredQuestions = (questions || []).filter((q) => {
    if (!q) return false;
    if (questionClassFilter !== "all" && q.classId !== questionClassFilter) return false;
    if (questionSubjectFilter !== "all" && q.subjectId !== questionSubjectFilter) return false;
    if (questionChapterFilter !== "all" && q.chapterId !== questionChapterFilter) return false;
    if (searchQuery) {
      const qText = String(q.questionText || "").toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="h-screen bg-slate-950 font-sans flex overflow-hidden text-white relative">
      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-teal-400/40">
          <CheckCircle width={16} height={16} />
          {toastMessage}
        </div>
      )}

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop Fixed + Mobile Sliding Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800/80 transition-all duration-300 ${
          mobileSidebarOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        } ${sidebarOpen ? "md:w-60" : "md:w-16"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap width={16} height={16} className="text-white" />
            </div>
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white leading-none">QuizMate Admin</p>
                <p className="text-[9px] font-bold text-teal-400 leading-none mt-1 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentUserRole.toUpperCase().replace("_", " ")}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X width={18} height={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 text-left group cursor-pointer ${
                  isActive
                    ? "bg-teal-600/20 text-teal-400 border border-teal-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon
                  width={18}
                  height={18}
                  className={`flex-shrink-0 ${
                    isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {(sidebarOpen || mobileSidebarOpen) && (
                  <span className="text-xs font-bold flex-1 truncate">{item.label}</span>
                )}
                {(sidebarOpen || mobileSidebarOpen) && item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
              <Crown width={14} height={14} className="text-amber-300" />
            </div>
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">অ্যাডমিন প্যানেল</p>
                <p className="text-[9px] font-bold text-teal-400 capitalize">
                  {currentUserRole.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="flex-shrink-0 flex items-center justify-between px-3 md:px-6 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white flex-shrink-0 cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu width={18} height={18} />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex h-8 w-8 rounded-lg bg-slate-800 items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0 cursor-pointer"
            >
              <LayoutDashboard width={15} height={15} />
            </button>

            <div className="min-w-0">
              <h1 className="text-xs md:text-sm font-black text-white leading-none truncate">
                {navItems.find((n) => n.id === activeNav)?.label ?? "ড্যাশবোর্ড"}
              </h1>
              <p className="text-[9px] text-slate-500 font-medium mt-0.5 hidden sm:block truncate">
                QuizMate সম্পূর্ণ কন্ট্রোল প্যানেল & পারমিশন হাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            <div className="relative hidden lg:flex items-center">
              <Search width={13} height={13} className="absolute left-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-[11px] bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 w-36 xl:w-48 transition-all"
              />
            </div>

            <button
              onClick={handleOpenBulkUpload}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10.5px] font-extrabold transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Upload width={12} height={12} />
              <span className="hidden sm:inline">JSON Bulk</span>
            </button>

            {activeNav === "activity" ? (
              <button
                onClick={fetchActivityLogs}
                disabled={activityLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-lg text-white text-[10.5px] font-extrabold transition-all shadow-lg shadow-teal-600/20 cursor-pointer"
              >
                <RefreshCw width={12} height={12} className={activityLoading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">লগ রিফ্রেশ</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (activeNav === "subjects") setIsAddSubjectOpen(true);
                  else if (activeNav === "users") setIsAddUserOpen(true);
                  else if (activeNav === "banners") handleOpenAddBanner();
                  else if (activeNav === "missions") handleOpenAddMission();
                  else setIsAddQuizOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white text-[10.5px] font-extrabold transition-all shadow-lg shadow-teal-600/20 cursor-pointer"
              >
                <Plus width={12} height={12} />
                <span className="hidden sm:inline">নতুন যোগ</span>
              </button>
            )}

            <button
              onClick={async () => {
                await fetch("/api/admin/session", { method: "DELETE" });
                window.location.href = "/login";
              }}
              className="h-8 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="লগআউট"
            >
              <LogOut width={13} height={13} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-teal-400 gap-2 font-bold text-sm">
              <Loader2 width={20} height={20} className="animate-spin" /> Firebase ডাটাবেস লোড হচ্ছে...
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeNav === "dashboard" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "মোট ইউজার", value: String(users.length), icon: Users, color: "#0D9488", bg: "#E6F4F1" },
                      { label: "মোট কুইজ", value: String(quizzes.length), icon: ListChecks, color: "#6366F1", bg: "#EEF2FF" },
                      { label: "মোট প্রশ্ন", value: String(questions.length), icon: HelpCircle, color: "#A855F7", bg: "#F3E8FF" },
                      { label: "মোট বিষয়", value: String(subjects.length), icon: BookOpen, color: "#F59E0B", bg: "#FFFBEB" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                            <s.icon width={17} height={17} style={{ color: s.color }} />
                          </div>
                        </div>
                        <p className="text-xl font-black text-white leading-none">{s.value}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800/80 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-extrabold text-white">সাপ্তাহিক অ্যাক্টিভিটি</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">কুইজ অ্যাটেম্পট · এই সপ্তাহ</p>
                        </div>
                      </div>
                      {questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-28 text-slate-600 gap-2">
                          <HelpCircle width={28} height={28} />
                          <p className="text-xs font-bold">প্রশ্ন যোগ হলে chart দেখা যাবে</p>
                        </div>
                      ) : (
                        <div className="flex items-end justify-between gap-2 h-28">
                          {["সো", "মঙ", "বু", "বৃ", "শু", "শ", "র"].map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full rounded-t-lg" style={{ height: `${(i + 1) * 12}%`, background: "rgba(255,255,255,0.07)" }} />
                              <span className="text-[9px] font-bold text-slate-500">{day}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-4 flex flex-col gap-3">
                      <p className="text-sm font-extrabold text-white">লাইভ স্ট্যাটস</p>
                      {[
                        { label: "মোট শিক্ষার্থী", value: String(users.length), icon: Users, color: "text-teal-400" },
                        { label: "মোট প্রশ্ন সংখ্যা", value: String(questions.length), icon: HelpCircle, color: "text-purple-400" },
                        { label: "মোট বিষয়", value: String(subjects.length), icon: BookOpen, color: "text-amber-400" },
                        { label: "মোট ব্যানার", value: String(banners.length), icon: Layers, color: "text-indigo-400" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                          <div className="flex items-center gap-2">
                            <item.icon width={13} height={13} className={item.color} />
                            <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* DAILY MISSIONS CONTROL TAB */}
              {activeNav === "missions" && (
                <div className="space-y-4">
                  {/* Top Title & Header Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Target width={18} height={18} className="text-emerald-400" />
                        দৈনিক মিশন ও টার্গেট কন্ট্রোল ({missions.length}টি মিশন)
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        শিক্ষার্থীদের দৈনিক মিশন, টার্গেট মেট্রিক, XP রিওয়ার্ড এবং অল-ক্লিয়ার বোনাস নিয়ন্ত্রণ করুন
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleResetDefaultMissions}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                        title="ডিফল্ট ৩টি মিশন রিস্টোর করুন"
                      >
                        <RefreshCw width={12} height={12} /> ডিফল্ট রিসেট
                      </button>

                      <button
                        onClick={handleOpenAddMission}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                      >
                        <Plus width={13} height={13} /> নতুন মিশন তৈরি
                      </button>
                    </div>
                  </div>

                  {/* Summary & Global Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Stat Card 1: Active Missions */}
                    <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">মোট সক্রিয় মিশন</p>
                        <p className="text-xl font-black text-white mt-0.5">
                          {missions.filter((m) => m.active !== false).length} / {missions.length}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Target width={20} height={20} />
                      </div>
                    </div>

                    {/* Stat Card 2: Total Daily XP */}
                    <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">সর্বমোট দৈনিক রিওয়ার্ড</p>
                        <p className="text-xl font-black text-amber-400 mt-0.5">
                          +{missions.filter((m) => m.active !== false).reduce((a, b) => a + (b.rewardXP || 0), 0) + (missionSettings.allClearBonusXP || 0)} XP
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Zap width={20} height={20} />
                      </div>
                    </div>

                    {/* Global Settings Box */}
                    <div className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                          <Settings width={12} height={12} className="text-teal-400" />
                          গ্লোবাল সেটিংস
                        </span>
                        <button
                          onClick={handleSaveMissionSettings}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[10px] font-bold transition-all shadow cursor-pointer"
                        >
                          সেভ করুন
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <label className="text-slate-400 text-[10.5px]">ফিচার সক্রিয়:</label>
                        <button
                          type="button"
                          onClick={() =>
                            setMissionSettings({
                              ...missionSettings,
                              enabled: !missionSettings.enabled,
                            })
                          }
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                            missionSettings.enabled
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {missionSettings.enabled ? "অন (ON)" : "অফ (OFF)"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <label className="text-slate-400 text-[10.5px]">অল-ক্লিয়ার বোনাস XP:</label>
                        <input
                          type="number"
                          value={missionSettings.allClearBonusXP}
                          onChange={(e) =>
                            setMissionSettings({
                              ...missionSettings,
                              allClearBonusXP: Number(e.target.value) || 0,
                            })
                          }
                          className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-300 text-xs font-black text-right focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Missions List Grid */}
                  {missions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-slate-900 border border-slate-800 border-dashed">
                      <Target width={28} height={28} className="text-slate-600" />
                      <p className="text-sm font-bold text-slate-400">এখনো কোনো মিশন কনফিগার করা হয়নি</p>
                      <button
                        onClick={handleResetDefaultMissions}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw width={13} height={13} /> ডিফল্ট ৩টি মিশন লোড করুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {missions.map((m, idx) => {
                        const metricInfo = PRESET_MISSION_METRICS.find((p) => p.value === m.targetType);
                        return (
                          <div
                            key={m.id || idx}
                            className={`rounded-2xl p-4 bg-slate-900 border transition-all flex flex-col justify-between space-y-3 ${
                              m.active !== false
                                ? "border-slate-800 hover:border-emerald-500/40"
                                : "border-slate-800/60 opacity-60"
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Top Bar: Order, Metric Tag, Active Toggle, Actions */}
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-6 w-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center justify-center">
                                    #{idx + 1}
                                  </span>
                                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    {metricInfo?.label.split(" ")[0] || "টার্গেট"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggleMissionActive(m.id, m.active !== false)}
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold cursor-pointer transition-all ${
                                      m.active !== false
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                        : "bg-slate-800 text-slate-400 border border-slate-700"
                                    }`}
                                    title="সক্রিয়/নিষ্ক্রিয় টগল"
                                  >
                                    {m.active !== false ? "সক্রিয়" : "নিষ্ক্রিয়"}
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditMission(m)}
                                    className="h-6 w-6 rounded-md bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                                    title="সম্পাদনা করুন"
                                  >
                                    <Edit3 width={11} height={11} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMission(m.id)}
                                    className="h-6 w-6 rounded-md bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 width={11} height={11} />
                                  </button>
                                </div>
                              </div>

                              {/* Title & Desc */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-extrabold text-white">{m.title}</h3>
                                  <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                    +{m.rewardXP} XP
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">{m.desc}</p>
                              </div>
                            </div>

                            {/* Bottom Info Bar */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-bold text-teal-400 flex items-center gap-1">
                                লক্ষ্য: {m.target} {m.targetType === "min_score_percent" ? "%" : "টি"}
                              </span>
                              <span className="font-mono text-[9px] text-slate-500">
                                বাটন: "{m.actionText || "কুইজ খেলুন"}"
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* BANNERS MANAGEMENT TAB */}
              {activeNav === "banners" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Layers width={18} height={18} className="text-teal-400" />
                        ব্যানার ক্যারোজেল ম্যানেজমেন্ট ({banners.length}টি ব্যানার)
                      </h2>
                      <p className="text-[10px] text-slate-500">ইউজারের ড্যাশবোর্ডে স্লাইডার হিসেবে নতুন ফিচার ও আপডেট প্রমোট করুন</p>
                    </div>
                    <button
                      onClick={handleOpenAddBanner}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      <Plus width={13} height={13} /> নতুন ব্যানার যোগ করুন
                    </button>
                  </div>

                  {banners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-slate-900 border border-slate-800 border-dashed">
                      <div className="h-14 w-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                        <Layers width={24} height={24} className="text-slate-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">এখনো কোনো ব্যানার নেই</p>
                      <p className="text-[11px] text-slate-600 text-center max-w-xs">"নতুন ব্যানার যোগ করুন" বাটনে ক্লিক করে প্রথম স্লাইড তৈরি করুন</p>
                      <button onClick={handleOpenAddBanner} className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-500 transition-all flex items-center gap-1.5">
                        <Plus width={13} height={13} /> প্রথম ব্যানার যোগ করুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {banners.map((b, idx) => (
                        <div
                          key={b.id}
                          className="rounded-2xl p-4 relative overflow-hidden border border-slate-800 bg-slate-900 flex flex-col justify-between space-y-3 min-h-[140px]"
                          style={{ background: b.bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)" }}
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/20">
                              #{idx + 1} · {b.badge || "PROMO"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditBanner(b)}
                                className="h-7 w-7 rounded-lg bg-black/40 text-amber-300 hover:bg-amber-500 hover:text-slate-900 flex items-center justify-center transition-all border border-white/20"
                                title="সম্পাদনা করুন"
                              >
                                <Edit3 width={13} height={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(b.id)}
                                className="h-7 w-7 rounded-lg bg-black/40 text-rose-300 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all border border-white/20"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 width={13} height={13} />
                              </button>
                            </div>
                          </div>

                          <div className="relative z-10">
                            <h3 className="text-lg font-black text-white leading-tight">{b.title}</h3>
                            <p className="text-xs text-white/80 font-medium mt-1 line-clamp-2">{b.subtitle}</p>
                          </div>

                          <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-extrabold text-amber-200 bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
                              CTA: {b.ctaText || "এক্সপ্লোর করুন"}
                            </span>
                            <span className="text-[9px] text-white/60 font-mono">Link: {b.linkUrl}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* QUESTIONS BANK TAB (UPGRADED CHAPTER-WISE SECTION) */}
              {activeNav === "questions" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <HelpCircle width={18} height={18} className="text-purple-400" />
                        প্রশ্ন ব্যাংক ও ম্যানুয়াল এডিটর ({questions.length}টি প্রশ্ন)
                      </h2>
                      <p className="text-[10px] text-slate-500">বিষয় ও অধ্যায়ভিত্তিক প্রশ্ন সংরক্ষণ, ম্যানুয়াল সম্পাদনা ও Bulk JSON আপলোড</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleOpenAddQuestion}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-extrabold transition-all shadow"
                      >
                        <Plus width={13} height={13} /> ১টি প্রশ্ন যোগ করুন
                      </button>

                      <button
                        onClick={handleOpenBulkUpload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold transition-all shadow"
                      >
                        <Upload width={13} height={13} /> Bulk JSON Upload
                      </button>
                    </div>
                  </div>

                  {/* CHAPTER-WISE MULTI-LEVEL FILTER CONTROLS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    {/* Class Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">১. ক্লাস ফিল্টার:</label>
                      <select
                        value={questionClassFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionClassFilter(val);
                          setQuestionSubjectFilter("all");
                          setQuestionChapterFilter("all");
                          fetchFilteredQuestions({ classId: val, subjectId: "all", chapterId: "all" });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-teal-400 font-bold focus:outline-none"
                      >
                        <option value="all">সকল ক্লাস</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">২. বিষয় ফিল্টার:</label>
                      <select
                        value={questionSubjectFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionSubjectFilter(val);
                          setQuestionChapterFilter("all");
                          fetchFilteredQuestions({ classId: questionClassFilter, subjectId: val, chapterId: "all" });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-400 font-bold focus:outline-none"
                      >
                        <option value="all">সকল বিষয়</option>
                        {questionBankAvailableSubjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Chapter Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">
                        ৩. অধ্যায় ফিল্টার: {questionSubjectFilter !== "all" && `(${questionBankAvailableChapters.length}টি)`}
                      </label>
                      <select
                        value={questionChapterFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionChapterFilter(val);
                          fetchFilteredQuestions({ classId: questionClassFilter, subjectId: questionSubjectFilter, chapterId: val });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-bold focus:outline-none"
                      >
                        <option value="all">সকল অধ্যায়</option>
                        {questionBankAvailableChapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>অধ্যায় {ch.chapterNo}: {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {questionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-2xl bg-slate-900 border border-slate-800">
                      <Loader2 width={24} height={24} className="animate-spin text-teal-400" />
                      <p className="text-xs font-bold text-slate-400">প্রশ্ন ব্যাংক লোড হচ্ছে...</p>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-slate-900 border border-slate-800 border-dashed">
                      <HelpCircle width={28} height={28} className="text-slate-600" />
                      <p className="text-sm font-bold text-slate-400">ফিল্টারের সাথে কোনো প্রশ্ন পাওয়া যায়নি</p>
                      <button onClick={handleOpenAddQuestion} className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-500 transition-all flex items-center gap-1.5">
                        <Plus width={13} height={13} /> প্রথম প্রশ্ন যোগ করুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredQuestions.map((q, idx) => {
                        const sub = subjects.find((s) => s.id === q.subjectId || s.slug === q.subjectId);
                        const ch = allChapters.find((c) => c.id === q.chapterId);
                        const clsName = classes.find((c) => c.id === q.classId)?.name;

                        return (
                          <div key={q.id || idx} className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="h-6 w-6 rounded-lg bg-purple-900/60 text-purple-300 font-black text-xs flex items-center justify-center border border-purple-500/20">
                                    {idx + 1}
                                  </span>

                                  {clsName && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/20">
                                      {clsName}
                                    </span>
                                  )}

                                  {sub && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/20">
                                      {sub.name}
                                    </span>
                                  )}

                                  {ch && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/20">
                                      অধ্যায় {ch.chapterNo}: {ch.name}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-extrabold text-white leading-snug">{q.questionText}</h3>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setEditingQuestion(q)}
                                  className="h-7 px-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/20 transition-all"
                                >
                                  <Edit3 width={12} height={12} /> এডিট
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all"
                                >
                                  <Trash2 width={12} height={12} />
                                </button>
                              </div>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => {
                                const optText =
                                  typeof opt === "object" && opt !== null
                                    ? String((opt as any).text || (opt as any).title || (opt as any).value || JSON.stringify(opt))
                                    : String(opt ?? "");
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2 rounded-xl border flex items-center justify-between ${
                                      oIdx === q.correctAnswer
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                                        : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                                    }`}
                                  >
                                    <span>{optText}</span>
                                    {oIdx === q.correctAnswer && <Check width={14} height={14} className="text-emerald-400" />}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                                💡 <span className="font-bold text-slate-300">ব্যাখ্যা:</span> {String(q.explanation)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PAGINATION / LOAD MORE FOOTER */}
                  {questions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 flex-wrap">
                        <span>মোট লোড করা প্রশ্ন: <strong className="text-teal-400 font-black">{questions.length}টি</strong></span>
                        {filteredQuestions.length !== questions.length && (
                          <span className="text-indigo-400 font-bold">({filteredQuestions.length}টি ফিল্টারে প্রদর্শিত)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {hasMoreQuestions ? (
                          <button
                            onClick={handleLoadMoreQuestions}
                            disabled={loadingMoreQuestions}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                          >
                            {loadingMoreQuestions ? (
                              <>
                                <Loader2 width={14} height={14} className="animate-spin text-white" />
                                <span>পরবর্তী ২০টি প্রশ্ন লোড হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown width={14} height={14} />
                                <span>পরবর্তী ২০টি প্রশ্ন লোড করুন (Next 20)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                            <CheckCircle width={14} height={14} className="text-emerald-400" />
                            সবগুলো প্রশ্ন লোড সম্পন্ন হয়েছে
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* QUIZZES & LIVE EXAMS TAB */}
              {(activeNav === "dashboard" || activeNav === "quizzes") && (() => {
                const liveCount = quizzes.filter((q) => q.status === "live" || q.isLive).length;
                const scheduledCount = quizzes.filter((q) => q.status === "scheduled").length;
                const totalQuestionsCount = quizzes.reduce((sum, q) => sum + (q.questions?.length || q.questionsCount || 0), 0);

                const filteredQuizzes = quizzes.filter((q) => {
                  if (quizClassFilter !== "all" && q.classId !== quizClassFilter) return false;
                  if (quizStatusFilter !== "all") {
                    if (quizStatusFilter === "live" && !(q.status === "live" || q.isLive)) return false;
                    if (quizStatusFilter === "scheduled" && q.status !== "scheduled") return false;
                    if (quizStatusFilter === "draft" && q.status !== "draft") return false;
                    if (quizStatusFilter === "completed" && q.status !== "completed") return false;
                  }
                  if (searchQuery) {
                    const qText = `${q.title || q.name} ${q.subject || ""} ${q.chapterName || ""}`.toLowerCase();
                    if (!qText.includes(searchQuery.toLowerCase())) return false;
                  }
                  return true;
                });

                return (
                  <div className="space-y-4">
                    {/* Header with Stats Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                          <ListChecks width={20} height={20} className="text-teal-400" />
                          কুইজ ও লাইভ এক্সাম ম্যানেজমেন্ট ({quizzes.length}টি কুইজ)
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ক্লাস অনুযায়ী লাইভ পরীক্ষা, JSON প্রশ্ন সেটআপ ও শিডিউলিং কন্ট্রোল
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenAddQuiz}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                        >
                          <Plus width={14} height={14} />
                          <span>নতুন কুইজ / লাইভ এক্সাম</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats Counter Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট কুইজ</p>
                          <p className="text-lg font-black text-white mt-0.5">{quizzes.length}টি</p>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                          <ListChecks width={16} height={16} />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between relative overflow-hidden">
                        {liveCount > 0 && <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping m-1.5" />}
                        <div>
                          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">🔴 লাইভ চলছে</p>
                          <p className="text-lg font-black text-rose-400 mt-0.5">{liveCount}টি</p>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <Radio width={16} height={16} />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🕒 শিডিউলড</p>
                          <p className="text-lg font-black text-amber-400 mt-0.5">{scheduledCount}টি</p>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Clock width={16} height={16} />
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📝 মোট প্রশ্ন</p>
                          <p className="text-lg font-black text-indigo-400 mt-0.5">{totalQuestionsCount}টি</p>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <HelpCircle width={16} height={16} />
                        </div>
                      </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-xs">
                      {/* Class Filter */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400">ক্লাস ফিল্টার:</span>
                        <select
                          value={quizClassFilter}
                          onChange={(e) => setQuizClassFilter(e.target.value)}
                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-teal-400 font-extrabold focus:outline-none cursor-pointer"
                        >
                          <option value="all">সকল ক্লাস (All Classes)</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter Tabs */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {[
                          { id: "all", label: "সব" },
                          { id: "live", label: "🔴 লাইভ" },
                          { id: "scheduled", label: "🕒 শিডিউল" },
                          { id: "published", label: "● সাধারণ" },
                          { id: "completed", label: "✔️ সমাপ্ত" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setQuizStatusFilter(tab.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
                              quizStatusFilter === tab.id
                                ? "bg-teal-500 text-white shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quizzes Table */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-800/80 bg-slate-950/50">
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">কুইজ ও ক্লাস</th>
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">বিষয় ও অধ্যায়</th>
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">প্রশ্ন সংখ্যা</th>
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">সময় ও মার্কিং</th>
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">স্ট্যাটাস ও লাইভ</th>
                              <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {filteredQuizzes.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-xs">
                                  <ListChecks className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                                  <p className="font-bold">কোনো কুইজ পাওয়া যায়নি</p>
                                  <p className="text-[10px] text-slate-600 mt-0.5">নতুন কুইজ তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                                </td>
                              </tr>
                            ) : (
                              filteredQuizzes.map((q) => {
                                const isLive = q.status === "live" || q.isLive;
                                const totalQ = q.questions?.length || q.questionsCount || 0;
                                const targetClass = classes.find((c) => c.id === q.classId)?.name || (q.classId === "all" ? "সকল ক্লাস" : q.classId);

                                return (
                                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors group">
                                    {/* Title & Target Class */}
                                    <td className="px-4 py-3">
                                      <div className="space-y-1">
                                        <p className="text-xs font-black text-white">{q.title || q.name}</p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[9.5px] font-black text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-md">
                                            🎓 {targetClass}
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Subject & Chapter */}
                                    <td className="px-4 py-3">
                                      <div className="space-y-0.5">
                                        <span className="text-[10.5px] font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
                                          {q.subjectName || q.subject || "সাধারণ"}
                                        </span>
                                        {q.chapterName && (
                                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                            📖 {q.chapterName}
                                          </p>
                                        )}
                                      </div>
                                    </td>

                                    {/* Questions Count & Viewer Button */}
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                                          {totalQ}টি প্রশ্ন
                                        </span>
                                        {totalQ > 0 && (
                                          <button
                                            onClick={() => handleOpenViewQuestions(q)}
                                            title="প্রশ্নসমূহ দেখুন"
                                            className="text-[10px] font-bold text-slate-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer flex items-center gap-0.5"
                                          >
                                            <Eye width={11} height={11} /> দেখুন
                                          </button>
                                        )}
                                      </div>
                                    </td>

                                    {/* Duration & Negative Marking */}
                                    <td className="px-4 py-3 text-xs">
                                      <div className="space-y-0.5 text-slate-300">
                                        <div className="flex items-center gap-1 font-bold">
                                          <Clock width={12} height={12} className="text-slate-400" />
                                          <span>{q.duration || 15} মিনিট</span>
                                        </div>
                                        {q.negativeMarking ? (
                                          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                            ⚠️ নেগেটিভ মার্কিং
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-medium text-slate-500">
                                            নেগেটিভ নেই
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Status & Live Control */}
                                    <td className="px-4 py-3">
                                      <div className="space-y-1.5">
                                        {isLive ? (
                                          <div className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse">
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                            <span>🔴 লাইভ চলছে</span>
                                          </div>
                                        ) : q.status === "scheduled" ? (
                                          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                            <Clock width={10} height={10} /> শিডিউলড
                                          </span>
                                        ) : q.status === "completed" ? (
                                          <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                            ✔️ সমাপ্ত
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                            ● পাবলিশড
                                          </span>
                                        )}

                                        {/* Toggle Live Exam Button */}
                                        <div>
                                          <button
                                            onClick={() => handleToggleLiveStatus(q)}
                                            className={`text-[9.5px] font-black px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                              isLive
                                                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-sm"
                                                : "bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border-slate-700"
                                            }`}
                                          >
                                            <Radio width={11} height={11} className={isLive ? "animate-spin" : ""} />
                                            <span>{isLive ? "লাইভ সমাপ্ত করুন" : "⚡ লাইভ শুরু করুন"}</span>
                                          </button>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Action Buttons */}
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleOpenEditQuiz(q)}
                                          title="এডিট করুন"
                                          className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-teal-400 hover:border-teal-500/50 transition-all cursor-pointer"
                                        >
                                          <Edit3 width={12} height={12} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteQuiz(q.id)}
                                          title="মুছে ফেলুন"
                                          className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer"
                                        >
                                          <Trash2 width={12} height={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SUBJECTS TAB */}
              {activeNav === "subjects" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <BookOpen width={18} height={18} className="text-indigo-400" />
                        বিষয়সমূহ ম্যানেজমেন্ট ({subjects.length}টি বিষয়)
                      </h2>
                      <p className="text-[10px] text-slate-500">Firebase `subjects` কালেকশন (ক্লাস ফিল্টার ও এডিটর সহ)</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* CLASS FILTER DROPDOWN */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                        <span className="text-[11px] font-bold text-slate-400">ফিল্টার:</span>
                        <select
                          value={selectedSubjectClassFilter}
                          onChange={(e) => setSelectedSubjectClassFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-teal-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-slate-900 text-white">সকল ক্লাস ({subjects.length})</option>
                          {classes.map((c) => {
                            const count = subjects.filter((s) => s.classId === c.id).length;
                            return (
                              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                                {c.name} ({count})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        onClick={() => setIsAddSubjectOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                      >
                        <Plus width={13} height={13} /> নতুন বিষয় যোগ করুন
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(selectedSubjectClassFilter === "all"
                      ? subjects
                      : subjects.filter((s) => s.classId === selectedSubjectClassFilter)
                    ).map((sub) => {
                      const classNameStr = classes.find((c) => c.id === sub.classId)?.name || sub.classId;
                      return (
                        <div
                          key={sub.id}
                          className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all min-h-[110px]"
                        >
                          {sub.imageUrl && (
                            <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
                              <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                            </div>
                          )}

                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800/90 text-teal-300 border border-teal-500/20 shadow-xs">
                                {classNameStr}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-xs ${
                                sub.group === "science"
                                  ? "bg-purple-950/80 text-purple-300 border-purple-500/30"
                                  : sub.group === "commerce"
                                  ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                                  : sub.group === "arts"
                                  ? "bg-rose-950/80 text-rose-300 border-rose-500/30"
                                  : "bg-slate-800/90 text-slate-400 border-slate-700"
                              }`}>
                                {sub.group === "science" ? "🧪 বিজ্ঞান" : sub.group === "commerce" ? "📊 ব্যবসায়" : sub.group === "arts" ? "🎨 মানবিক" : "🌐 সকল"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-3 w-3 rounded-full shadow" style={{ background: sub.color || "#0D9488" }} />
                              <button
                                onClick={() => setEditingSubject(sub)}
                                title="এডিট করুন"
                                className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500 transition-all opacity-0 group-hover:opacity-100 shadow"
                              >
                                <Edit3 width={11} height={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id)}
                                title="ডিলিট করুন"
                                className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500 transition-all opacity-0 group-hover:opacity-100 shadow"
                              >
                                <Trash2 width={11} height={11} />
                              </button>
                            </div>
                          </div>
                          <div className="relative z-10 pt-1">
                            <h3 className="text-lg font-black text-white drop-shadow-sm">{sub.name}</h3>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {sub.id} · Slug: /{sub.slug}</p>
                            {sub.sections && sub.sections.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-2">
                                <span className="text-[9px] font-bold text-slate-500">সেকশন:</span>
                                {sub.sections.map((sec) => (
                                  <span key={sec} className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                                    {sec}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── CHAPTER MANAGEMENT SECTION ── */}
                  <div className="mt-6 pt-5 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                          <FileCode width={18} height={18} className="text-amber-400" />
                          অধ্যায় ম্যানেজমেন্ট ({allChapters.length}টি অধ্যায়)
                        </h2>
                        <p className="text-[10px] text-slate-500">নির্দিষ্ট বিষয়ের আন্ডারে অধ্যায় তৈরি, সম্পাদনা এবং মুছুন</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* CLASS FILTER */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-indigo-500/30 rounded-xl px-2.5 py-1">
                          <span className="text-[11px] font-bold text-indigo-400">🏫 ক্লাস:</span>
                          <select
                            value={chapterClassFilter}
                            onChange={(e) => { setChapterClassFilter(e.target.value); setChapterSubjectFilter("all"); }}
                            className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer max-w-[130px]"
                          >
                            <option value="all" className="bg-slate-900 text-white">সকল ক্লাস</option>
                            {classes.map((cls) => {
                              const subjectsInClass = subjects.filter((s) => s.classId === cls.id);
                              const chaptersInClass = allChapters.filter((c) => subjectsInClass.some((s) => s.id === c.subjectId)).length;
                              return (
                                <option key={cls.id} value={cls.id} className="bg-slate-900 text-white">
                                  {cls.name} ({subjectsInClass.length}টি বিষয়, {chaptersInClass}টি অধ্যায়)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        {/* SUBJECT FILTER */}
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                          <span className="text-[11px] font-bold text-slate-400">📚 বিষয়:</span>
                          <select
                            value={chapterSubjectFilter}
                            onChange={(e) => setChapterSubjectFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer max-w-[180px]"
                          >
                            <option value="all" className="bg-slate-900 text-white">সকল বিষয়</option>
                            {(chapterClassFilter === "all" ? subjects : subjects.filter((s) => s.classId === chapterClassFilter)).map((s) => {
                              const count = allChapters.filter((c) => c.subjectId === s.id).length;
                              return (
                                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                  {s.name} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <button
                          onClick={() => handleOpenAddChapter(chapterSubjectFilter !== "all" ? chapterSubjectFilter : undefined)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                        >
                          <Plus width={13} height={13} /> নতুন অধ্যায় যোগ করুন
                        </button>
                      </div>
                    </div>

                    {/* CLASS OVERVIEW PILLS — show when class filter is active */}
                    {chapterClassFilter !== "all" && (() => {
                      const subjectsInClass = subjects.filter((s) => s.classId === chapterClassFilter);
                      const className = classes.find((c) => c.id === chapterClassFilter)?.name || chapterClassFilter;
                      return (
                        <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/25 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold text-indigo-300 shrink-0">🏫 {className}-এ যুক্ত বিষয়সমূহ:</span>
                          {subjectsInClass.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">কোনো বিষয় নেই</span>
                          ) : (
                            subjectsInClass.map((s) => {
                              const count = allChapters.filter((c) => c.subjectId === s.id).length;
                              const isActive = chapterSubjectFilter === s.id;
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => setChapterSubjectFilter(isActive ? "all" : s.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all border ${
                                    isActive
                                      ? "bg-amber-500/30 text-amber-200 border-amber-400/60 shadow shadow-amber-500/20"
                                      : "bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-amber-300"
                                  }`}
                                >
                                  {s.imageUrl && (
                                    <img src={s.imageUrl} alt={s.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                                  )}
                                  <span style={{ color: s.color || undefined }}>{s.name}</span>
                                  <span className="text-slate-500 font-bold">({count})</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      );
                    })()}

                    {(() => {
                      const classFilteredSubjectIds = chapterClassFilter === "all"
                        ? null
                        : subjects.filter((s) => s.classId === chapterClassFilter).map((s) => s.id);

                      const filteredChapters = allChapters.filter((c) => {
                        if (classFilteredSubjectIds && !classFilteredSubjectIds.includes(c.subjectId)) return false;
                        if (chapterSubjectFilter !== "all" && c.subjectId !== chapterSubjectFilter) return false;
                        return true;
                      });

                      if (filteredChapters.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl bg-slate-900 border border-slate-800 border-dashed">
                            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                              <FileCode width={22} height={22} className="text-slate-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">
                              {chapterSubjectFilter === "all" ? "এখনো কোনো অধ্যায় নেই" : "এই বিষয়ে কোনো অধ্যায় নেই"}
                            </p>
                            <button
                              onClick={() => handleOpenAddChapter(chapterSubjectFilter !== "all" ? chapterSubjectFilter : undefined)}
                              className="mt-1 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-500 transition-all flex items-center gap-1.5"
                            >
                              <Plus width={13} height={13} /> প্রথম অধ্যায় যোগ করুন
                            </button>
                          </div>
                        );
                      }

                      // Group chapters by subject
                      const groupedBySubject: Record<string, AdminChapter[]> = {};
                      filteredChapters.forEach((ch) => {
                        if (!groupedBySubject[ch.subjectId]) groupedBySubject[ch.subjectId] = [];
                        groupedBySubject[ch.subjectId].push(ch);
                      });

                      return (
                        <div className="space-y-4">
                          {Object.entries(groupedBySubject).map(([subId, chaps]) => {
                            const sub = subjects.find((s) => s.id === subId);
                            const sortedChaps = [...chaps].sort((a, b) => a.chapterNo - b.chapterNo);
                            return (
                              <div key={subId} className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
                                {/* Subject Header with Image */}
                                <div className="relative overflow-hidden">
                                  {sub?.imageUrl && (
                                    <div className="absolute inset-0 z-0">
                                      <img src={sub.imageUrl} alt={sub?.name || ""} className="w-full h-full object-cover opacity-15" />
                                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent" />
                                    </div>
                                  )}
                                  <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                      {sub?.imageUrl ? (
                                        <div className="h-9 w-9 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: sub?.color || "#0D9488" }}>
                                          <img src={sub.imageUrl} alt={sub?.name || ""} className="w-full h-full object-cover" />
                                        </div>
                                      ) : (
                                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: (sub?.color || "#0D9488") + "33", border: `2px solid ${sub?.color || "#0D9488"}55` }}>
                                          <div className="h-3 w-3 rounded-full" style={{ background: sub?.color || "#0D9488" }} />
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-xs font-extrabold text-white">{sub?.name || subId}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className="text-[9px] font-bold text-slate-500">{sortedChaps.length}টি অধ্যায়</span>
                                          {sub?.classId && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                                              {classes.find((c) => c.id === sub.classId)?.name || sub.classId}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleOpenAddChapter(subId)}
                                      className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg hover:bg-amber-500/20 transition-all"
                                    >
                                      <Plus width={10} height={10} /> অধ্যায় যোগ
                                    </button>
                                  </div>
                                </div>
                                <div className="divide-y divide-slate-800/60">
                                  {sortedChaps.map((ch) => (
                                    <div key={ch.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/40 transition-colors group">
                                      <div className="flex items-center gap-3">
                                        <span className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-black flex items-center justify-center border border-amber-500/20">
                                          {ch.chapterNo}
                                        </span>
                                        <div>
                                          <p className="text-xs font-bold text-white">{ch.name}</p>
                                          <p className="text-[9px] text-slate-500 font-mono">ID: {ch.id}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => handleOpenEditChapter(ch)}
                                          className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500 transition-all"
                                          title="সম্পাদনা"
                                        >
                                          <Edit3 width={11} height={11} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteChapter(ch.id)}
                                          className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500 transition-all"
                                          title="মুছুন"
                                        >
                                          <Trash2 width={11} height={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* USERS TABLE WITH RBAC ROLE MANAGEMENT */}
              {activeNav === "users" && (() => {
                const adminCount = users.filter((u) =>
                  ["super_admin", "admin", "moderator", "content_creator"].includes((u.role || "").toLowerCase())
                ).length;
                const generalUserCount = users.length - adminCount;

                const filteredUsers = users.filter((u) => {
                  const role = (u.role || "").toLowerCase();
                  const isAdminRole = ["super_admin", "admin", "moderator", "content_creator"].includes(role);
                  if (userRoleFilter === "admin") return isAdminRole;
                  if (userRoleFilter === "user") return !isAdminRole;
                  return true;
                });

                return (
                  <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80">
                      <div>
                        <p className="text-sm font-extrabold text-white">ইউজার ও রোল অ্যাক্সেস ম্যানেজমেন্ট ({filteredUsers.length} / {users.length})</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">রোল-বেজড ফিল্টার ও অ্যাক্সেস কন্ট্রোল</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Role Filter Buttons */}
                        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/70 text-[10px] font-bold">
                          <button
                            onClick={() => setUserRoleFilter("all")}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              userRoleFilter === "all" ? "bg-teal-500 text-white font-black shadow-xs" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            সবাই ({users.length})
                          </button>
                          <button
                            onClick={() => setUserRoleFilter("admin")}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              userRoleFilter === "admin" ? "bg-amber-500 text-white font-black shadow-xs" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Shield width={10} height={10} /> অ্যাডমিন ({adminCount})
                          </button>
                          <button
                            onClick={() => setUserRoleFilter("user")}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              userRoleFilter === "user" ? "bg-indigo-500 text-white font-black shadow-xs" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Users width={10} height={10} /> সাধারণ ইউজার ({generalUserCount})
                          </button>
                        </div>

                        {currentUserRole === "super_admin" && (
                          <button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-1 text-[10px] font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg hover:bg-teal-500/20 transition-all cursor-pointer">
                            <Plus width={10} height={10} /> ইউজার যোগ করুন
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b border-slate-800/60">
                            {["ইউজার", "ক্লাস", "XP / স্ট্রিক", "অ্যাডমিন রোল (Role)", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                              <th key={h} className="px-4 py-2.5 text-left text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {usersLoading ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-12 text-center text-xs text-teal-400 font-bold">
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 width={20} height={20} className="animate-spin text-teal-400" />
                                  ইউজার তালিকা লোড হচ্ছে...
                                </div>
                              </td>
                            </tr>
                          ) : filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400 font-bold">
                                এই ফিল্টারে কোনো ইউজার পাওয়া যায়নি।
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((u, idx) => {
                              const userRole = u.role || "user";
                              return (
                            <tr key={u.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/40 transition-colors group">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-xs">
                                    {u.avatarUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={u.avatarUrl}
                                        alt={u.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className={`h-full w-full flex items-center justify-center text-xs font-black ${["bg-teal-900 text-teal-300","bg-indigo-900 text-indigo-300","bg-rose-900 text-rose-300","bg-amber-900 text-amber-300"][idx % 4]}`}>
                                        {(u.name || "U").slice(0, 1).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">{u.name}</p>
                                    <p className="text-[9px] text-slate-500">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-[11px] text-slate-400 font-medium">{u.class}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2 text-[10px] font-black">
                                  <span className="text-teal-400 flex items-center gap-0.5">
                                    <Star width={9} height={9} className="fill-teal-400" /> {u.xp || 0}
                                  </span>
                                  <span className="text-orange-400 flex items-center gap-0.5">
                                    <Flame width={9} height={9} className="fill-orange-400" /> {u.streak || 0}d
                                  </span>
                                </div>
                              </td>

                              {/* Role Badge Column */}
                              <td className="px-4 py-2.5">
                                {userRole === "super_admin" ? (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 w-fit shadow-xs">
                                    <Crown width={10} height={10} className="text-amber-300 fill-amber-300" /> Super Admin
                                  </span>
                                ) : userRole === "admin" ? (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 w-fit shadow-xs">
                                    <Shield width={10} height={10} className="text-teal-400" /> Admin
                                  </span>
                                ) : userRole === "moderator" ? (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit shadow-xs">
                                    <Zap width={10} height={10} className="text-amber-400" /> Moderator
                                  </span>
                                ) : userRole === "content_creator" ? (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 w-fit shadow-xs">
                                    <Edit3 width={10} height={10} className="text-indigo-400" /> Editor
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-fit">
                                    <Users width={9} height={9} /> User
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-2.5">
                                <button
                                  onClick={() => toggleUserStatus(u.id, u.status)}
                                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                    u.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                  }`}
                                >
                                  {u.status === "active" ? "• অ্যাক্টিভ" : "✕ ব্যানড"}
                                </button>
                              </td>

                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  {currentUserRole === "super_admin" && (
                                    <button
                                      onClick={() => {
                                        setRoleModalUser(u);
                                        setSelectedRole((u.role as any) || "user");
                                      }}
                                      title="রোল পরিবর্তন করুন"
                                      className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Shield width={10} height={10} /> রোল
                                    </button>
                                  )}
                                  <button onClick={() => toggleUserStatus(u.id, u.status)} title="স্ট্যাটাস টগল" className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all cursor-pointer">
                                    <RefreshCw width={11} height={11} />
                                  </button>
                                  {currentUserRole === "super_admin" && (
                                    <button onClick={() => handleDeleteUser(u.id)} title="মুছে ফেলুন" className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all cursor-pointer">
                                      <Trash2 width={11} height={11} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                            })
                          )}
                        </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

              {/* ========================================================= */}
              {/* ===== ADMIN ACTIVITY & AUDIT LOGS SECTION ===== */}
              {/* ========================================================= */}
              {activeNav === "activity" && (() => {
                const distinctAdmins = Array.from(
                  new Map(
                    activityLogs.map((log) => [
                      log.adminEmail || log.adminId,
                      { name: log.adminName || "অ্যাডমিন", email: log.adminEmail || "", id: log.adminId || "" },
                    ])
                  ).values()
                );

                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const todayLogsCount = activityLogs.filter((log) => {
                  if (!log.timestamp) return false;
                  const logDate =
                    typeof log.timestamp?.toDate === "function"
                      ? log.timestamp.toDate()
                      : new Date(log.timestamp);
                  return logDate >= todayStart;
                }).length;

                // Most active admin calculation
                const adminCounts: Record<string, { name: string; count: number }> = {};
                activityLogs.forEach((l) => {
                  const key = l.adminEmail || l.adminName || "অ্যাডমিন";
                  if (!adminCounts[key]) {
                    adminCounts[key] = { name: l.adminName || key, count: 0 };
                  }
                  adminCounts[key].count += 1;
                });
                const topAdmin = Object.values(adminCounts).sort((a, b) => b.count - a.count)[0];

                const filteredActivityLogs = activityLogs.filter((log) => {
                  if (activityAdminFilter !== "all") {
                    if (log.adminId !== activityAdminFilter && log.adminEmail !== activityAdminFilter) {
                      return false;
                    }
                  }
                  if (activityEntityFilter !== "all" && log.entityType !== activityEntityFilter) {
                    return false;
                  }
                  if (activityActionFilter !== "all" && log.action !== activityActionFilter) {
                    return false;
                  }
                  if (activitySearchQuery.trim()) {
                    const q = activitySearchQuery.toLowerCase();
                    const matchName = log.adminName?.toLowerCase().includes(q);
                    const matchEmail = log.adminEmail?.toLowerCase().includes(q);
                    const matchEntity = log.entityName?.toLowerCase().includes(q);
                    const matchDetails = log.details?.toLowerCase().includes(q);
                    const matchAction = ACTION_LABELS[log.action]?.toLowerCase().includes(q);
                    const matchEntityType = ENTITY_LABELS[log.entityType]?.toLowerCase().includes(q);
                    if (!matchName && !matchEmail && !matchEntity && !matchDetails && !matchAction && !matchEntityType) {
                      return false;
                    }
                  }
                  return true;
                });

                return (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Header Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-950/50 border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                            <Activity width={18} height={18} />
                          </div>
                          <h2 className="text-base font-black text-white">অ্যাডমিন অ্যাক্টিভিটি ও অডিট লগ</h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Audit Trail
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          কোন অ্যাডমিন কখন কী পরিবর্তন (যোগ, আপডেট, ডিলিট, লাইভ টগল, রোল চেঞ্জ) করেছেন তার বিস্তারিত রিয়েল-টাইম রেকর্ড।
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={fetchActivityLogs}
                          disabled={activityLoading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          <RefreshCw width={14} height={14} className={activityLoading ? "animate-spin text-teal-400" : "text-teal-400"} />
                          <span>{activityLoading ? "রিফ্রেশ হচ্ছে..." : "লগ রিফ্রেশ"}</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                      {/* Stat 1: Total Logs */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 relative overflow-hidden">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                          <span>মোট কার্যক্রম</span>
                          <BarChart3 width={15} height={15} className="text-teal-400" />
                        </div>
                        <p className="text-2xl font-black text-white">{activityLogs.length}</p>
                        <p className="text-[10px] text-slate-500">সর্বমোট অডিট লগ এন্ট্রি</p>
                      </div>

                      {/* Stat 2: Active Admins */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 relative overflow-hidden">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                          <span>অ্যাক্টিভ অ্যাডমিন</span>
                          <Users width={15} height={15} className="text-indigo-400" />
                        </div>
                        <p className="text-2xl font-black text-indigo-400">{distinctAdmins.length} জন</p>
                        <p className="text-[10px] text-slate-500">কার্যক্রম পরিচালনা করেছেন</p>
                      </div>

                      {/* Stat 3: Today's Actions */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 relative overflow-hidden">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                          <span>আজকের পরিবর্তন</span>
                          <Flame width={15} height={15} className="text-amber-400 fill-amber-400" />
                        </div>
                        <p className="text-2xl font-black text-amber-400">{todayLogsCount} টি</p>
                        <p className="text-[10px] text-slate-500">আজকে সম্পন্ন অ্যাকশন</p>
                      </div>

                      {/* Stat 4: Top Contributor */}
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 relative overflow-hidden">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                          <span>সর্বাধিক সক্রিয়</span>
                          <Crown width={15} height={15} className="text-purple-400 fill-purple-400" />
                        </div>
                        <p className="text-sm font-black text-purple-300 truncate">
                          {topAdmin ? topAdmin.name : "—"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {topAdmin ? `${topAdmin.count}টি অ্যাকশন সম্পন্ন` : "কোনো অ্যাকশন নেই"}
                        </p>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[180px] max-w-sm">
                          <Search width={14} height={14} className="absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="অ্যাডমিন, বিষয়, কুইজ দিয়ে খুঁজুন..."
                            value={activitySearchQuery}
                            onChange={(e) => setActivitySearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                          />
                          {activitySearchQuery && (
                            <button
                              onClick={() => setActivitySearchQuery("")}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                            >
                              <X width={14} height={14} />
                            </button>
                          )}
                        </div>

                        {/* Admin Filter Dropdown */}
                        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
                          <Users width={13} height={13} className="text-slate-400" />
                          <select
                            value={activityAdminFilter}
                            onChange={(e) => setActivityAdminFilter(e.target.value)}
                            className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-2"
                          >
                            <option value="all" className="bg-slate-900 text-slate-300">
                              👤 সব অ্যাডমিন ({distinctAdmins.length})
                            </option>
                            {distinctAdmins.map((adm) => (
                              <option key={adm.email || adm.id} value={adm.id || adm.email} className="bg-slate-900 text-slate-200">
                                {adm.name} {adm.email ? `(${adm.email})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Entity Type Filter */}
                        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
                          <BookOpen width={13} height={13} className="text-slate-400" />
                          <select
                            value={activityEntityFilter}
                            onChange={(e) => setActivityEntityFilter(e.target.value)}
                            className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-2"
                          >
                            <option value="all" className="bg-slate-900 text-slate-300">📂 সব বিভাগ</option>
                            <option value="quiz" className="bg-slate-900 text-slate-200">📝 কুইজ (Quiz)</option>
                            <option value="question" className="bg-slate-900 text-slate-200">❓ প্রশ্ন (Question)</option>
                            <option value="subject" className="bg-slate-900 text-slate-200">📚 বিষয় (Subject)</option>
                            <option value="chapter" className="bg-slate-900 text-slate-200">📖 অধ্যায় (Chapter)</option>
                            <option value="mission" className="bg-slate-900 text-slate-200">🎯 দৈনিক মিশন (Mission)</option>
                            <option value="banner" className="bg-slate-900 text-slate-200">🖼️ ব্যানার (Banner)</option>
                            <option value="user" className="bg-slate-900 text-slate-200">👤 ইউজার ও রোল (User)</option>
                            <option value="settings" className="bg-slate-900 text-slate-200">⚙️ সেটিংস (Settings)</option>
                          </select>
                        </div>

                        {/* Action Type Filter */}
                        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
                          <Zap width={13} height={13} className="text-slate-400" />
                          <select
                            value={activityActionFilter}
                            onChange={(e) => setActivityActionFilter(e.target.value)}
                            className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer pr-2"
                          >
                            <option value="all" className="bg-slate-900 text-slate-300">⚡ সব অ্যাকশন</option>
                            <option value="create" className="bg-slate-900 text-slate-200">➕ তৈরি (Create)</option>
                            <option value="update" className="bg-slate-900 text-slate-200">✏️ আপডেট (Update)</option>
                            <option value="delete" className="bg-slate-900 text-slate-200">🗑️ মুছে ফেলা (Delete)</option>
                            <option value="toggle_live" className="bg-slate-900 text-slate-200">🔴 লাইভ টগল (Live Toggle)</option>
                            <option value="role_change" className="bg-slate-900 text-slate-200">🛡️ রোল পরিবর্তন (Role Change)</option>
                            <option value="status_change" className="bg-slate-900 text-slate-200">🔄 স্ট্যাটাস পরিবর্তন (Status Change)</option>
                            <option value="bulk_upload" className="bg-slate-900 text-slate-200">📦 বাল্ক আপলোড (Bulk Upload)</option>
                            <option value="reset" className="bg-slate-900 text-slate-200">🔄 রিসেট (Reset)</option>
                          </select>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      {(activityAdminFilter !== "all" ||
                        activityEntityFilter !== "all" ||
                        activityActionFilter !== "all" ||
                        activitySearchQuery.trim() !== "") && (
                        <button
                          onClick={() => {
                            setActivityAdminFilter("all");
                            setActivityEntityFilter("all");
                            setActivityActionFilter("all");
                            setActivitySearchQuery("");
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X width={12} height={12} /> ফিল্টার রিসেট
                        </button>
                      )}
                    </div>

                    {/* Activity Logs Table */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      {activityLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                          <Loader2 width={28} height={28} className="animate-spin text-teal-400" />
                          <p className="text-xs font-bold">অ্যাক্টিভিটি লগ লোড হচ্ছে...</p>
                        </div>
                      ) : filteredActivityLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <Activity width={24} height={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-300">কোনো অ্যাক্টিভিটি লগ পাওয়া যায়নি</p>
                          <p className="text-xs text-slate-500 max-w-xs text-center">
                            অ্যাডমিন প্যানেল থেকে কোনো পরিবর্তন করা হলে তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto no-scrollbar">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3">অ্যাডমিন (Admin)</th>
                                <th className="px-4 py-3">অ্যাকশন ও বিভাগ (Action)</th>
                                <th className="px-4 py-3">টার্গেট ও বিস্তারিত বিবরণ (Details)</th>
                                <th className="px-4 py-3 text-right">সময় (Timestamp)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs">
                              {filteredActivityLogs.map((log) => {
                                const actionColor =
                                  ACTION_COLORS[log.action] || "text-slate-300 bg-slate-800 border-slate-700";
                                const actionLabel = ACTION_LABELS[log.action] || log.action;
                                const entityIcon = ENTITY_ICONS[log.entityType] || "📁";
                                const entityLabel = ENTITY_LABELS[log.entityType] || log.entityType;
                                const entityColor = ENTITY_COLORS[log.entityType] || "text-slate-300";

                                return (
                                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                                    {/* Admin Column */}
                                    <td className="px-4 py-3 align-top">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md flex-shrink-0">
                                          {(log.adminName || log.adminEmail || "A").substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-black text-white truncate">
                                            {log.adminName || "অ্যাডমিন"}
                                          </p>
                                          <p className="text-[10px] text-slate-400 font-mono truncate">
                                            {log.adminEmail || log.adminId || "system"}
                                          </p>
                                          {log.adminRole && (
                                            <span className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                                              {log.adminRole.replace("_", " ")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Action & Category Column */}
                                    <td className="px-4 py-3 align-top">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${actionColor}`}>
                                            {actionLabel}
                                          </span>
                                          <span className={`text-[11px] font-bold flex items-center gap-1 ${entityColor}`}>
                                            <span>{entityIcon}</span>
                                            <span>{entityLabel}</span>
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Target Name & Details Column */}
                                    <td className="px-4 py-3 align-top">
                                      <div className="space-y-0.5 max-w-md">
                                        <p className="text-xs font-extrabold text-slate-100 break-words">
                                          {log.entityName || "—"}
                                        </p>
                                        {log.details && (
                                          <p className="text-[11px] text-slate-400 font-medium break-words bg-slate-800/40 px-2 py-1 rounded-lg border border-slate-800">
                                            ℹ️ {log.details}
                                          </p>
                                        )}
                                      </div>
                                    </td>

                                    {/* Time Column */}
                                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                                      <div className="space-y-0.5">
                                        <span className="text-[10.5px] font-black px-2 py-0.5 rounded-md bg-slate-800/80 text-teal-300 border border-slate-700/80 inline-block font-mono">
                                          ⏱️ {formatRelativeTime(log.timestamp)}
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                          {formatFullDateTime(log.timestamp)}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>
      </div>

      {/* ===== MODAL: CREATE / EDIT QUIZ & LIVE EXAM (WITH JSON QUESTION IMPORTER) ===== */}
      {isAddQuizOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <ListChecks width={18} height={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {editingQuiz ? "কুইজ / লাইভ এক্সাম এডিট করুন" : "নতুন কুইজ / লাইভ পরীক্ষা তৈরি"}
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    ক্লাস সিলেক্ট করে JSON ফরম্যাটে প্রশ্ন যুক্ত করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddQuizOpen(false);
                  setEditingQuiz(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X width={18} height={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveQuiz} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              {/* Quiz Title */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  কুইজ / পরীক্ষার টাইটেল <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নবম শ্রেণী বিজ্ঞান - অধ্যায় ১ বিশেষ লাইভ কুইজ"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Class, Subject, Chapter Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Class */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">১. টার্গেট ক্লাস (Class)</label>
                  <select
                    value={quizForm.classId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const subsInClass = newCls === "all" ? subjects : subjects.filter((s) => s.classId === newCls);
                      const newSub = subsInClass.some((s) => s.id === quizForm.subjectId) ? quizForm.subjectId : "";
                      setQuizForm({ ...quizForm, classId: newCls, subjectId: newSub, chapterId: "" });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-teal-400 font-bold focus:outline-none focus:border-teal-500"
                  >
                    <option value="all">সকল ক্লাস (All Classes)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Subject */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">২. বিষয় (Subject)</label>
                  <select
                    value={quizForm.subjectId}
                    onChange={(e) => setQuizForm({ ...quizForm, subjectId: e.target.value, chapterId: "" })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">বিষয় নির্বাচন করুন</option>
                    {(quizForm.classId === "all"
                      ? subjects
                      : subjects.filter((s) => s.classId === quizForm.classId)
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Chapter */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">৩. অধ্যায় (ঐচ্ছিক)</label>
                  <select
                    value={quizForm.chapterId}
                    onChange={(e) => setQuizForm({ ...quizForm, chapterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-bold focus:outline-none"
                  >
                    <option value="">সম্পূর্ণ বিষয় / সকল অধ্যায়</option>
                    {(() => {
                      const selSub = subjects.find((s) => s.id === quizForm.subjectId);
                      const selSubId = (quizForm.subjectId || "").toLowerCase().trim();
                      const selSlug = (selSub?.slug || "").toLowerCase().trim();
                      const list = allChapters.filter((ch) => {
                        const chSub = (ch.subjectId || "").toLowerCase().trim();
                        if (!chSub) return false;
                        return chSub === selSubId || (selSlug && chSub === selSlug) || (selSub && ch.subjectId === selSub.id);
                      });
                      const seen = new Set<string>();
                      return list
                        .filter((ch) => {
                          const key = `${ch.chapterNo}_${(ch.name || "").trim().toLowerCase()}`;
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        })
                        .sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0))
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            অধ্যায় {ch.chapterNo}: {ch.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>

              {/* Status & Live Exam Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Status Mode */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">এক্সাম মোড ও স্ট্যাটাস</label>
                    <select
                      value={quizForm.status}
                      onChange={(e) => setQuizForm({ ...quizForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-black focus:outline-none"
                    >
                      <option value="published">● সাধারণ পাবলিশড (Published)</option>
                      <option value="live">🔴 লাইভ এক্সাম (Live Now)</option>
                      <option value="scheduled">🕒 শিডিউল (Scheduled)</option>
                      <option value="draft">📝 ড্রাফট (Draft)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">সময় সীমা (মিনিট)</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                    />
                  </div>

                  {/* Negative Marking Toggle */}
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={quizForm.negativeMarking}
                        onChange={(e) => setQuizForm({ ...quizForm, negativeMarking: e.target.checked })}
                        className="rounded accent-rose-500 w-4 h-4"
                      />
                      <span className="text-[11px] font-bold text-slate-300">
                        নেগেটিভ মার্কিং চালু
                      </span>
                    </label>
                  </div>
                </div>

                {/* Scheduled Start and End Timings (if scheduled) */}
                {quizForm.status === "scheduled" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        🕒 শুরুর সময় (Start Date & Time)
                      </label>
                      <input
                        type="datetime-local"
                        value={quizForm.startTime}
                        onChange={(e) => setQuizForm({ ...quizForm, startTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">
                        🏁 সমাপ্তির সময় (End Date & Time)
                      </label>
                      <input
                        type="datetime-local"
                        value={quizForm.endTime}
                        onChange={(e) => setQuizForm({ ...quizForm, endTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* JSON Questions Importer */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileJson width={15} height={15} className="text-purple-400" />
                    <label className="text-slate-200 font-extrabold text-xs">
                      কুইজ প্রশ্নসমূহ (JSON Importer)
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleLoadSampleJson}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-[10.5px] font-bold transition-all border border-slate-700 cursor-pointer"
                    >
                      📝 নমুনা JSON লোড
                    </button>

                    <label className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-[10.5px] font-bold transition-all border border-purple-500/30 cursor-pointer flex items-center gap-1">
                      <Upload width={11} height={11} />
                      <span>.JSON ফাইল</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <textarea
                  rows={8}
                  placeholder={`[\n  {\n    "questionText": "বাংলাদেশের রাজধানী কোনটি?",\n    "options": ["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী"],\n    "correctAnswer": 0,\n    "explanation": "ঢাকা বাংলাদেশের রাজধানী।"\n  }\n]`}
                  value={quizForm.jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-emerald-400 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-purple-500"
                />

                {/* Validation Info Badge */}
                {quizForm.jsonError ? (
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
                    <AlertTriangle width={14} height={14} className="flex-shrink-0 text-rose-400" />
                    <span>{quizForm.jsonError}</span>
                  </div>
                ) : quizForm.parsedQuestions.length > 0 ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 width={14} height={14} className="text-emerald-400" />
                      <span>✅ {quizForm.parsedQuestions.length}টি প্রশ্ন সঠিকভাবে শনাক্ত হয়েছে!</span>
                    </div>
                    <span className="text-[10px] text-slate-400">নিচে প্রিভিউ দেখে নিন</span>
                  </div>
                ) : null}

                {/* Visual Questions Preview */}
                {quizForm.parsedQuestions.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      প্রশ্ন প্রিভিউ ({quizForm.parsedQuestions.length}টি প্রশ্ন):
                    </p>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {quizForm.parsedQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                            <p className="font-extrabold text-white">{q.questionText}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pl-7">
                            {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`px-2 py-1 rounded-lg text-[10.5px] flex items-center justify-between ${
                                  oIdx === q.correctAnswer
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                                    : "bg-slate-900 text-slate-400 border border-slate-800"
                                }`}
                              >
                                <span>{typeof opt === "object" && opt !== null ? String((opt as any).text || "") : String(opt ?? "")}</span>
                                {oIdx === q.correctAnswer && (
                                  <Check width={12} height={12} className="text-emerald-400" />
                                )}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <p className="text-[10px] text-slate-400 pl-7">
                              💡 <span className="font-bold text-slate-300">ব্যাখ্যা:</span> {String(q.explanation)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddQuizOpen(false);
                    setEditingQuiz(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
                >
                  {editingQuiz ? "আপডেট করুন ✨" : "Firebase-এ সংরক্ষণ করুন 🔥"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: QUESTION VIEWER ===== */}
      {viewingQuizQuestions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Eye width={16} height={16} className="text-indigo-400" />
                  {viewingQuizQuestions.title || viewingQuizQuestions.name}
                </h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  মোট প্রশ্ন: {viewingQuizQuestions.questions?.length || viewingQuizQuestions.questionsCount || 0}টি
                </p>
              </div>
              <button
                onClick={() => setViewingQuizQuestions(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X width={18} height={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {!viewingQuizQuestions.questions || viewingQuizQuestions.questions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <p>এই কুইজে এখনো কোনো সংরক্ষিত প্রশ্ন নেই।</p>
                  <button
                    onClick={() => {
                      const q = viewingQuizQuestions;
                      setViewingQuizQuestions(null);
                      handleOpenEditQuiz(q);
                    }}
                    className="mt-2 text-teal-400 underline font-bold"
                  >
                    প্রশ্ন যোগ করতে এডিট করুন
                  </button>
                </div>
              ) : (
                viewingQuizQuestions.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="font-extrabold text-white leading-relaxed">
                        {q.questionText || (q as any).question}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {(Array.isArray(q.options) ? q.options : []).map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between ${
                            oIdx === q.correctAnswer
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}
                        >
                          <span>{typeof opt === "object" && opt !== null ? String((opt as any).text || "") : String(opt ?? "")}</span>
                          {oIdx === q.correctAnswer && (
                            <Check width={14} height={14} className="text-emerald-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 pl-8">
                        💡 <span className="font-bold text-slate-300">ব্যাখ্যা:</span> {String(q.explanation)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingQuizQuestions(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: BULK JSON QUESTION UPLOAD ===== */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Upload width={16} height={16} className="text-purple-400" />
                অধ্যায়ভিত্তিক JSON Bulk Question Upload
              </h3>
              <button onClick={() => setIsBulkUploadOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Class Select */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস (Class)</label>
                  <select
                    value={bulkMeta.classId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const filteredSubs = subjects.filter((s) => s.classId === newCls);
                      const subForCls = filteredSubs[0]?.id || "";
                      setBulkMeta({
                        ...bulkMeta,
                        classId: newCls,
                        subjectId: subForCls,
                        chapterId: "",
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-teal-400 font-bold focus:outline-none focus:border-purple-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Select */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">২. বিষয় (Subject)</label>
                  <select
                    value={bulkMeta.subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setBulkMeta({ ...bulkMeta, subjectId: newSub, chapterId: "" });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold focus:outline-none focus:border-purple-500"
                  >
                    {(() => {
                      const filteredSubs = subjects.filter(
                        (s) => !bulkMeta.classId || s.classId === bulkMeta.classId
                      );
                      if (filteredSubs.length === 0) {
                        return <option value="">কোনো বিষয় নেই</option>;
                      }
                      return filteredSubs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                {/* Chapter Select (Requested Feature) */}
                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">৩. অধ্যায় (Chapter)</label>
                  <select
                    value={bulkMeta.chapterId}
                    onChange={(e) => setBulkMeta({ ...bulkMeta, chapterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="">অধ্যায় সিলেক্ট করুন (ঐচ্ছিক)</option>
                    {(() => {
                      const selSub = subjects.find((s) => s.id === bulkMeta.subjectId);
                      const selSubId = (bulkMeta.subjectId || "").toLowerCase().trim();
                      const selSlug = (selSub?.slug || "").toLowerCase().trim();
                      const list = allChapters.filter((c) => {
                        const chSub = (c.subjectId || "").toLowerCase().trim();
                        if (!chSub) return false;
                        return chSub === selSubId || (selSlug && chSub === selSlug) || (selSub && c.subjectId === selSub.id);
                      });
                      const seen = new Set<string>();
                      return list
                        .filter((ch) => {
                          const key = `${ch.chapterNo}_${(ch.name || "").trim().toLowerCase()}`;
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        })
                        .sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0))
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            অধ্যায় {ch.chapterNo}: {ch.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-bold">JSON অ্যারেকে এখানে পেস্ট করুন:</label>
                  <button
                    type="button"
                    onClick={() => setBulkJsonInput(sampleJsonTemplate)}
                    className="text-[10px] text-purple-400 underline hover:text-purple-300"
                  >
                    নমুনা JSON টেমপ্লেট বসান
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={bulkJsonInput}
                  onChange={(e) => setBulkJsonInput(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 bg-slate-955 border border-slate-800 rounded-xl text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsBulkUploadOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg flex items-center gap-1.5">
                  <Upload width={14} height={14} /> Bulk Upload করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: SINGLE QUESTION ADD (NEW FEATURE) ===== */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Plus width={16} height={16} className="text-teal-400" />
                নতুন প্রশ্ন ম্যানুয়ালি যোগ করুন
              </h3>
              <button onClick={() => setIsAddQuestionOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস</label>
                  <select
                    value={newQuestion.classId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const filteredSubs = subjects.filter((s) => s.classId === newCls);
                      const subForCls = filteredSubs[0]?.id || "";
                      setNewQuestion({
                        ...newQuestion,
                        classId: newCls,
                        subjectId: subForCls,
                        chapterId: "",
                      });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-teal-400 font-bold focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">২. বিষয়</label>
                  <select
                    value={newQuestion.subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setNewQuestion({ ...newQuestion, subjectId: newSub, chapterId: "" });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold focus:outline-none"
                  >
                    {(() => {
                      const filteredSubs = subjects.filter(
                        (s) => !newQuestion.classId || s.classId === newQuestion.classId
                      );
                      if (filteredSubs.length === 0) {
                        return <option value="">কোনো বিষয় নেই</option>;
                      }
                      return filteredSubs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">৩. অধ্যায়</label>
                  <select
                    value={newQuestion.chapterId}
                    onChange={(e) => setNewQuestion({ ...newQuestion, chapterId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="">অধ্যায় নির্বাচন করুন (ঐচ্ছিক)</option>
                    {(() => {
                      const selSub = subjects.find((s) => s.id === newQuestion.subjectId);
                      const selSubId = (newQuestion.subjectId || "").toLowerCase().trim();
                      const selSlug = (selSub?.slug || "").toLowerCase().trim();
                      const list = allChapters.filter((c) => {
                        const chSub = (c.subjectId || "").toLowerCase().trim();
                        if (!chSub) return false;
                        return chSub === selSubId || (selSlug && chSub === selSlug) || (selSub && c.subjectId === selSub.id);
                      });
                      const seen = new Set<string>();
                      return list
                        .filter((ch) => {
                          const key = `${ch.chapterNo}_${(ch.name || "").trim().toLowerCase()}`;
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        })
                        .sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0))
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            অধ্যায় {ch.chapterNo}: {ch.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">প্রশ্ন (Question Text) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফটোসিন্থেসিস প্রক্রিয়ায় উদ্ভিদ কোন গ্যাস গ্রহণ করে?"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">৪টি অপশন ইনপুট দিন ও সঠিক উত্তর সিলেক্ট করুন:</label>
                {newQuestion.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="newCorrectOption"
                      checked={newQuestion.correctAnswer === i}
                      onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: i })}
                      className="accent-emerald-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`অপশন ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...newQuestion.options];
                        newOpts[i] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOpts });
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">ব্যাখ্যা (Explanation)</label>
                <input
                  type="text"
                  placeholder="যেমন: কার্বন ডাই অক্সাইড গ্যাস উদ্ভিদের শর্করা তৈরিতে ব্যবহৃত হয়।"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddQuestionOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg">Firebase-এ সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: EDIT QUESTION ===== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 width={16} height={16} className="text-amber-400" />
                প্রশ্ন ম্যানুয়ালি এডিটর (Edit Question)
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস</label>
                  <select
                    value={editingQuestion.classId || "class6"}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const filteredSubs = subjects.filter((s) => s.classId === newCls);
                      const subForCls = filteredSubs.some((s) => s.id === editingQuestion.subjectId)
                        ? editingQuestion.subjectId
                        : filteredSubs[0]?.id || "";
                      setEditingQuestion({
                        ...editingQuestion,
                        classId: newCls,
                        subjectId: subForCls,
                        chapterId: "",
                      });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-teal-400 font-bold focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">২. বিষয়</label>
                  <select
                    value={editingQuestion.subjectId || ""}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, subjectId: e.target.value, chapterId: "" })
                    }
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-indigo-300 font-bold focus:outline-none"
                  >
                    {(() => {
                      const filteredSubs = subjects.filter(
                        (s) => !editingQuestion.classId || s.classId === editingQuestion.classId
                      );
                      if (filteredSubs.length === 0) {
                        return <option value="">কোনো বিষয় নেই</option>;
                      }
                      return filteredSubs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">৩. অধ্যায়</label>
                  <select
                    value={editingQuestion.chapterId || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, chapterId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="">অধ্যায় সিলেক্ট করুন (ঐচ্ছিক)</option>
                    {(() => {
                      const selSub = subjects.find((s) => s.id === editingQuestion.subjectId);
                      const selSubId = (editingQuestion.subjectId || "").toLowerCase().trim();
                      const selSlug = (selSub?.slug || "").toLowerCase().trim();
                      const list = allChapters.filter((c) => {
                        const chSub = (c.subjectId || "").toLowerCase().trim();
                        if (!chSub) return false;
                        return chSub === selSubId || (selSlug && chSub === selSlug) || (selSub && c.subjectId === selSub.id);
                      });
                      const seen = new Set<string>();
                      return list
                        .filter((ch) => {
                          const key = `${ch.chapterNo}_${(ch.name || "").trim().toLowerCase()}`;
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        })
                        .sort((a, b) => (Number(a.chapterNo ?? a.order) || 0) - (Number(b.chapterNo ?? b.order) || 0))
                        .map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            অধ্যায় {ch.chapterNo}: {ch.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">প্রশ্ন (Question Text)</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">অপশনসমূহ (৪টি) ও সঠিক উত্তর সিলেক্ট করুন:</label>
                {(Array.isArray(editingQuestion.options) ? editingQuestion.options : []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={editingQuestion.correctAnswer === i}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })}
                      className="accent-emerald-500"
                    />
                    <input
                      type="text"
                      value={typeof opt === "object" && opt !== null ? String((opt as any).text || "") : String(opt ?? "")}
                      onChange={(e) => {
                        const newOpts = [...(Array.isArray(editingQuestion.options) ? editingQuestion.options : [])];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">ব্যাখ্যা (Explanation)</label>
                <input
                  type="text"
                  value={editingQuestion.explanation || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-lg">পরিবর্তন সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTHER MODALS: SUBJECT & USER */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BookOpen width={16} height={16} className="text-indigo-400" />
                নতুন বিষয় যুক্ত করুন (Class Selection সহ)
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস (Class)</label>
                  <select
                    value={newSubject.classId}
                    onChange={(e) => setNewSubject({ ...newSubject, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">বিভাগ/গ্রুপ (Group)</label>
                  <select
                    value={newSubject.group || "all"}
                    onChange={(e) => setNewSubject({ ...newSubject, group: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="all">সকল বিভাগ (All)</option>
                    <option value="science">বিজ্ঞান (Science)</option>
                    <option value="commerce">ব্যবসায় শিক্ষা (Commerce)</option>
                    <option value="arts">মানবিক (Arts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">২. বিষয়ের নাম (Subject Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হিসাববিজ্ঞান / পদার্থবিজ্ঞান"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Slug (অপশনাল)</label>
                  <input
                    type="text"
                    placeholder="যেমন: physics"
                    value={newSubject.slug}
                    onChange={(e) => setNewSubject({ ...newSubject, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">কালার থিম</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSubject.color}
                      onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      className="h-8 w-12 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer p-0.5"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">{newSubject.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">৩. কভার ইমেজ (Subject Cover Image)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="add-cover-file"
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/40 rounded-xl text-indigo-200 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <Upload width={13} height={13} />
                      গ্যালারি থেকে ফটো বাছাই করুন 🖼️
                    </label>
                    <input
                      id="add-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, false)}
                      className="hidden"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">অথবা লিঙ্ক:</span>
                  </div>

                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/.../book.jpg"
                    value={newSubject.imageUrl}
                    onChange={(e) => setNewSubject({ ...newSubject, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />

                  {newSubject.imageUrl ? (
                    <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={newSubject.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, imageUrl: "" })}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow"
                      >
                        <X width={12} height={12} />
                      </button>
                      <span className="absolute bottom-1 left-2 text-[9px] font-extrabold bg-black/70 px-1.5 py-0.5 rounded text-emerald-300">
                        ✓ কভার ইমেজ নির্বাচিত
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">৪. সেকশনসমূহ (Sections) — অপশনাল</label>
                <input
                  type="text"
                  placeholder="যেমন: গদ্য, কবিতা, উপন্যাস, নাটক (কমা দিয়ে আলাদা করুন)"
                  value={newSubject.sectionsText}
                  onChange={(e) => setNewSubject({ ...newSubject, sectionsText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-teal-400 mt-1">💡 সেকশন দিলে অধ্যায়গুলো গ্রুপে ভাগ হবে (যেমন: বাংলা ১ম পত্রের গদ্য / কবিতা)।</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg">Firebase-এ সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 width={16} height={16} className="text-amber-400" />
                বিষয় এডিট ও ক্লাস সেটিং ({editingSubject.name})
              </h3>
              <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubject} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস (Class)</label>
                  <select
                    value={editingSubject.classId}
                    onChange={(e) => setEditingSubject({ ...editingSubject, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">বিভাগ/গ্রুপ (Group)</label>
                  <select
                    value={editingSubject.group || "all"}
                    onChange={(e) => setEditingSubject({ ...editingSubject, group: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="all">সকল বিভাগ (All)</option>
                    <option value="science">বিজ্ঞান (Science)</option>
                    <option value="commerce">ব্যবসায় শিক্ষা (Commerce)</option>
                    <option value="arts">মানবিক (Arts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">২. বিষয়ের নাম (Subject Name)</label>
                <input
                  type="text"
                  required
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingSubject.slug}
                    onChange={(e) => setEditingSubject({ ...editingSubject, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">কালার থিম</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingSubject.color || "#0D9488"}
                      onChange={(e) => setEditingSubject({ ...editingSubject, color: e.target.value })}
                      className="h-8 w-12 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer p-0.5"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">{editingSubject.color || "#0D9488"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">৩. কভার ইমেজ (Subject Cover Image)</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="edit-cover-file"
                      className="flex items-center gap-1.5 px-3 py-2 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
                    >
                      <Upload width={13} height={13} />
                      গ্যালারি থেকে ফটো পরিবর্তন করুন 🖼️
                    </label>
                    <input
                      id="edit-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, true)}
                      className="hidden"
                    />
                    <span className="text-[10px] text-slate-500 font-bold">অথবা লিঙ্ক:</span>
                  </div>

                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/.../book.jpg"
                    value={editingSubject.imageUrl || ""}
                    onChange={(e) => setEditingSubject({ ...editingSubject, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />

                  {editingSubject.imageUrl ? (
                    <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={editingSubject.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingSubject({ ...editingSubject, imageUrl: "" })}
                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow"
                      >
                        <X width={12} height={12} />
                      </button>
                      <span className="absolute bottom-1 left-2 text-[9px] font-extrabold bg-black/70 px-1.5 py-0.5 rounded text-amber-300">
                        ✓ কভার ইমেজ নির্বাচিত
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 flex items-center justify-between">
                  <span>৪. সেকশনসমূহ (Sections) — অপショナル</span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    ({((editingSubject as any).sectionsText ?? (editingSubject.sections || []).join(", "))
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean).length}টি সেকশন)
                  </span>
                </label>

                {/* Active Section Chips */}
                {(() => {
                  const rawVal = (editingSubject as any).sectionsText ?? (editingSubject.sections || []).join(", ");
                  const secs = rawVal.split(",").map((s: string) => s.trim()).filter(Boolean);
                  if (secs.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                      {secs.map((sec: string) => (
                        <span key={sec} className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                          {sec}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = secs.filter((s: string) => s !== sec);
                              setEditingSubject({ ...editingSubject, sectionsText: updated.join(", ") } as any);
                            }}
                            className="hover:text-rose-400 text-amber-300 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {/* Quick Add Presets */}
                <div className="mb-2">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">দ্রুত সেকশন ট্যাগ সিলেক্ট করুন:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_SECTION_TAGS.map((tag) => {
                      const rawVal = (editingSubject as any).sectionsText ?? (editingSubject.sections || []).join(", ");
                      const currentSecs = rawVal.split(",").map((s: string) => s.trim()).filter(Boolean);
                      const isAdded = currentSecs.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              const updated = currentSecs.filter((s: string) => s !== tag);
                              setEditingSubject({ ...editingSubject, sectionsText: updated.join(", ") } as any);
                            } else {
                              const updated = [...currentSecs, tag];
                              setEditingSubject({ ...editingSubject, sectionsText: updated.join(", ") } as any);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                            isAdded
                              ? "bg-amber-500/25 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/30 shadow-xs"
                              : "bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white"
                          }`}
                        >
                          {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="যেমন: গদ্য, কবিতা, উপন্যাস, নাটক (কমা দিয়ে টাইপ করতে পারেন)"
                  value={(editingSubject as any).sectionsText ?? (editingSubject.sections || []).join(", ")}
                  onChange={(e) => setEditingSubject({ ...editingSubject, sectionsText: e.target.value } as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-teal-400 mt-1">💡 সেকশন দিলে অধ্যায়গুলো ওই গ্রুপে ভাগ হয়ে দেখাবে (যেমন: বাংলা ১ম পত্রের গদ্য / কবিতা)।</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingSubject(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-lg">পরিবর্তন সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Users width={16} height={16} className="text-teal-400" />
                নতুন ইউজার তৈরি করুন (Firebase Live)
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সায়েম আহমেদ"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">ইমেইল</label>
                <input
                  type="email"
                  required
                  placeholder="sayem@gmail.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg">Firebase-এ সেভ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT BANNER MODAL */}
      {isAddBannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Layers width={16} height={16} className="text-teal-400" />
                {editingBanner ? "ব্যানার ক্যারোজেল স্লাইড সম্পাদনা করুন" : "নতুন ব্যানার ক্যারোজেল স্লাইড যোগ করুন"}
              </h3>
              <button onClick={() => setIsAddBannerOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              {/* LIVE PREVIEW BOX */}
              <div>
                <label className="block text-[11px] text-teal-400 font-bold mb-1.5 flex items-center justify-between">
                  <span>🎨 লাইভ প্রিভিউ (স্লাইডার কেমন দেখাবে)</span>
                </label>
                <div
                  className="rounded-xl p-3.5 relative overflow-hidden border border-white/10 flex flex-col justify-between space-y-2 shadow-lg"
                  style={{ background: newBanner.bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)" }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/20">
                      {newBanner.badge || "NEW FEATURE 🔥"}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-base font-black text-white leading-tight">
                      {newBanner.title || "এখানে ব্যানার শিরোনাম থাকবে"}
                    </h4>
                    <p className="text-[11px] text-white/80 font-medium mt-0.5 line-clamp-2">
                      {newBanner.subtitle || "এখানে ব্যানার সাবটাইটেল বা বিস্তারিত বিবরণ থাকবে"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between relative z-10 pt-1.5 border-t border-white/10">
                    <span className="text-[10px] font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg shadow">
                      {newBanner.ctaText || "কুইজ শুরু করুন 🚀"}
                    </span>
                    <span className="text-[9px] text-white/70 font-mono">
                      Target: {selectedBannerRoutePreset === "custom" ? (customBannerRouteUrl || "/") : selectedBannerRoutePreset}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle Inputs */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">১. ব্যানার শিরোনাম (Title) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এইচএসসি ২৫ রিভিশন ব্যাচ"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">২. ব্যানার সাবটাইটেল / বিবরণ (Subtitle)</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: সকল বিষয় এক জায়গায় সমাধান করো..."
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Route Presets */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৩. রাউট নির্দেশক (Target Route Link)</label>
                <select
                  value={selectedBannerRoutePreset}
                  onChange={(e) => setSelectedBannerRoutePreset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-500 mb-2"
                >
                  {PRESET_BANNER_ROUTES.map((route) => (
                    <option key={route.value} value={route.value}>
                      {route.label}
                    </option>
                  ))}
                </select>
                {selectedBannerRoutePreset === "custom" && (
                  <div>
                    <input
                      type="text"
                      placeholder="যেমন: /quiz/setup"
                      value={customBannerRouteUrl}
                      onChange={(e) => setCustomBannerRouteUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              {/* Badge Tag & Presets */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৪. ব্যাজ ট্যাগ (Badge Tag)</label>
                <div className="flex gap-1.5 mb-1.5 flex-wrap">
                  {PRESET_BADGE_TAGS.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setNewBanner({ ...newBanner, badge })}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-teal-500 text-[10px] font-bold text-slate-300 rounded-lg transition-all"
                    >
                      {badge}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="যেমন: NEW FEATURE 🔥"
                  value={newBanner.badge}
                  onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              {/* CTA Button Text */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৫. বাটন টেক্সট (CTA Text)</label>
                <input
                  type="text"
                  placeholder="যেমন: ব্যাটেল শুরু করো ⚔️"
                  value={newBanner.ctaText}
                  onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none font-bold text-teal-300"
                />
              </div>

              {/* Gradient Color Presets */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৬. ব্যাকগ্রাউন্ড গ্র্যাডিয়েন্ট থীম (Theme Presets)</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {PRESET_BANNER_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.label}
                      type="button"
                      onClick={() => setNewBanner({ ...newBanner, bgGradient: gradient.value })}
                      className={`px-2.5 py-1 text-[10px] font-bold text-white rounded-lg border transition-all flex items-center gap-1.5 ${
                        newBanner.bgGradient === gradient.value ? "border-amber-400 ring-2 ring-amber-400/30 scale-105" : "border-white/10 hover:border-white/30"
                      }`}
                      style={{ background: gradient.value }}
                    >
                      <span>{gradient.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৭. কভার ইমেজ URL (অপশনাল)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBannerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg shadow-teal-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check width={14} height={14} />
                  {editingBanner ? "হালনাগাদ সেভ করুন" : "Firebase-এ সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CHAPTER MODAL */}
      {isAddChapterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileCode width={16} height={16} className="text-amber-400" />
                {editingChapter ? "অধ্যায় সম্পাদনা করুন" : "নতুন অধ্যায় যোগ করুন"}
              </h3>
              <button onClick={() => setIsAddChapterOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">১. বিষয় নির্বাচন করুন (Subject) <span className="text-rose-400">*</span></label>
                <select
                  required
                  value={newChapter.subjectId}
                  onChange={(e) => setNewChapter({ ...newChapter, subjectId: e.target.value, sectionName: "" })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="">বিষয় সিলেক্ট করুন</option>
                  {subjects.map((s) => {
                    const clsName = classes.find((c) => c.id === s.classId)?.name || s.classId;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({clsName})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Section dropdown — shown dynamically based on selected subject */}
              {(() => {
                const selectedSubObj = subjects.find((s) => s.id === newChapter.subjectId);
                const availSections = selectedSubObj?.sections || [];

                return (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-teal-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-teal-300 font-extrabold text-xs flex items-center gap-1.5">
                        <Layers width={14} height={14} className="text-teal-400" />
                        ২. অধ্যায়ের সেকশন (Section Select)
                      </label>
                      {availSections.length > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                          {availSections.length}টি সেকশন পাওয়া গেছে
                        </span>
                      )}
                    </div>

                    {availSections.length > 0 ? (
                      <div>
                        <select
                          value={newChapter.sectionName || ""}
                          onChange={(e) => setNewChapter({ ...newChapter, sectionName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-teal-500/60 rounded-xl text-white font-black focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer text-xs"
                        >
                          <option value="">— সাধারণ অধ্যায় (কোনো সেকশন নেই) —</option>
                          {availSections.map((sec) => (
                            <option key={sec} value={sec}>
                              📂 {sec}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-teal-400/90 mt-1 font-medium">
                          💡 এই বিষয়টিতে সেট করা সেকশনসমূহ থেকে অধ্যায়ের ড্রপডাউন গ্রুপ বেছে নিন।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[11px] text-amber-300 font-bold">
                          💡 {selectedSubObj ? `"${selectedSubObj.name}"` : "এই"} বিষয়ে এখনো কোনো সেকশন সেট করা নেই।
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="নতুন সেকশন নাম (যেমন: ১ম পত্র / গদ্য)"
                            value={newChapter.sectionName || ""}
                            onChange={(e) => setNewChapter({ ...newChapter, sectionName: e.target.value })}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none font-bold text-xs"
                          />
                          {newChapter.sectionName && selectedSubObj && (
                            <button
                              type="button"
                              onClick={async () => {
                                const newSecName = newChapter.sectionName.trim();
                                if (!newSecName || !selectedSubObj) return;
                                const updatedSecs = [...(selectedSubObj.sections || []), newSecName];
                                try {
                                  await updateSubject(selectedSubObj.id, { sections: updatedSecs });
                                  setSubjects(subjects.map((s) => (s.id === selectedSubObj.id ? { ...s, sections: updatedSecs } : s)));
                                  showToast(`বিষয়ে নতুন সেকশন "${newSecName}" যোগ হয়েছে! 📚`);
                                } catch (e) {
                                  showToast("সেকশন যোগ করা যায়নি");
                                }
                              }}
                              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[10px] font-black transition-all shadow shrink-0"
                            >
                              + বিষয়ে সেভ করুন
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-400 font-bold mb-1">৩. অধ্যায়ের নাম (Chapter Name) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অধ্যায় ১: বল ও গতি"
                  value={newChapter.name}
                  onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">৪. অধ্যায় নম্বর (Chapter No.)</label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="1"
                  value={newChapter.chapterNo}
                  onChange={(e) => setNewChapter({ ...newChapter, chapterNo: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddChapterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check width={14} height={14} />
                  {editingChapter ? "হালনাগাদ সেভ করুন" : "Firebase-এ সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ROLE CHANGE MODAL (SUPER ADMIN ONLY) ===== */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRoleModalUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X width={18} height={18} />
            </button>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="text-purple-400" width={20} height={20} />
              <div>
                <h3 className="text-sm font-extrabold text-white">ইউজার ভূমিকা (Role) পরিবর্তন</h3>
                <p className="text-[10px] text-slate-400">অ্যাডমিন পারমিশন ও এক্সেস লেভেল কন্ট্রোল</p>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-800">
              <p className="text-xs font-black text-white">{roleModalUser.name}</p>
              <p className="text-[10px] text-slate-400">{roleModalUser.email}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-400">নতুন ভূমিকা নির্ধারণ করুন:</label>
              {[
                { id: "super_admin", title: "👑 Super Admin", desc: "পূর্ণ সিস্টেম অ্যাক্সেস, ইউজার ভূমিকা ও সেটিংস পরিবর্তন" },
                { id: "admin", title: "🛡️ Admin", desc: "ইউজার ব্যানিং, কুইজ, বিষয় ও ব্যানার পরিচালনা (সেটিংস নয়)" },
                { id: "moderator", title: "⚡ Moderator", desc: "কুইজ, প্রশ্ন ব্যাংক ও ব্যানার তৈরি/সম্পাদনা (ইউজার ব্যানিং নয়)" },
                { id: "content_creator", title: "✍️ Content Editor", desc: "শুধু কুইজ, বিষয় ও প্রশ্ন ব্যাংক তৈরি/সম্পাদনা" },
                { id: "user", title: "👤 General Student", desc: "সাধারণ শিক্ষার্থী অ্যাক্সেস" },
              ].map((r) => (
                <label
                  key={r.id}
                  onClick={() => setSelectedRole(r.id as any)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === r.id
                      ? "bg-purple-600/20 border-purple-500/80 text-white ring-1 ring-purple-500/30"
                      : "bg-slate-800/40 border-slate-800/80 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    checked={selectedRole === r.id}
                    onChange={() => setSelectedRole(r.id as any)}
                    className="mt-0.5 accent-purple-500"
                  />
                  <div>
                    <p className="text-xs font-black">{r.title}</p>
                    <p className="text-[9.5px] opacity-75 leading-tight mt-0.5">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleUpdateRole(roleModalUser.id, selectedRole)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
              >
                <Check width={14} height={14} />
                রোল সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ADD / EDIT DAILY MISSION ===== */}
      {isAddMissionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl my-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target width={18} height={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {editingMission ? "দৈনিক মিশন সম্পাদনা করুন" : "নতুন দৈনিক মিশন তৈরি"}
                  </h3>
                  <p className="text-[10px] text-slate-400">মিশন টাইটেল, টার্গেট মেট্রিক ও রিওয়ার্ড নির্ধারণ করুন</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddMissionOpen(false);
                  setEditingMission(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X width={18} height={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="space-y-3.5 text-xs">
              {/* Mission Title */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  ১. মিশন টাইটেল (Title) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১টি কুইজ খেলুন"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Mission Description */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">২. মিশন বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: আজকে যেকোনো বিষয়ে অন্তত ১টি পূর্ণাঙ্গ কুইজ দিন"
                  value={newMission.desc}
                  onChange={(e) => setNewMission({ ...newMission, desc: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target Metric Type */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  ৩. টার্গেট মেট্রিক টাইপ (Target Type) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newMission.targetType}
                  onChange={(e) => {
                    const selectedVal = e.target.value as MissionTargetType;
                    const preset = PRESET_MISSION_METRICS.find((p) => p.value === selectedVal);
                    setNewMission({
                      ...newMission,
                      targetType: selectedVal,
                      actionText: preset?.defaultAction || newMission.actionText,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                >
                  {PRESET_MISSION_METRICS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 {PRESET_MISSION_METRICS.find((p) => p.value === newMission.targetType)?.hint}
                </p>
              </div>

              {/* Target Count & Reward XP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    ৪. লক্ষ্যমাত্রা সংখ্যা (Target Goal) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newMission.target}
                    onChange={(e) => setNewMission({ ...newMission, target: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-black focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    ৫. রিওয়ার্ড XP (Reward XP) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    required
                    value={newMission.rewardXP}
                    onChange={(e) => setNewMission({ ...newMission, rewardXP: Number(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-black focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Button Text */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">৬. অপূর্ণ অবস্থায় বাটন টেক্সট (Action CTA Text)</label>
                <input
                  type="text"
                  placeholder="যেমন: কুইজ খেলুন / অনুশীলন করুন / চ্যালেঞ্জ নিন"
                  value={newMission.actionText}
                  onChange={(e) => setNewMission({ ...newMission, actionText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Icon & Theme Presets */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">৭. আইকন (Icon)</label>
                  <select
                    value={newMission.icon}
                    onChange={(e) => setNewMission({ ...newMission, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {PRESET_MISSION_ICONS.map((ic) => (
                      <option key={ic.value} value={ic.value}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">৮. থিম কালার (Color Theme)</label>
                  <select
                    value={newMission.color}
                    onChange={(e) => {
                      const theme = PRESET_MISSION_THEMES.find((t) => t.color === e.target.value);
                      if (theme) {
                        setNewMission({ ...newMission, color: theme.color, bg: theme.bg });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {PRESET_MISSION_THEMES.map((th) => (
                      <option key={th.color} value={th.color}>
                        {th.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold">মিশন স্ট্যাটাস সক্রিয় (Active)</span>
                <input
                  type="checkbox"
                  checked={newMission.active !== false}
                  onChange={(e) => setNewMission({ ...newMission, active: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMissionOpen(false);
                    setEditingMission(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check width={14} height={14} />
                  {editingMission ? "হালনাগাদ সেভ করুন" : "মিশন তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

