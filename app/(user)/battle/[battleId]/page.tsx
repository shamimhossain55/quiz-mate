"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Swords,
  Trophy,
  Zap,
  Timer,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Home,
  Crown,
  Users,
  Flame,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenToBattleRoom,
  submitBattleAnswer,
  startBattleActivePhase,
  BattleRoom,
} from "@/lib/rtdb/battle-service";
import { updateStudentStats } from "@/lib/firestore/student";

function triggerVictoryCelebration() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "9999";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#F59E0B", "#10B981", "#6366F1", "#EC4899", "#3B82F6", "#F43F5E"];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRot: number;
    life: number;
  }> = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.55,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 15 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      life: 1,
    });
  }

  let animationFrame: number;
  function update() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.rotation += p.vRot;
      p.life -= 0.014;

      if (p.life > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  animationFrame = requestAnimationFrame(update);
}

interface PageProps {
  params: Promise<{ battleId: string }>;
}

export default function BattleArenaPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const battleId = resolvedParams.battleId;
  const router = useRouter();
  const { data: session } = useSession();

  const myEmail = session?.user?.email?.toLowerCase() || "";
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [myTotalScore, setMyTotalScore] = useState<number>(0);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to Battle Room
  useEffect(() => {
    if (!battleId) return;

    const unsub = listenToBattleRoom(battleId, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => unsub();
  }, [battleId]);

  const myRole: "player1" | "player2" | null =
    room?.player1?.email === myEmail
      ? "player1"
      : room?.player2?.email === myEmail
      ? "player2"
      : null;

  const opponentRole = myRole === "player1" ? "player2" : "player1";
  const me = myRole ? room?.[myRole] : null;
  const opponent = opponentRole ? room?.[opponentRole] : null;

  // 2. Countdown sequence when status is "countdown"
  useEffect(() => {
    if (room?.status === "countdown") {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (myRole === "player1") {
              startBattleActivePhase(battleId).catch(() => {});
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [room?.status, battleId, myRole]);

  // 3. Question Timer countdown (15s per question)
  useEffect(() => {
    if (room?.status !== "active" || hasAnswered || !room.questions) return;

    questionStartTimeRef.current = Date.now();
    setTimerSeconds(15);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          // Time expired -> Auto submit timeout (wrong answer)
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentQIndex, room?.status, hasAnswered]);

  // 4. Trigger confetti & reward XP on battle completion
  useEffect(() => {
    if (room?.status === "completed" && !xpAwarded && myEmail && myRole) {
      setXpAwarded(true);
      const isWinner = room.winnerEmail === myEmail;
      const isDraw = room.winnerEmail === "draw";
      const xpEarned = isWinner ? 100 : isDraw ? 60 : 30;

      if (isWinner) {
        try {
          triggerVictoryCelebration();
        } catch {}
      }

      // Update student points in Firestore
      updateStudentStats({
        studentId: myEmail,
        point: xpEarned,
        name: session?.user?.name || undefined,
        email: myEmail,
      }).catch(() => {});
    }
  }, [room?.status, room?.winnerEmail, xpAwarded, myEmail, myRole, session]);

  // Answer handler
  const handleAnswer = (optionIdx: number, isTimeout = false) => {
    if (hasAnswered || !room || !myRole || !room.questions[currentQIndex]) return;

    setHasAnswered(true);
    setSelectedOption(optionIdx);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const q = room.questions[currentQIndex];
    const isCorrect = optionIdx === q.correctAnswer;
    const timeTaken = Math.min(15, Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000)));

    // Points algorithm: 100 max points minus time penalty
    const pointsEarned = isCorrect ? Math.max(40, 100 - timeTaken * 4) : 0;
    const newTotal = myTotalScore + pointsEarned;
    setMyTotalScore(newTotal);

    const isLast = currentQIndex >= room.totalQuestions - 1;

    submitBattleAnswer({
      battleId,
      playerRole: myRole,
      questionIndex: currentQIndex,
      selectedOption: optionIdx,
      isCorrect,
      timeTaken,
      pointsEarned,
      newTotalScore: newTotal,
      nextIndex: isLast ? currentQIndex + 1 : currentQIndex + 1,
      isLastQuestion: isLast,
    }).catch((err) => console.error("Submit battle answer error:", err));

    // Transition to next question after short visual delay
    setTimeout(() => {
      if (!isLast) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
        setHasAnswered(false);
      }
    }, 1200);
  };

  if (!room) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3 p-4">
        <Loader2 width={32} height={32} className="animate-spin text-teal-400" />
        <p className="text-sm font-bold text-slate-400">ব্যাটেল অ্যারিনা লোড হচ্ছে...</p>
      </div>
    );
  }

  // ── COUNTDOWN SCREEN ────────────────────────────────────────────────────────
  if (room.status === "countdown") {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm text-center space-y-8 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-black">
            <Swords width={14} height={14} className="animate-bounce" />
            ১v১ লাইভ কুইজ ব্যাটেল
          </div>

          {/* Versus Display */}
          <div className="flex items-center justify-between px-4 py-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
            {/* Player 1 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-2xl ring-4 ring-teal-400 bg-teal-600 flex items-center justify-center font-black text-2xl overflow-hidden shadow-lg shadow-teal-500/20">
                {room.player1.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.player1.avatarUrl} alt={room.player1.name} className="h-full w-full object-cover" />
                ) : (
                  room.player1.name.charAt(0).toUpperCase()
                )}
              </div>
              <p className="text-xs font-extrabold text-white truncate max-w-[100px]">{room.player1.name}</p>
            </div>

            {/* VS Emblem */}
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/40">
              <span className="text-sm font-black text-white tracking-widest">VS</span>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="h-16 w-16 rounded-2xl ring-4 ring-violet-400 bg-violet-600 flex items-center justify-center font-black text-2xl overflow-hidden shadow-lg shadow-violet-500/20">
                {room.player2.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.player2.avatarUrl} alt={room.player2.name} className="h-full w-full object-cover" />
                ) : (
                  room.player2.name.charAt(0).toUpperCase()
                )}
              </div>
              <p className="text-xs font-extrabold text-white truncate max-w-[100px]">{room.player2.name}</p>
            </div>
          </div>

          {/* Countdown Digit */}
          <div className="relative flex items-center justify-center">
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-rose-400 to-violet-500 drop-shadow-2xl"
            >
              {countdown > 0 ? countdown : "লড়াই শুরু! 🔥"}
            </motion.div>
          </div>

          <p className="text-xs text-slate-400 font-bold">
            বিষয়: <span className="text-teal-400 font-extrabold">{room.subjectName}</span> ({room.totalQuestions}টি প্রশ্ন)
          </p>
        </motion.div>
      </div>
    );
  }

  // ── COMPLETED SCREEN ────────────────────────────────────────────────────────
  if (room.status === "completed") {
    const isWinner = room.winnerEmail === myEmail;
    const isDraw = room.winnerEmail === "draw";
    const myScore = me?.score || 0;
    const oppScore = opponent?.score || 0;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 text-center shadow-2xl relative z-10"
        >
          {/* Winner Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 shadow-xl shadow-amber-500/20 mx-auto">
              {isWinner ? (
                <Crown width={32} height={32} className="text-white animate-bounce" />
              ) : isDraw ? (
                <Sparkles width={30} height={30} className="text-white" />
              ) : (
                <Trophy width={30} height={30} className="text-white" />
              )}
            </div>

            <h2 className="text-2xl font-black text-white">
              {isWinner ? "🎉 আপনি বিজয়ী হয়েছেন!" : isDraw ? "🤝 ম্যাচ ড্র হয়েছে!" : "💪 দুর্দান্ত লড়াই হয়েছে!"}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isWinner ? "+100 XP বোনাস অর্জন করেছেন!" : isDraw ? "+60 XP অর্জন করেছেন!" : "+30 XP অংশগ্রহণ বোনাস"}
            </p>
          </div>

          {/* Final Head-to-Head Comparison Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              {/* You */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`h-12 w-12 rounded-xl ring-2 ${isWinner ? "ring-amber-400" : "ring-slate-700"} overflow-hidden bg-slate-800 flex items-center justify-center font-bold`}>
                  {me?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={me.avatarUrl} alt="You" className="h-full w-full object-cover" />
                  ) : (
                    me?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[80px]">{me?.name} (আপনি)</span>
                <span className="text-base font-black text-amber-400">{myScore} pts</span>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] font-black text-slate-500">VS</span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`h-12 w-12 rounded-xl ring-2 ${!isWinner && !isDraw ? "ring-amber-400" : "ring-slate-700"} overflow-hidden bg-slate-800 flex items-center justify-center font-bold`}>
                  {opponent?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={opponent.avatarUrl} alt="Opponent" className="h-full w-full object-cover" />
                  ) : (
                    opponent?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-[80px]">{opponent?.name}</span>
                <span className="text-base font-black text-violet-400">{oppScore} pts</span>
              </div>
            </div>

            {/* Points Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.max(10, Math.min(90, (myScore / Math.max(1, myScore + oppScore)) * 100))}%` }}
              />
              <div
                className="bg-violet-500 transition-all duration-500"
                style={{ width: `${Math.max(10, Math.min(90, (oppScore / Math.max(1, myScore + oppScore)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => router.push("/community")}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-xs font-black shadow-lg shadow-teal-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home width={15} height={15} />
              কমিউনিটিতে ফিরে যান
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE GAMEPLAY SCREEN ──────────────────────────────────────────────────
  const currentQ = room.questions[currentQIndex];
  const isFinishedWaiting = currentQIndex >= room.totalQuestions;

  return (
    <div className="h-screen bg-slate-950 flex flex-col text-white relative overflow-hidden select-none">
      {/* Background ambient gradient */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-violet-600/15 to-transparent pointer-events-none" />

      {/* TOP LIVE SCOREBOARD */}
      <div className="p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex flex-col gap-2.5 z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Player 1 (You) */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-teal-600 ring-2 ring-teal-400 overflow-hidden flex items-center justify-center font-black text-sm">
                {me?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatarUrl} alt="You" className="h-full w-full object-cover" />
                ) : (
                  me?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white truncate">{me?.name}</p>
              <p className="text-[10px] font-extrabold text-teal-400">{me?.score || 0} pts</p>
            </div>
          </div>

          {/* Timer Circle */}
          <div className="flex flex-col items-center px-2">
            <div
              className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-colors font-black text-xs ${
                timerSeconds <= 5
                  ? "border-rose-500 text-rose-400 bg-rose-500/10 animate-pulse"
                  : "border-teal-400 text-teal-300 bg-teal-500/10"
              }`}
            >
              {timerSeconds}
            </div>
            <span className="text-[8px] font-bold text-slate-500 mt-0.5">
              প্রশ্ন {Math.min(room.totalQuestions, currentQIndex + 1)}/{room.totalQuestions}
            </span>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white truncate">{opponent?.name}</p>
              <p className="text-[10px] font-extrabold text-violet-400">{opponent?.score || 0} pts</p>
            </div>
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-violet-600 ring-2 ring-violet-400 overflow-hidden flex items-center justify-center font-black text-sm">
                {opponent?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={opponent.avatarUrl} alt="Opponent" className="h-full w-full object-cover" />
                ) : (
                  opponent?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Tug-of-War Health Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-teal-400 transition-all duration-300"
            style={{
              width: `${
                ((me?.score || 0) + (opponent?.score || 0) === 0)
                  ? 50
                  : Math.max(15, Math.min(85, ((me?.score || 0) / ((me?.score || 0) + (opponent?.score || 0))) * 100))
              }%`,
            }}
          />
          <div
            className="bg-violet-500 transition-all duration-300 flex-1"
          />
        </div>
      </div>

      {/* QUESTION BODY */}
      <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        {isFinishedWaiting ? (
          <div className="my-auto text-center space-y-3 p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="w-12 h-12 rounded-full border-4 border-teal-400/20 border-t-teal-400 animate-spin mx-auto" />
            <h3 className="text-base font-black text-white">আপনি সব প্রশ্নের উত্তর দিয়েছেন! 🎉</h3>
            <p className="text-xs text-slate-400">প্রতিদ্বন্দ্বীর ম্যাচ শেষ হওয়া পর্যন্ত অপেক্ষা করা হচ্ছে...</p>
          </div>
        ) : currentQ ? (
          <div className="space-y-4 my-auto">
            {/* Question Text */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-lg space-y-2">
              <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                প্রশ্ন {currentQIndex + 1}
              </span>
              <h2 className="text-sm md:text-base font-black text-white leading-relaxed">
                {currentQ.questionText}
              </h2>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((optText, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === currentQ.correctAnswer;

                let btnStyle = "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700";
                if (hasAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-600/20 border-rose-500 text-rose-300";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(oIdx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs md:text-sm font-bold transition-all flex items-center justify-between gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span>{optText}</span>
                    {hasAnswered && isCorrect && <CheckCircle2 width={18} height={18} className="text-emerald-400 flex-shrink-0" />}
                    {hasAnswered && isSelected && !isCorrect && <XCircle width={18} height={18} className="text-rose-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Live Opponent Action Status Pill */}
        <div className="py-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] font-bold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {opponent?.isFinished
              ? `${opponent.name} সব প্রশ্নের উত্তর শেষ করেছে ⚡`
              : (opponent?.currentQuestionIndex || 0) > currentQIndex
              ? `${opponent?.name} পরবর্তী প্রশ্নে এগিয়ে আছে 🚀`
              : `${opponent?.name} লাইভ খেলছে...`}
          </div>
        </div>
      </div>
    </div>
  );
}
