"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Flame,
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
  Sparkles,
  LucideIcon,
  RotateCcw,
  Target,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { getUserResults } from "@/lib/firestore/results";
import { getStudentProfile } from "@/lib/firestore/student";

/**
 * Premium Progress (উন্নতি) Analytics Page
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
  subjectSlug: string;
  score: number;
  totalMarks: number;
  date: string;
  durationMin: number;
  percentage: number;
};

const initialOverview = { totalQuiz: 0, avgScore: 0, bestScore: 0, streak: 0 };

const SUBJECT_CONFIGS: Array<{ key: string; name: string; icon: LucideIcon; color: string }> = [
  { key: "bangla", name: "বাংলা", icon: Languages, color: "#F43F5E" },
  { key: "english", name: "English", icon: BookOpen, color: "#0D9488" },
  { key: "math", name: "গণিত", icon: Calculator, color: "#6366F1" },
  { key: "science", name: "বিজ্ঞান", icon: FlaskConical, color: "#D97706" },
  { key: "ict", name: "আইসিটি", icon: Globe2, color: "#0284C7" },
  { key: "social-science", name: "সমাজবিজ্ঞান", icon: Landmark, color: "#8B5CF6" },
];

export default function ProgressPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "history">("overview");
  const [userOverview, setUserOverview] = useState(initialOverview);
  const [attemptsList, setAttemptsList] = useState<Attempt[]>([]);
  const [subjectProgressList, setSubjectProgressList] = useState<SubjectProgress[]>([]);
  const [weakTopicsList, setWeakTopicsList] = useState<WeakTopic[]>([]);
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function loadStats() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userId = session.user.email;
        const [results, profile] = await Promise.all([
          getUserResults(userId),
          getStudentProfile(userId),
        ]);

        console.log("[ProgressPage] userId:", userId, "results:", results?.length ?? 0, results);

        // Init empty subject list always
        const emptySubjects: SubjectProgress[] = SUBJECT_CONFIGS.map((cfg) => ({
          id: cfg.key, name: cfg.name, icon: cfg.icon, color: cfg.color,
          accuracy: 0, totalQuiz: 0, trend: "same",
        }));
        setSubjectProgressList(emptySubjects);

        if (!results || results.length === 0) {
          setHasData(false);
          setLoading(false);
          return;
        }

        setHasData(true);

        // ── Overview stats ──
        const totalQ = results.length;
        const percentages = results.map((r) => {
          const rPct = r.percentage ?? 0;
          return rPct > 0 ? rPct : Math.round((r.score / Math.max(1, r.correct + r.wrong)) * 100);
        });
        const avgPct = Math.round(percentages.reduce((a, b) => a + b, 0) / totalQ);
        const maxPct = Math.max(...percentages);
        setUserOverview({
          totalQuiz: totalQ,
          avgScore: avgPct,
          bestScore: maxPct,
          streak: profile?.streak || 1,
        });

        // ── Attempt history ──
        const mappedAttempts: Attempt[] = results.map((r) => {
          const rawChapter = r.chapterId || "";
          let matchedSubName = "সাধারণ";
          let matchedSlug = "general";
          for (const cfg of SUBJECT_CONFIGS) {
            if (rawChapter.toLowerCase().includes(cfg.key)) {
              matchedSubName = cfg.name;
              matchedSlug = cfg.key;
              break;
            }
          }
          const totalM = r.correct + r.wrong > 0 ? r.correct + r.wrong : 10;
          const rPct = r.percentage ?? 0;
          const pct: number = rPct > 0 ? rPct : Math.round((r.score / totalM) * 100);
          return {
            id: r.id,
            quizName: `অধ্যায় কুইজ (${rawChapter.replace(/^class\d+_/, "").replace(/_/g, " ") || "অনুশীলনী"})`,
            subject: matchedSubName,
            subjectSlug: matchedSlug,
            score: r.score,
            totalMarks: totalM,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("bn-BD") : "আজ",
            durationMin: r.timeTaken || 10,
            percentage: pct,
          };
        });
        setAttemptsList(mappedAttempts);

        // ── Weekly heatmap ──
        const counts = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        results.forEach((r) => {
          if (r.createdAt) {
            const d = new Date(r.createdAt);
            if (d >= oneWeekAgo) {
              const jsDay = d.getDay();
              const mapped = jsDay === 6 ? 0 : jsDay + 1;
              counts[mapped] = (counts[mapped] || 0) + 1;
            }
          }
        });
        setWeeklyCounts(counts);

        // ── Subject breakdown ──
        const statsMap: Record<string, { total: number; sumPct: number; pcts: number[] }> = {};
        results.forEach((r) => {
          const rawChapter = (r.chapterId || "").toLowerCase();
          let key = "general";
          for (const cfg of SUBJECT_CONFIGS) {
            if (rawChapter.includes(cfg.key)) { key = cfg.key; break; }
          }
          if (!statsMap[key]) statsMap[key] = { total: 0, sumPct: 0, pcts: [] };
          const rPct2 = r.percentage ?? 0;
          const pct: number = rPct2 > 0 ? rPct2 : Math.round((r.score / Math.max(1, r.correct + r.wrong)) * 100);
          statsMap[key].total += 1;
          statsMap[key].sumPct += pct;
          statsMap[key].pcts.push(pct);
        });

        const computedSubjects: SubjectProgress[] = SUBJECT_CONFIGS.map((cfg) => {
          const stat = statsMap[cfg.key];
          if (!stat || stat.total === 0) {
            return { id: cfg.key, name: cfg.name, icon: cfg.icon, color: cfg.color, accuracy: 0, totalQuiz: 0, trend: "same" };
          }
          const accuracy = Math.round(stat.sumPct / stat.total);
          const trend: "up" | "down" | "same" =
            stat.pcts.length >= 2
              ? stat.pcts[0] > stat.pcts[stat.pcts.length - 1] ? "up"
                : stat.pcts[0] < stat.pcts[stat.pcts.length - 1] ? "down" : "same"
              : "same";
          return { id: cfg.key, name: cfg.name, icon: cfg.icon, color: cfg.color, accuracy, totalQuiz: stat.total, trend };
        });
        setSubjectProgressList(computedSubjects);

        // ── Weak topics ──
        const weakList: WeakTopic[] = [];
        computedSubjects.forEach((sub) => {
          if (sub.totalQuiz > 0 && sub.accuracy < 70) {
            weakList.push({ id: sub.id, subject: sub.name, topic: `${sub.name} বেসিক ও অনুশীলনী`, accuracy: sub.accuracy });
          }
        });
        results.forEach((r) => {
          const rPct3 = r.percentage ?? 0;
          const pct: number = rPct3 > 0 ? rPct3 : Math.round((r.score / Math.max(1, r.correct + r.wrong)) * 100);
          if (pct < 60) {
            const chName = (r.chapterId || "অনুশীলনী").replace(/^class\d+_/, "").replace(/_/g, " ");
            if (!weakList.some((w) => w.topic.includes(chName))) {
              weakList.push({
                id: r.chapterId || "ch",
                subject: r.chapterId?.includes("bangla") ? "বাংলা" : r.chapterId?.includes("math") ? "গণিত" : "সাধারণ",
                topic: `অধ্যায়: ${chName}`,
                accuracy: pct,
              });
            }
          }
        });
        setWeakTopicsList(weakList.slice(0, 3));

      } catch (err) {
        console.error("Error loading progress stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [session]);

  const maxWeeklyCount = Math.max(1, ...weeklyCounts);

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-teal-500 selection:text-white">
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2 bg-white/80 backdrop-blur-md relative z-20 border-b border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                <TrendingUp width={20} height={20} className="text-teal-700" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">আমার উন্নতি</h1>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">সামগ্রিক পারফরম্যান্স বিশ্লেষণ</p>
              </div>
            </div>
            {hasData && (
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-50/90 px-2.5 py-1 rounded-full border border-teal-200/80 shadow-2xs">
                <Sparkles width={11} height={11} className="text-amber-500" />
                <span>{userOverview.totalQuiz}টি কুইজ</span>
              </div>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 backdrop-blur-md rounded-full border border-slate-300/40 shadow-inner">
            {(["overview", "subjects", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                  activeTab === tab ? "bg-teal-700 text-white shadow-md scale-105" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "overview" ? "ওভারভিউ" : tab === "subjects" ? "বিষয়ভিত্তিক" : "হিস্ট্রি"}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 space-y-4 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-10 w-10 rounded-full border-[3px] border-teal-200 border-t-teal-600 animate-spin" />
              <p className="text-[11px] font-bold text-slate-400">ডেটা লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              {/* ─── OVERVIEW TAB ─── */}
              {activeTab === "overview" && (
                <>
                  {/* Circular progress + stats */}
                  <div className="flex items-center justify-center gap-6 py-2">
                    <CircularProgress value={userOverview.avgScore} label="গড় স্কোর" color="#0D9488" size={100} />
                    <div className="flex flex-col gap-2.5">
                      <MiniStat icon={ListChecks} label="মোট কুইজ" value={`${userOverview.totalQuiz}টি`} color="text-teal-800" bg="bg-teal-50" />
                      <MiniStat icon={Award} label="বেস্ট স্কোর" value={`${userOverview.bestScore}%`} color="text-amber-800" bg="bg-amber-50" />
                      <MiniStat icon={Flame} label="স্ট্রিক" value={`${userOverview.streak} দিন`} color="text-orange-800" bg="bg-orange-50" />
                    </div>
                  </div>

                  {/* No quiz CTA */}
                  {!hasData && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-gradient-to-br from-teal-50 to-indigo-50 rounded-2xl border border-teal-100 text-center">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-sm font-extrabold text-slate-800">এখনো কোনো কুইজ দেওয়া হয়নি</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                        প্রথম কুইজ দেওয়ার পর এখানে আপনার সামগ্রিক পারফরম্যান্স, সাপ্তাহিক অ্যাক্টিভিটি এবং দুর্বল বিষয়গুলো দেখতে পাবেন।
                      </p>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-4 text-[11px] font-extrabold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl active:scale-95 transition-all"
                      >
                        কুইজ শুরু করুন →
                      </button>
                    </div>
                  )}

                  {/* Weekly heatmap */}
                  <div className="rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-xs font-bold text-slate-700 tracking-wide">সাপ্তাহিক অ্যাক্টিভিটি</p>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">এই সপ্তাহ</span>
                    </div>
                    <div className="flex items-end justify-between gap-1.5 pt-2">
                      {["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"].map((day, i) => {
                        const count = weeklyCounts[i] || 0;
                        const heightPx = count > 0 ? Math.min(36, Math.max(12, Math.round((count / maxWeeklyCount) * 36))) : 6;
                        return (
                          <div key={day} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[8px] font-bold text-slate-500">{count > 0 ? count : ""}</span>
                            <div
                              className={`w-full rounded-lg transition-all duration-500 ${count > 0 ? "bg-gradient-to-t from-teal-600 to-teal-400 shadow-2xs" : "bg-slate-200"}`}
                              style={{ height: `${heightPx}px` }}
                            />
                            <span className="text-[9px] font-semibold text-slate-500">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weak topics */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle width={14} height={14} className="text-rose-500" />
                      <p className="text-xs font-bold text-slate-700 tracking-wide">দুর্বল জায়গা — উন্নতি প্রয়োজন</p>
                    </div>
                    {weakTopicsList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-center">
                        <p className="text-xs font-bold text-slate-700">{hasData ? "সবকিছু দারুণ চলছে! 🌟" : "কোনো তথ্য নেই"}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {hasData ? "আপনার কুইজের গড় স্কোর বেশ ভালো! অনুশীলনী চালিয়ে যান।" : "কুইজ দেওয়ার পর দুর্বল বিষয়গুলো এখানে দেখাবে।"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {weakTopicsList.map((wt) => (
                          <div key={wt.id + wt.topic} className="rounded-2xl p-3 bg-white border border-rose-100 shadow-2xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                                <Target width={16} height={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-extrabold text-slate-900 truncate">{wt.topic}</p>
                                <p className="text-[10px] text-rose-600 font-bold mt-0.5">সঠিকতা: {wt.accuracy}% (পুনরাবৃত্তি দরকার)</p>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/quiz/setup?subject=${wt.id}`)}
                              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl border border-rose-200 active:scale-95 transition-all flex-shrink-0"
                            >
                              <RotateCcw width={11} height={11} />
                              <span>অনুশীলন</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ─── SUBJECTS TAB ─── */}
              {activeTab === "subjects" && (
                <>
                  {!hasData ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <p className="text-xs font-bold text-slate-700">এখনো কোনো সাবজেক্ট ডেটা নেই</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">কুইজ দেওয়ার পর বিষয়ভিত্তিক পারফরম্যান্স এখানে দেখাবে।</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {subjectProgressList.filter((s) => s.totalQuiz > 0).map((subject) => (
                        <SubjectCard key={subject.id} subject={subject} />
                      ))}
                      {subjectProgressList.filter((s) => s.totalQuiz === 0).length > 0 && (
                        <>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 pl-1">
                            এখনো কুইজ দেওয়া হয়নি
                          </p>
                          {subjectProgressList.filter((s) => s.totalQuiz === 0).map((subject) => (
                            <SubjectCard key={subject.id} subject={subject} dimmed />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ─── HISTORY TAB ─── */}
              {activeTab === "history" && (
                <>
                  {attemptsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 text-center">
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-xs font-bold text-slate-700">কোনো পরীক্ষার ইতিহাস নেই</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">প্রথম কুইজ সম্পন্ন করলে আপনার ফলাফল এখানে রেকর্ড থাকবে।</p>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-4 text-[11px] font-extrabold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl active:scale-95 transition-all"
                      >
                        কুইজ শুরু করুন →
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {attemptsList.length}টি পরীক্ষার ইতিহাস
                      </p>
                      {attemptsList.map((a) => (
                        <AttemptRow key={a.id} attempt={a} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav activeTab="progress" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* CircularProgress                                                  */
/* ──────────────────────────────────────────────────────────────── */
function CircularProgress({ value, label, color, size }: { value: number; label: string; color: string; size: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out", filter: `drop-shadow(0 0 6px ${color}40)` }}
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

/* ──────────────────────────────────────────────────────────────── */
/* MiniStat                                                          */
/* ──────────────────────────────────────────────────────────────── */
function MiniStat({ icon: Icon, label, value, color, bg }: { icon: LucideIcon; label: string; value: string; color: string; bg: string }) {
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

/* ──────────────────────────────────────────────────────────────── */
/* SubjectCard                                                       */
/* ──────────────────────────────────────────────────────────────── */
function SubjectCard({ subject, dimmed = false }: { subject: SubjectProgress; dimmed?: boolean }) {
  const Icon = subject.icon;
  const hasAttempts = subject.totalQuiz > 0;
  const accuracyLevel = !hasAttempts ? "none" : subject.accuracy >= 80 ? "excellent" : subject.accuracy >= 60 ? "good" : "weak";
  const statusLabel = accuracyLevel === "excellent" ? "দুর্দান্ত!" : accuracyLevel === "good" ? "ভালো" : accuracyLevel === "weak" ? "উন্নতি দরকার" : "কুইজ দেওয়া হয়নি";
  const statusColor = accuracyLevel === "excellent"
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : accuracyLevel === "good"
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : accuracyLevel === "weak"
    ? "text-rose-700 bg-rose-50 border-rose-200"
    : "text-slate-500 bg-slate-50 border-slate-200";

  return (
    <div className={`rounded-2xl px-3.5 py-3 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 ${dimmed ? "opacity-50" : "hover:shadow-md active:scale-[0.99]"}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/60 shadow-inner" style={{ background: `${subject.color}15` }}>
          <Icon width={20} height={20} style={{ color: subject.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold text-slate-900 truncate">{subject.name}</p>
            {subject.trend === "up" && (
              <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 rounded-full border border-emerald-200">
                <TrendingUp width={9} height={9} />↑
              </span>
            )}
            {subject.trend === "down" && (
              <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded-full border border-rose-200">↓</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">{subject.totalQuiz}টি কুইজ সম্পন্ন</span>
            <span className={`text-[8px] font-extrabold px-1.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <MiniCircularRing value={subject.accuracy} color={subject.color} />
        </div>
      </div>
      <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${subject.accuracy}%`, background: `linear-gradient(90deg, ${subject.color}80, ${subject.color})`, boxShadow: `0 0 8px ${subject.color}40` }}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* MiniCircularRing                                                  */
/* ──────────────────────────────────────────────────────────────── */
function MiniCircularRing({ value, color }: { value: number; color: string }) {
  const size = 36;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-black text-slate-800">{value}%</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/* AttemptRow                                                        */
/* ──────────────────────────────────────────────────────────────── */
function AttemptRow({ attempt }: { attempt: Attempt }) {
  const percent = attempt.percentage || Math.round((attempt.score / Math.max(1, attempt.totalMarks)) * 100);
  const isExcellent = percent >= 80;
  const isGood = percent >= 60;
  const statusColor = isExcellent ? "text-emerald-700 bg-emerald-50 border-emerald-200" : isGood ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
  const statusLabel = isExcellent ? "দুর্দান্ত" : isGood ? "ভালো" : "আরও চেষ্টা করো";
  const ringColor = isExcellent ? "#059669" : isGood ? "#D97706" : "#E11D48";

  return (
    <div className="rounded-2xl px-3.5 py-3 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 active:scale-[0.99]">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <MiniCircularRing value={percent} color={ringColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-900 truncate">{attempt.quizName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">{attempt.subject}</span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
              <Clock width={10} height={10} /> {attempt.durationMin} মিনিট
            </span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] text-slate-400">{attempt.date}</span>
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <p className={`text-xs font-black ${isExcellent ? "text-emerald-700" : isGood ? "text-amber-700" : "text-rose-600"}`}>
            {attempt.score}/{attempt.totalMarks}
          </p>
          <span className={`text-[8px] font-extrabold px-1.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}