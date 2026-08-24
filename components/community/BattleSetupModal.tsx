"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Swords,
  X,
  Loader2,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSubjects } from "@/lib/firestore/subjects";
import { getChapters } from "@/lib/firestore/chapters";
import { getBattleQuestions } from "@/lib/firestore/questions";
import { Chapter } from "@/types/firestore";
import {
  createBattleChallenge,
  listenToBattleRoom,
  BattleRoom,
} from "@/lib/rtdb/battle-service";

type FriendTarget = {
  email: string;
  name: string;
  avatarUrl: string | null;
  className?: string;
  level?: number;
};

interface BattleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendTarget | null;
  myEmail: string;
  myName: string;
  myAvatarUrl?: string | null;
  myClassId?: string;
}

export default function BattleSetupModal({
  isOpen,
  onClose,
  friend,
  myEmail,
  myName,
  myAvatarUrl,
  myClassId = "class6",
}: BattleSetupModalProps) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; slug?: string }>>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("general");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("সাধারণ জ্ঞান");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
  const [selectedChapterName, setSelectedChapterName] = useState<string>("সব অধ্যায়");
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [waitingStatus, setWaitingStatus] = useState<string>("waiting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available subjects
  useEffect(() => {
    if (!isOpen) {
      setIsSending(false);
      setActiveBattleId(null);
      setErrorMsg(null);
      setChapters([]);
      setSelectedChapterId("all");
      setSelectedChapterName("সব অধ্যায়");
      return;
    }

    async function loadSubs() {
      setIsLoadingSubjects(true);
      try {
        const subs = await getSubjects(myClassId, "all").catch(() => []);
        if (subs && subs.length > 0) {
          setSubjects([
            { id: "general", name: "সাধারণ জ্ঞান (General)" },
            ...subs.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
          ]);
        } else {
          setSubjects([
            { id: "general", name: "সাধারণ জ্ঞান (General)" },
            { id: "bangla", name: "বাংলা" },
            { id: "english", name: "English" },
            { id: "math", name: "গণিত" },
            { id: "science", name: "বিজ্ঞান" },
          ]);
        }
      } catch {
        setSubjects([
          { id: "general", name: "সাধারণ জ্ঞান (General)" },
          { id: "bangla", name: "বাংলা" },
          { id: "math", name: "গণিত" },
        ]);
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    loadSubs();
  }, [isOpen, myClassId]);

  // Load chapters when subject changes
  useEffect(() => {
    if (!isOpen || selectedSubjectId === "general") {
      setChapters([]);
      setSelectedChapterId("all");
      setSelectedChapterName("সব অধ্যায়");
      return;
    }

    async function loadChapters() {
      setIsLoadingChapters(true);
      setSelectedChapterId("all");
      setSelectedChapterName("সব অধ্যায়");
      try {
        const fetched = await getChapters(selectedSubjectId);
        setChapters(fetched);
      } catch {
        setChapters([]);
      } finally {
        setIsLoadingChapters(false);
      }
    }
    loadChapters();
  }, [isOpen, selectedSubjectId]);

  // Listen to battle room status once challenge is sent
  useEffect(() => {
    if (!activeBattleId) return;

    const unsub = listenToBattleRoom(activeBattleId, (room: BattleRoom | null) => {
      if (!room) return;

      if (room.status === "countdown" || room.status === "active") {
        setWaitingStatus("accepted");
        setTimeout(() => {
          onClose();
          router.push(`/battle/${activeBattleId}`);
        }, 800);
      } else if (room.status === "declined") {
        setWaitingStatus("declined");
        setErrorMsg("বন্ধু চ্যালেঞ্জটি প্রত্যাখ্যান করেছেন বা ব্যস্ত আছেন।");
      }
    });

    return () => unsub();
  }, [activeBattleId, router, onClose]);

  const handleSendChallenge = async () => {
    if (!friend || !myEmail) return;
    setIsSending(true);
    setErrorMsg(null);
    setWaitingStatus("waiting");

    try {
      // 1. Fetch battle questions
      const battleQuestions = await getBattleQuestions(selectedSubjectId, questionCount, selectedChapterId);

      // 2. Create room in RTDB & push invite
      const battleId = await createBattleChallenge({
        inviter: {
          email: myEmail,
          name: myName,
          avatarUrl: myAvatarUrl,
        },
        friend: {
          email: friend.email,
          name: friend.name,
          avatarUrl: friend.avatarUrl,
        },
        classId: myClassId,
        subjectId: selectedSubjectId,
        subjectName: selectedSubjectName,
        questions: battleQuestions,
      });

      setActiveBattleId(battleId);
    } catch (err: any) {
      console.error("Failed to start battle:", err);
      setIsSending(false);
      setErrorMsg("ব্যাটেল চ্যালেঞ্জ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  if (!isOpen || !friend) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white"
        >
          {/* Header Glow Orb */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
          >
            <X width={16} height={16} />
          </button>

          <div className="p-6 space-y-5">
            {/* Title & Badge */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-black">
                <Swords width={13} height={13} className="animate-pulse" />
                ১v১ রিয়েল-টাইম কুইজ ব্যাটেল
              </div>
              <h3 className="text-lg font-black text-white">বন্ধুকে চ্যালেঞ্জ পাঠান</h3>
              <p className="text-xs text-slate-400">লাইভ কুইজ খেলায় মুখোমুখি প্রতিযোগিতা করুন!</p>
            </div>

            {/* VS Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              {/* You */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-12 w-12 rounded-full ring-2 ring-teal-400 bg-teal-600 flex items-center justify-center font-black text-white text-base overflow-hidden">
                  {myAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={myAvatarUrl} alt={myName} className="h-full w-full object-cover" />
                  ) : (
                    myName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px]">{myName}</span>
                <span className="text-[9px] font-extrabold text-teal-400 bg-teal-500/10 px-1.5 rounded">আপনি</span>
              </div>

              {/* VS Badge */}
              <div className="flex flex-col items-center justify-center px-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <span className="text-[11px] font-black text-white tracking-wider">VS</span>
                </div>
              </div>

              {/* Friend */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-12 w-12 rounded-full ring-2 ring-violet-400 bg-violet-600 flex items-center justify-center font-black text-white text-base overflow-hidden">
                  {friend.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
                  ) : (
                    friend.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px]">{friend.name}</span>
                <span className="text-[9px] font-extrabold text-violet-400 bg-violet-500/10 px-1.5 rounded">প্রতিদ্বন্দ্বী</span>
              </div>
            </div>

            {/* If Waiting for response */}
            {isSending ? (
              <div className="py-6 text-center space-y-3">
                {waitingStatus === "waiting" && (
                  <div className="space-y-3">
                    <div className="relative flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                      <Swords width={20} height={20} className="absolute text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">চ্যালেঞ্জ পাঠানো হয়েছে...</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {friend.name}-এর সম্মতির অপেক্ষা করা হচ্ছে
                      </p>
                    </div>
                  </div>
                )}

                {waitingStatus === "accepted" && (
                  <div className="space-y-2 text-emerald-400">
                    <CheckCircle2 width={36} height={36} className="mx-auto animate-bounce" />
                    <p className="text-sm font-black">চ্যালেঞ্জ গৃহীত হয়েছে! ব্যাটেল শুরু হচ্ছে...</p>
                  </div>
                )}

                {waitingStatus === "declined" && (
                  <div className="space-y-2 text-rose-400">
                    <AlertCircle width={32} height={32} className="mx-auto" />
                    <p className="text-xs font-bold text-rose-300">{errorMsg}</p>
                    <button
                      onClick={() => setIsSending(false)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all"
                    >
                      আবার চেষ্টা করুন
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Config Form */
              <div className="space-y-4">
                {/* Subject Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                    <BookOpen width={13} height={13} className="text-violet-400" />
                    বিষয় নির্বাচন করুন:
                  </label>
                  {isLoadingSubjects ? (
                    <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
                  ) : (
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => {
                        setSelectedSubjectId(e.target.value);
                        const match = subjects.find((s) => s.id === e.target.value);
                        if (match) setSelectedSubjectName(match.name);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Chapter Picker — only shown when chapters exist for selected subject */}
                {(isLoadingChapters || chapters.length > 0) && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                      <Sparkles width={13} height={13} className="text-teal-400" />
                      অধ্যায় নির্বাচন করুন:
                    </label>
                    {isLoadingChapters ? (
                      <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
                    ) : (
                      <select
                        value={selectedChapterId}
                        onChange={(e) => {
                          setSelectedChapterId(e.target.value);
                          if (e.target.value === "all") {
                            setSelectedChapterName("সব অধ্যায়");
                          } else {
                            const match = chapters.find((c) => c.id === e.target.value);
                            if (match) setSelectedChapterName(match.name);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                      >
                        <option value="all">📚 সব অধ্যায় (মিশ্র প্রশ্ন)</option>
                        {chapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Question Count Picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Zap width={13} height={13} className="text-amber-400" />
                    প্রশ্ন সংখ্যা:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { count: 5, label: "৫টি প্রশ্ন (কুইক ম্যাচ)" },
                      { count: 10, label: "১০টি প্রশ্ন (ফুল ম্যাচ)" },
                    ].map((opt) => (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setQuestionCount(opt.count)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          questionCount === opt.count
                            ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center font-bold">
                    {errorMsg}
                  </p>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSendChallenge}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 text-white text-xs font-black shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords width={16} height={16} />
                  ব্যাটেল শুরু করুন (+100 XP) 🚀
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
