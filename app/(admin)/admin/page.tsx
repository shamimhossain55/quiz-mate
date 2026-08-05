"use client";

import { useState, useEffect } from "react";
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
  deleteQuizDoc,
  getAllClasses,
  getChaptersBySubject,
  getAllChapters,
  addChapter,
  updateChapter,
  deleteChapter,
  getAllQuestions,
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

  // Modals & Toast State
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
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
  const [chapterSubjectFilter, setChapterSubjectFilter] = useState<string>("all");
  const [newChapter, setNewChapter] = useState({ name: "", subjectId: "", chapterNo: 1 });

  // Form Cascading Select States for Quiz Creation
  const [selectedClassId, setSelectedClassId] = useState("class6");
  const [selectedSubjectId, setSelectedSubjectId] = useState("bangla");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const [newQuiz, setNewQuiz] = useState({ name: "", questionsCount: 10, status: "published" as const });
  const [newSubject, setNewSubject] = useState({ name: "", slug: "", classId: "class6", group: "all", color: "#0D9488", imageUrl: "" });
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
        }
      } catch (e) {
        console.error("Failed to load admin session role", e);
      }
    }

    async function loadData() {
      setLoading(true);
      try {
        const [firestoreUsers, firestoreClasses, firestoreSubjects, firestoreQuizzes, firestoreQuestions, firestoreBanners, firestoreChapters] = await Promise.all([
          getAllStudents(),
          getAllClasses(),
          getAllSubjects(),
          getAllQuizzes(),
          getAllQuestions(),
          getAllBanners(),
          getAllChapters(),
        ]);

        setUsers(firestoreUsers);
        setClasses(firestoreClasses);
        setSubjects(firestoreSubjects);
        setQuizzes(firestoreQuizzes);
        setQuestions(firestoreQuestions);
        setBanners(firestoreBanners);
        setAllChapters(firestoreChapters);
      } catch (err) {
        console.error("Error loading Firestore admin data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
    loadData();
  }, []);

  const handleUpdateRole = async (
    userId: string,
    newRole: "super_admin" | "admin" | "moderator" | "content_creator" | "user"
  ) => {
    try {
      const targetUser = users.find((u) => u.id === userId);
      await updateStudentRole(userId, newRole, targetUser?.email);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
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

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.name) return;
    try {
      const selectedSubObj = subjects.find(s => s.id === selectedSubjectId || s.slug === selectedSubjectId);
      const subjectName = selectedSubObj ? selectedSubObj.name : "সাধারণ";
      const payload = {
        name: newQuiz.name,
        subject: subjectName,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId,
        questionsCount: Number(newQuiz.questionsCount),
        status: newQuiz.status,
      };
      const newId = await addQuiz(payload);
      const item: AdminQuiz = { id: newId, ...payload, attempts: 0, avgScore: "0%" };
      setQuizzes([item, ...quizzes]);
      setIsAddQuizOpen(false);
      setNewQuiz({ name: "", questionsCount: 10, status: "published" });
      showToast("Class, Subject ও Chapter সহ নতুন কুইজ তৈরি হয়েছে! 🔥");
    } catch (err) {
      showToast("ত্রুটি: কুইজ তৈরি করা যায়নি");
    }
  };

  const handleOpenAddQuestion = () => {
    const defaultSub = subjects[0]?.id || "";
    const defaultCh = allChapters.find((c) => c.subjectId === defaultSub)?.id || "";
    setNewQuestion({
      classId: subjects[0]?.classId || "class6",
      subjectId: defaultSub,
      chapterId: defaultCh,
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
      setEditingQuestion(null);
      showToast("প্রশ্ন সফলভাবে এডিট হয়েছে! ✏️");
    } catch (err) {
      showToast("প্রশ্ন এডিট করা যায়নি");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
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
      const item: AdminSubject = {
        id: `${newSubject.classId}_${slugVal}`,
        name: newSubject.name,
        slug: slugVal,
        classId: newSubject.classId,
        group: newSubject.group || "all",
        color: newSubject.color,
        imageUrl: newSubject.imageUrl || undefined,
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
      setIsAddSubjectOpen(false);
      setNewSubject({ name: "", slug: "", classId: "class6", group: "all", color: "#0D9488", imageUrl: "" });
      showToast("Firebase-এ নতুন বিষয় যুক্ত হয়েছে! 📚");
    } catch (err) {
      showToast("ত্রুটি: বিষয় যুক্ত করা যায়নি");
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.name) return;
    try {
      await updateSubject(editingSubject.id, {
        name: editingSubject.name,
        classId: editingSubject.classId,
        slug: editingSubject.slug,
        group: editingSubject.group || "all",
        color: editingSubject.color,
        imageUrl: editingSubject.imageUrl || undefined,
      });
      if (editingSubject.imageUrl) {
        saveLocalSubjectImage(editingSubject.id, editingSubject.imageUrl);
        saveLocalSubjectImage(editingSubject.slug, editingSubject.imageUrl);
      }
      setSubjects(subjects.map((s) => (s.id === editingSubject.id ? editingSubject : s)));
      setEditingSubject(null);
      showToast("বিষয় সফলভাবে আপডেট ও নতুন ক্লাসে সেট হয়েছে! ✏️");
    } catch (err) {
      showToast("ত্রুটি: বিষয় আপডেট করা যায়নি");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      setSubjects(subjects.filter((s) => s.id !== id));
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
      await updateStudentStatus(id, nextStatus);
      setUsers(users.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
      showToast(`ইউজার স্ট্যাটাস পরিবর্তন: ${nextStatus === "active" ? "অ্যাক্টিভ" : "ব্যান"} 🔄`);
    } catch (err) {
      showToast("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে");
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuizDoc(id);
      setQuizzes(quizzes.filter((q) => q.id !== id));
      showToast("Firebase থেকে কুইজ ডিলিট করা হয়েছে! 🗑️");
    } catch (err) {
      showToast("কুইজ ডিলিট করা যায়নি");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteStudent(id);
      setUsers(users.filter((u) => u.id !== id));
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
        showToast("ব্যানার ক্যারোজেল আপডেট হয়েছে! ✏️");
      } else {
        const itemWithOrder = { ...itemPayload, order: banners.length + 1 };
        const id = await addBannerDoc(itemWithOrder);
        setBanners([...banners, { ...itemWithOrder, id }]);
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
      await deleteBannerDoc(id);
      setBanners(banners.filter((b) => b.id !== id));
      showToast("ব্যানার মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("ব্যানার ডিলিট করা যায়নি");
    }
  };

  // ===== CHAPTER HANDLERS =====
  const handleOpenAddChapter = (preSelectedSubjectId?: string) => {
    setEditingChapter(null);
    setNewChapter({ name: "", subjectId: preSelectedSubjectId || (subjects[0]?.id || ""), chapterNo: 1 });
    setIsAddChapterOpen(true);
  };

  const handleOpenEditChapter = (ch: AdminChapter) => {
    setEditingChapter(ch);
    setNewChapter({ name: ch.name, subjectId: ch.subjectId, chapterNo: ch.chapterNo });
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
      };
      if (editingChapter) {
        await updateChapter(editingChapter.id, payload);
        setAllChapters(allChapters.map((c) => (c.id === editingChapter.id ? { ...c, ...payload } : c)));
        showToast("অধ্যায় আপডেট হয়েছে! ✏️");
      } else {
        const id = await addChapter(payload);
        setAllChapters([...allChapters, { ...payload, id }]);
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
      await deleteChapter(id);
      setAllChapters(allChapters.filter((c) => c.id !== id));
      showToast("অধ্যায় মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("অধ্যায় ডিলিট করা যায়নি");
    }
  };

  const allNavItems: NavItem[] = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "banners", label: "ব্যানার ক্যারোজেল", icon: Layers, badge: String(banners.length), badgeColor: "bg-teal-100 text-teal-800" },
    { id: "quizzes", label: "কুইজ ম্যানেজমেন্ট", icon: ListChecks, badge: String(quizzes.length), badgeColor: "bg-amber-100 text-amber-800" },
    { id: "questions", label: "প্রশ্ন ব্যাংক (Questions)", icon: HelpCircle, badge: String(questions.length), badgeColor: "bg-teal-100 text-teal-800" },
    { id: "subjects", label: "বিষয় ও অধ্যায়", icon: BookOpen, badge: String(subjects.length), badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "users", label: "ইউজারস ও পারমিশন", icon: Users, badge: String(users.length), badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
    { id: "settings", label: "সেটিংস", icon: Settings },
  ];

  const navItems = allNavItems.filter((item) => {
    if (currentUserRole === "super_admin") return true;
    if (currentUserRole === "admin") return item.id !== "settings";
    if (currentUserRole === "moderator") return item.id !== "users" && item.id !== "settings";
    if (currentUserRole === "content_creator") {
      return (
        item.id === "dashboard" ||
        item.id === "quizzes" ||
        item.id === "questions" ||
        item.id === "subjects"
      );
    }
    return true;
  });

  const filteredQuestions = questions.filter((q) => {
    if (questionClassFilter !== "all" && q.classId !== questionClassFilter) return false;
    if (questionSubjectFilter !== "all" && q.subjectId !== questionSubjectFilter) return false;
    if (questionChapterFilter !== "all" && q.chapterId !== questionChapterFilter) return false;
    if (searchQuery && !q.questionText.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10.5px] font-extrabold transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Upload width={12} height={12} />
              <span className="hidden sm:inline">JSON Bulk</span>
            </button>

            <button
              onClick={() => {
                if (activeNav === "subjects") setIsAddSubjectOpen(true);
                else if (activeNav === "users") setIsAddUserOpen(true);
                else if (activeNav === "banners") handleOpenAddBanner();
                else setIsAddQuizOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white text-[10.5px] font-extrabold transition-all shadow-lg shadow-teal-600/20 cursor-pointer"
            >
              <Plus width={12} height={12} />
              <span className="hidden sm:inline">নতুন যোগ</span>
            </button>

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
                        onClick={() => setIsBulkUploadOpen(true)}
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
                          setQuestionClassFilter(e.target.value);
                          setQuestionSubjectFilter("all");
                          setQuestionChapterFilter("all");
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
                          setQuestionSubjectFilter(e.target.value);
                          setQuestionChapterFilter("all");
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-400 font-bold focus:outline-none"
                      >
                        <option value="all">সকল বিষয়</option>
                        {(questionClassFilter === "all"
                          ? subjects
                          : subjects.filter((s) => s.classId === questionClassFilter)
                        ).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Chapter Filter */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">৩. অধ্যায় ফিল্টার:</label>
                      <select
                        value={questionChapterFilter}
                        onChange={(e) => setQuestionChapterFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-bold focus:outline-none"
                      >
                        <option value="all">সকল অধ্যায়</option>
                        {(questionSubjectFilter === "all"
                          ? allChapters
                          : allChapters.filter((c) => c.subjectId === questionSubjectFilter)
                        ).map((ch) => (
                          <option key={ch.id} value={ch.id}>অধ্যায় {ch.chapterNo}: {ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredQuestions.length === 0 ? (
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
                        const sub = subjects.find((s) => s.id === q.subjectId);
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
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-xl border flex items-center justify-between ${
                                    oIdx === q.correctAnswer
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold"
                                      : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {oIdx === q.correctAnswer && <Check width={14} height={14} className="text-emerald-400" />}
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                                💡 <span className="font-bold text-slate-300">ব্যাখ্যা:</span> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* QUIZZES TABLE */}
              {(activeNav === "dashboard" || activeNav === "quizzes") && (
                <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
                    <div>
                      <p className="text-sm font-extrabold text-white">কুইজ ম্যানেজমেন্ট ({quizzes.length})</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">সব ড্রপ-ডাউন সিলেক্টর সহ তৈরি কুইজ</p>
                    </div>
                    <button onClick={() => setIsAddQuizOpen(true)} className="flex items-center gap-1 text-[10px] font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg hover:bg-teal-500/20 transition-all">
                      <Plus width={10} height={10} /> নতুন কুইজ
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800/60">
                          {["কুইজ নাম", "বিষয়", "প্রশ্ন", "অ্যাটেম্পট", "গড় স্কোর", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.map((q) => (
                          <tr key={q.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/40 transition-colors group">
                            <td className="px-4 py-2.5 text-xs font-bold text-white max-w-[160px] truncate">{q.name}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded-md">{q.subject}</span>
                            </td>
                            <td className="px-4 py-2.5 text-[11px] text-slate-400">{q.questionsCount || 10}টি</td>
                            <td className="px-4 py-2.5 text-[11px] font-bold text-indigo-400">{q.attempts || 0}</td>
                            <td className="px-4 py-2.5 text-[11px] font-black text-teal-400">{q.avgScore || "৭৫%"}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${q.status === "published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                {q.status === "published" ? "● পাবলিশড" : "◌ ড্রাফট"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => handleDeleteQuiz(q.id)} title="মুছে ফেলুন" className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 width={11} height={11} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                          <span className="text-[11px] font-bold text-slate-400">বিষয়:</span>
                          <select
                            value={chapterSubjectFilter}
                            onChange={(e) => setChapterSubjectFilter(e.target.value)}
                            className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer max-w-[180px]"
                          >
                            <option value="all" className="bg-slate-900 text-white">সকল বিষয় ({allChapters.length})</option>
                            {subjects.map((s) => {
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

                    {(() => {
                      const filteredChapters = chapterSubjectFilter === "all"
                        ? allChapters
                        : allChapters.filter((c) => c.subjectId === chapterSubjectFilter);

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
                                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border-b border-slate-800">
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ background: sub?.color || "#0D9488" }} />
                                    <span className="text-xs font-extrabold text-white">{sub?.name || subId}</span>
                                    <span className="text-[9px] font-bold text-slate-500">({sortedChaps.length}টি অধ্যায়)</span>
                                  </div>
                                  <button
                                    onClick={() => handleOpenAddChapter(subId)}
                                    className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg hover:bg-amber-500/20 transition-all"
                                  >
                                    <Plus width={10} height={10} /> অধ্যায় যোগ
                                  </button>
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
                          {filteredUsers.length === 0 ? (
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
            </>
          )}
        </main>
      </div>

      {/* ===== MODAL: ADD QUIZ (WITH CASCADING SELECTORS: CLASS, SUBJECT, CHAPTER) ===== */}
      {isAddQuizOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ListChecks width={16} height={16} className="text-teal-400" />
                নতুন কুইজ তৈরি (Class/Subject/Chapter সিলেক্টর সহ)
              </h3>
              <button onClick={() => setIsAddQuizOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleAddQuiz} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">কুইজ টাইটেল</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বীজগণিতীয় রাশি - সেট A"
                  value={newQuiz.name}
                  onChange={(e) => setNewQuiz({ ...newQuiz, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* 3 CASCADING DROPDOWNS: CLASS, SUBJECT, CHAPTER */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস (Class)</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">২. বিষয় (Subject)</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">৩. অধ্যায় (Chapter)</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">প্রশ্ন সংখ্যা</label>
                  <input
                    type="number"
                    value={newQuiz.questionsCount}
                    onChange={(e) => setNewQuiz({ ...newQuiz, questionsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">স্ট্যাটাস</label>
                  <select
                    value={newQuiz.status}
                    onChange={(e) => setNewQuiz({ ...newQuiz, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="published">পাবলিশড (Published)</option>
                    <option value="draft">ড্রাফট (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddQuizOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg">Firebase-এ সেভ করুন</button>
              </div>
            </form>
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
              <div className="grid grid-cols-3 gap-3">
                {/* Class Select */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">১. ক্লাস (Class)</label>
                  <select
                    value={bulkMeta.classId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const subForCls = subjects.find((s) => s.classId === newCls)?.id || subjects[0]?.id || "";
                      const chForSub = allChapters.find((c) => c.subjectId === subForCls)?.id || "";
                      setBulkMeta({ ...bulkMeta, classId: newCls, subjectId: subForCls, chapterId: chForSub });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Subject Select */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1">২. বিষয় (Subject)</label>
                  <select
                    value={bulkMeta.subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      const chForSub = allChapters.find((c) => c.subjectId === newSub)?.id || "";
                      setBulkMeta({ ...bulkMeta, subjectId: newSub, chapterId: chForSub });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Chapter Select (Requested Feature) */}
                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">৩. অধ্যায় (Chapter)</label>
                  <select
                    value={bulkMeta.chapterId}
                    onChange={(e) => setBulkMeta({ ...bulkMeta, chapterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="">অধ্যায় সিলেক্ট করুন (অপশনাল)</option>
                    {allChapters
                      .filter((c) => !bulkMeta.subjectId || c.subjectId === bulkMeta.subjectId)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          অধ্যায় {ch.chapterNo}: {ch.name}
                        </option>
                      ))}
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
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ক্লাস</label>
                  <select
                    value={newQuestion.classId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const subForCls = subjects.find((s) => s.classId === newCls)?.id || subjects[0]?.id || "";
                      const chForSub = allChapters.find((c) => c.subjectId === subForCls)?.id || "";
                      setNewQuestion({ ...newQuestion, classId: newCls, subjectId: subForCls, chapterId: chForSub });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">বিষয়</label>
                  <select
                    value={newQuestion.subjectId}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      const chForSub = allChapters.find((c) => c.subjectId === newSub)?.id || "";
                      setNewQuestion({ ...newQuestion, subjectId: newSub, chapterId: chForSub });
                    }}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">অধ্যায়</label>
                  <select
                    value={newQuestion.chapterId}
                    onChange={(e) => setNewQuestion({ ...newQuestion, chapterId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="">অধ্যায় নির্বাচন করুন</option>
                    {allChapters
                      .filter((c) => !newQuestion.subjectId || c.subjectId === newQuestion.subjectId)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          অধ্যায় {ch.chapterNo}: {ch.name}
                        </option>
                      ))}
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
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ক্লাস</label>
                  <select
                    value={editingQuestion.classId || "class6"}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, classId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">বিষয়</label>
                  <select
                    value={editingQuestion.subjectId || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subjectId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
                  >
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-400 font-extrabold mb-1">অধ্যায়</label>
                  <select
                    value={editingQuestion.chapterId || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, chapterId: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-white font-bold focus:outline-none"
                  >
                    <option value="">অধ্যায় সিলেক্ট করুন</option>
                    {allChapters
                      .filter((c) => !editingQuestion.subjectId || c.subjectId === editingQuestion.subjectId)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          অধ্যায় {ch.chapterNo}: {ch.name}
                        </option>
                      ))}
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
                {editingQuestion.options.map((opt, i) => (
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
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
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

              {/* Title Input */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">১. শিরোনাম (Title) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১v১ লাইভ ফ্রেন্ড ব্যাটেল"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 font-bold"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">২. সংক্ষিপ্ত বিবরণ (Subtitle) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বন্ধুদের সাথে সরাসরি রিয়েল-টাইম কুইজ যুদ্ধ করো!"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Redirect Page Dropdown (Requested Feature) */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                <label className="block text-teal-300 font-extrabold mb-1">
                  ৩. নেভিগেশন / রিডাইরেক্ট পেজ সিলেক্ট করুন (Destination Page)
                </label>
                <select
                  value={selectedBannerRoutePreset}
                  onChange={(e) => setSelectedBannerRoutePreset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-teal-500/50 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                >
                  {PRESET_BANNER_ROUTES.map((route) => (
                    <option key={route.value} value={route.value}>
                      {route.label}
                    </option>
                  ))}
                </select>

                {selectedBannerRoutePreset === "custom" && (
                  <div className="pt-1">
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">কাস্টম URL লিখুন (e.g. /subject/maths বা https://...)</label>
                    <input
                      type="text"
                      placeholder="/subject/physics"
                      value={customBannerRouteUrl}
                      onChange={(e) => setCustomBannerRouteUrl(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none font-mono text-[11px]"
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
                  onChange={(e) => setNewChapter({ ...newChapter, subjectId: e.target.value })}
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

              <div>
                <label className="block text-slate-400 font-bold mb-1">২. অধ্যায়ের নাম (Chapter Name) <span className="text-rose-400">*</span></label>
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
                <label className="block text-slate-400 font-bold mb-1">৩. অধ্যায় নম্বর (Chapter No.)</label>
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
    </div>
  );
}

