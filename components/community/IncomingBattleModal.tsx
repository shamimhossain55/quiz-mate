"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, X, CheckCircle, ShieldAlert, Sparkles, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  listenToIncomingBattleInvites,
  acceptBattleChallenge,
  declineBattleChallenge,
  IncomingBattleInvite,
} from "@/lib/rtdb/battle-service";

export default function IncomingBattleModal() {
  const router = useRouter();
  const { data: session } = useSession();
  const [invite, setInvite] = useState<IncomingBattleInvite | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [isAccepting, setIsAccepting] = useState(false);

  const userEmail = session?.user?.email?.toLowerCase();

  // Listen to RTDB invites
  useEffect(() => {
    if (!userEmail) return;

    const unsub = listenToIncomingBattleInvites(userEmail, (inv) => {
      setInvite(inv);
      if (inv) {
        setTimeLeft(25);
        setIsAccepting(false);
      }
    });

    return () => unsub();
  }, [userEmail]);

  // Countdown timer for invite expiration
  useEffect(() => {
    if (!invite) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invite]);

  const handleAccept = async () => {
    if (!invite || !userEmail) return;
    setIsAccepting(true);
    try {
      await acceptBattleChallenge(invite.battleId, userEmail);
      const targetBattleId = invite.battleId;
      setInvite(null);
      router.push(`/battle/${targetBattleId}`);
    } catch (err) {
      console.error("Error accepting battle invite:", err);
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!invite || !userEmail) return;
    try {
      await declineBattleChallenge(invite.battleId, userEmail);
    } catch (err) {
      console.error("Error declining battle invite:", err);
    } finally {
      setInvite(null);
    }
  };

  if (!invite) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 border-2 border-violet-500/40 shadow-2xl text-white"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-violet-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-rose-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Close button */}
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
          >
            <X width={16} height={16} />
          </button>

          <div className="p-6 space-y-5 text-center">
            {/* Header Badge & Timer */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-black tracking-wide">
                <Swords width={13} height={13} className="animate-bounce" />
                ১v১ চ্যালেঞ্জ আহ্বান!
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Timer width={12} height={12} className="animate-spin" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Inviter Avatar & Info */}
            <div className="space-y-2.5">
              <div className="relative mx-auto w-20 h-20">
                <div className="w-full h-full rounded-full ring-4 ring-violet-500/60 bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-violet-600/40 overflow-hidden">
                  {invite.inviterAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={invite.inviterAvatar} alt={invite.inviterName} className="h-full w-full object-cover" />
                  ) : (
                    invite.inviterName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                  <Swords width={13} height={13} className="text-white" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-white">{invite.inviterName}</h4>
                <p className="text-xs text-slate-400">আপনাকে ১v১ কুইজ ব্যাটেলে চ্যালেঞ্জ করেছে!</p>
              </div>
            </div>

            {/* Match Specs Card */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <div>
                <p className="text-[10px] font-bold text-slate-400">বিষয়:</p>
                <p className="text-xs font-black text-teal-400 truncate">{invite.subjectName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">প্রশ্ন সংখ্যা:</p>
                <p className="text-xs font-black text-indigo-400">{invite.totalQuestions}টি প্রশ্ন</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                প্রত্যাখ্যান
              </button>

              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-violet-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Swords width={15} height={15} />
                {isAccepting ? "প্রবেশ করা হচ্ছে..." : "লড়াই শুরু করুন 🚀"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
