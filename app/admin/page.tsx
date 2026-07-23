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
} from "lucide-react";

import {
  getAllStudents,
  addStudent,
  updateStudentStatus,
  deleteStudent,
  getAllSubjects,
  addSubject,
  getAllQuizzes,
  addQuiz,
  deleteQuizDoc,
  getAllClasses,
  getChaptersBySubject,
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addBulkQuestions,
  AdminUser,
  AdminSubject,
  AdminQuiz,
  AdminClass,
  AdminChapter,
  AdminQuestion,
} from "@/lib/firestore/admin";

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

// ===== Initial Fallback Data =====
const fallbackUsers: AdminUser[] = [
  { id: "u1", name: "আয়েশা রহমান", email: "ayesha@gmail.com", class: "ক্লাস ৯", xp: 1240, streak: 12, status: "active" },
  { id: "u2", name: "তানভীর আহমেদ", email: "tanvir@gmail.com", class: "ক্লাস ৯", xp: 1180, streak: 9, status: "active" },
  { id: "u3", name: "নুসরাত জাহান", email: "nusrat@gmail.com", class: "ক্লাস ৮", xp: 1105, streak: 8, status: "inactive" },
];

const fallbackSubjects: AdminSubject[] = [
  { id: "s1", name: "বাংলা", slug: "bangla", classId: "class6", totalQuizzes: 12, totalStudents: 450, color: "#0D9488" },
  { id: "s2", name: "English", slug: "english", classId: "class6", totalQuizzes: 8, totalStudents: 380, color: "#F87171" },
  { id: "s3", name: "গণিত", slug: "math", classId: "class6", totalQuizzes: 15, totalStudents: 520, color: "#6366F1" },
  { id: "s4", name: "বিজ্ঞান", slug: "science", classId: "class6", totalQuizzes: 10, totalStudents: 410, color: "#F59E0B" },
];

const fallbackQuizzes: AdminQuiz[] = [
  { id: "q1", name: "বাংলা ২য় পত্র - ব্যাকরণ", subject: "বাংলা", questionsCount: 20, attempts: 145, avgScore: "৭৮%", status: "published" },
  { id: "q2", name: "Grammar Set 3", subject: "English", questionsCount: 15, attempts: 98, avgScore: "৬২%", status: "published" },
  { id: "q3", name: "বীজগণিত অনুশীলন", subject: "গণিত", questionsCount: 25, attempts: 201, avgScore: "৮৪%", status: "draft" },
];

const fallbackQuestions: AdminQuestion[] = [
  {
    id: "q_sample_1",
    questionText: "বাংলা ভাষার মূল উৎস কোনটি?",
    options: ["বৈদিক ভাষা", "প্রাকৃত ভাষা", "সংস্কৃত ভাষা", "হিন্দি ভাষা"],
    correctAnswer: 1,
    explanation: "বাংলা ভাষার মূল উৎস প্রাকৃত ভাষা।",
  },
  {
    id: "q_sample_2",
    questionText: "বীজগণিতের জনক কে?",
    options: ["আল খোয়ারিজমি", "আর্কিমিডিস", "ইউক্লিড", "পাইথাগোরাস"],
    correctAnswer: 0,
    explanation: "আল খোয়ারিজমিকে বীজগণিতের জনক বলা হয়।",
  },
];

const weeklyData = [40, 65, 55, 80, 70, 90, 75];
const weekDays = ["সো", "মঙ", "বু", "বৃ", "শু", "শ", "র"];

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Firestore Data State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);

  // Modals & Toast State
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Cascading Select States for Quiz Creation
  const [selectedClassId, setSelectedClassId] = useState("class6");
  const [selectedSubjectId, setSelectedSubjectId] = useState("bangla");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const [newQuiz, setNewQuiz] = useState({ name: "", questionsCount: 10, status: "published" as const });
  const [newSubject, setNewSubject] = useState({ name: "", slug: "", classId: "class6", color: "#0D9488" });
  const [newUser, setNewUser] = useState({ name: "", email: "", class: "ক্লাস ৯" });

  // Bulk JSON State
  const [bulkJsonInput, setBulkJsonInput] = useState(sampleJsonTemplate);
  const [bulkMeta, setBulkMeta] = useState({ classId: "class6", subjectId: "bangla", chapterId: "", quizId: "" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Real Data from Firestore on Mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [firestoreUsers, firestoreClasses, firestoreSubjects, firestoreQuizzes, firestoreQuestions] = await Promise.all([
          getAllStudents(),
          getAllClasses(),
          getAllSubjects(),
          getAllQuizzes(),
          getAllQuestions(),
        ]);

        setUsers(firestoreUsers.length > 0 ? firestoreUsers : fallbackUsers);
        setClasses(firestoreClasses);
        setSubjects(firestoreSubjects.length > 0 ? firestoreSubjects : fallbackSubjects);
        setQuizzes(firestoreQuizzes.length > 0 ? firestoreQuizzes : fallbackQuizzes);
        setQuestions(firestoreQuestions.length > 0 ? firestoreQuestions : fallbackQuestions);
      } catch (err) {
        console.error("Error loading Firestore admin data:", err);
        setUsers(fallbackUsers);
        setSubjects(fallbackSubjects);
        setQuizzes(fallbackQuizzes);
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  // Handlers
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
      setQuestions(updatedQ.length > 0 ? updatedQ : fallbackQuestions);
    } catch (err: any) {
      showToast(`JSON ফরম্যাট ভুল: ${err.message}`);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      await updateQuestion(editingQuestion.id, {
        questionText: editingQuestion.questionText,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
      });
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
      showToast("প্রশ্ন সফলভাবে এডিট হয়েছে! ✏️");
    } catch (err) {
      showToast("প্রশ্ন এডিট করা যায়নি");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      showToast("প্রশ্ন মুছে ফেলা হয়েছে! 🗑️");
    } catch (err) {
      showToast("প্রশ্ন ডিলিট করা যায়নি");
    }
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
        color: newSubject.color,
        totalQuizzes: 0,
        totalStudents: 0,
      };
      await addSubject(item);
      setSubjects([...subjects, item]);
      setIsAddSubjectOpen(false);
      setNewSubject({ name: "", slug: "", classId: "class6", color: "#0D9488" });
      showToast("Firebase-এ নতুন বিষয় যুক্ত হয়েছে! 📚");
    } catch (err) {
      showToast("ত্রুটি: বিষয় যুক্ত করা যায়নি");
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

  const navItems: NavItem[] = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "quizzes", label: "কুইজ ম্যানেজমেন্ট", icon: ListChecks, badge: String(quizzes.length), badgeColor: "bg-amber-100 text-amber-800" },
    { id: "questions", label: "প্রশ্ন ব্যাংক (Questions)", icon: HelpCircle, badge: String(questions.length), badgeColor: "bg-teal-100 text-teal-800" },
    { id: "subjects", label: "বিষয়সমূহ", icon: BookOpen },
    { id: "users", label: "ইউজারস", icon: Users, badge: String(users.length), badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
    { id: "settings", label: "সেটিংস", icon: Settings },
  ];

  const filteredQuestions = searchQuery
    ? questions.filter(q => q.questionText.toLowerCase().includes(searchQuery.toLowerCase()))
    : questions;

  return (
    <div className="h-screen bg-slate-950 font-sans flex overflow-hidden text-white relative">
      {/* TOAST */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-teal-400/40">
          <CheckCircle width={16} height={16} />
          {toastMessage}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800/80 transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"}`}>
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-800/80">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Zap width={16} height={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white leading-none">QuizMate</p>
              <p className="text-[9px] font-bold text-teal-400 leading-none mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Super Admin Hub
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 text-left group ${
                  isActive ? "bg-teal-600/20 text-teal-400 border border-teal-500/20 shadow-sm" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon width={17} height={17} className={`flex-shrink-0 ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                {sidebarOpen && <span className="text-xs font-bold flex-1 truncate">{item.label}</span>}
                {sidebarOpen && item.badge && <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 p-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
              <Shield width={14} height={14} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">শামীম হোসেন</p>
                <p className="text-[9px] font-medium text-teal-400">Super Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <LayoutDashboard width={15} height={15} />
            </button>
            <div>
              <h1 className="text-sm font-black text-white leading-none">
                {navItems.find((n) => n.id === activeNav)?.label ?? "ড্যাশবোর্ড"}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">QuizMate সম্পূর্ণ কন্ট্রোল প্যানেল (Class/Subject/Chapter & Questions)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:flex items-center">
              <Search width={13} height={13} className="absolute left-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-[11px] bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 w-44 transition-all"
              />
            </div>

            {/* BULK JSON UPLOAD BUTTON */}
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-extrabold transition-all shadow-lg shadow-purple-600/20"
            >
              <Upload width={13} height={13} />
              JSON Bulk Upload
            </button>

            <button
              onClick={() => {
                if (activeNav === "subjects") setIsAddSubjectOpen(true);
                else if (activeNav === "users") setIsAddUserOpen(true);
                else setIsAddQuizOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white text-[11px] font-extrabold transition-all shadow-lg shadow-teal-600/20"
            >
              <Plus width={13} height={13} />
              নতুন কুইজ
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
                      { label: "মোট ইউজার", value: String(users.length), change: "+১২%", up: true, icon: Users, color: "#0D9488", bg: "#E6F4F1" },
                      { label: "মোট কুইজ", value: String(quizzes.length), change: "+৮%", up: true, icon: ListChecks, color: "#6366F1", bg: "#EEF2FF" },
                      { label: "মোট প্রশ্ন", value: String(questions.length), change: "+৩৪%", up: true, icon: HelpCircle, color: "#A855F7", bg: "#F3E8FF" },
                      { label: "মোট বিষয়", value: String(subjects.length), change: "+২৩%", up: true, icon: BookOpen, color: "#F59E0B", bg: "#FFFBEB" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                            <s.icon width={17} height={17} style={{ color: s.color }} />
                          </div>
                          <div className={`flex items-center gap-0.5 text-[10px] font-extrabold ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                            {s.up ? <ArrowUpRight width={12} height={12} /> : <ArrowDownRight width={12} height={12} />}
                            {s.change}
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
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">+২৩% ↑</span>
                      </div>
                      <div className="flex items-end justify-between gap-2 h-28">
                        {weeklyData.map((h, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: i === 5 ? "linear-gradient(180deg,#0D9488,#047857)" : "rgba(255,255,255,0.07)" }} />
                            <span className="text-[9px] font-bold text-slate-500">{weekDays[i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-4 flex flex-col gap-3">
                      <p className="text-sm font-extrabold text-white">লাইভ স্ট্যাটস</p>
                      {[
                        { label: "এখন অনলাইন", value: "৩৪৭", icon: Circle, color: "text-emerald-400 fill-emerald-400", pulse: true },
                        { label: "আজ নতুন ইউজার", value: `+${users.length}`, icon: Users, color: "text-teal-400" },
                        { label: "মোট প্রশ্ন সংখ্যা", value: String(questions.length), icon: HelpCircle, color: "text-purple-400" },
                        { label: "গড় সেশন", value: "১৮ মি.", icon: Activity, color: "text-indigo-400" },
                        { label: "টপ স্ট্রিক", value: "২৪ দিন", icon: Flame, color: "text-orange-400" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                          <div className="flex items-center gap-2">
                            <item.icon width={13} height={13} className={item.color + (item.pulse ? " animate-pulse" : "")} />
                            <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                          </div>
                          <span className="text-xs font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* QUESTIONS BANK TAB (NEW SECTION) */}
              {activeNav === "questions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                        <HelpCircle width={18} height={18} className="text-purple-400" />
                        প্রশ্ন ব্যাংক ও এডিটর ({questions.length}টি প্রশ্ন)
                      </h2>
                      <p className="text-[10px] text-slate-500">সব যুক্ত করা প্রশ্ন দেখুন, এডিট বা ডিলিট করুন</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                      >
                        <Upload width={12} height={12} /> Bulk JSON Upload
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {filteredQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 space-y-3 relative group hover:border-slate-700 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-lg bg-purple-900/60 text-purple-300 font-black text-xs flex items-center justify-center border border-purple-500/20">
                              {idx + 1}
                            </span>
                            <h3 className="text-sm font-extrabold text-white">{q.questionText}</h3>
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
                        <div className="grid grid-cols-2 gap-2 text-xs">
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
                    ))}
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white">বিষয়সমূহ ম্যানেজমেন্ট</h2>
                      <p className="text-[10px] text-slate-500">Firebase `subjects` কালেকশন</p>
                    </div>
                    <button onClick={() => setIsAddSubjectOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow">
                      <Plus width={13} height={13} /> নতুন বিষয় যোগ করুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {subjects.map((sub) => (
                      <div key={sub.id} className="rounded-2xl p-4 bg-slate-900 border border-slate-800/80 flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{sub.classId}</span>
                          <div className="h-3 w-3 rounded-full" style={{ background: sub.color || "#0D9488" }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{sub.name}</h3>
                          <p className="text-[10px] text-slate-500">Slug: /{sub.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USERS TABLE */}
              {activeNav === "users" && (
                <div className="rounded-2xl bg-slate-900 border border-slate-800/80 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
                    <div>
                      <p className="text-sm font-extrabold text-white">ইউজার ম্যানেজমেন্ট ({users.length})</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Firebase স্টুডেন্ট রেকর্ডস</p>
                    </div>
                    <button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-1 text-[10px] font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg hover:bg-teal-500/20 transition-all">
                      <Plus width={10} height={10} /> ইউজার যোগ করুন
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800/60">
                          {["ইউজার", "ক্লাস", "XP", "স্ট্রিক", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, idx) => (
                          <tr key={u.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/40 transition-colors group">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${["bg-teal-900 text-teal-300","bg-indigo-900 text-indigo-300","bg-rose-900 text-rose-300","bg-amber-900 text-amber-300"][idx % 4]}`}>
                                  {u.name.slice(0, 1)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{u.name}</p>
                                  <p className="text-[9px] text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-[11px] text-slate-400 font-medium">{u.class}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-[11px] font-black text-teal-400 flex items-center gap-0.5">
                                <Star width={10} height={10} className="fill-teal-400" /> {u.xp}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-[11px] font-black text-orange-400 flex items-center gap-0.5">
                                <Flame width={10} height={10} className="fill-orange-400" /> {u.streak}d
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => toggleUserStatus(u.id, u.status)}
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border transition-all ${
                                  u.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                }`}
                              >
                                {u.status === "active" ? "• অ্যাক্টিভ" : "✕ ব্যানড"}
                              </button>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => toggleUserStatus(u.id, u.status)} title="স্ট্যাটাস টগল" className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all">
                                  <RefreshCw width={11} height={11} />
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} title="মুছে ফেলুন" className="h-6 w-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all">
                                  <Trash2 width={11} height={11} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                JSON Bulk Question Upload
              </h3>
              <button onClick={() => setIsBulkUploadOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleBulkUpload} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ক্লাস (Class)</label>
                  <select
                    value={bulkMeta.classId}
                    onChange={(e) => setBulkMeta({ ...bulkMeta, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">বিষয় (Subject)</label>
                  <select
                    value={bulkMeta.subjectId}
                    onChange={(e) => setBulkMeta({ ...bulkMeta, subjectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-bold">JSON অ্যারেকে এখানে পেস্ট করুন:</label>
                  <span className="text-[10px] text-purple-400 font-mono">Format: [{`{ questionText, options, correctAnswer, explanation }`}]</span>
                </div>
                <textarea
                  rows={8}
                  value={bulkJsonInput}
                  onChange={(e) => setBulkJsonInput(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 focus:outline-none focus:border-purple-500"
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

      {/* ===== MODAL: EDIT QUESTION ===== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 width={16} height={16} className="text-amber-400" />
                প্রশ্ন এডিটর (Edit Question)
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">প্রশ্ন (Question Text)</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
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

              <div className="pt-2 flex justify-end gap-2">
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
                নতুন বিষয় যুক্ত করুন (Firebase Live)
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-white">
                <X width={16} height={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">বিষয়ের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হিসাববিজ্ঞান"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">বাতিল</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg">Firebase-এ সেভ করুন</button>
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
    </div>
  );
}
