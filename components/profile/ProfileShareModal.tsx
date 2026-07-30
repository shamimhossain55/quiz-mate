"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, Sparkles, Crown, Trophy, Flame, GraduationCap, ShieldCheck } from "lucide-react";
import { Student } from "@/types/firestore";

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function ProfileShareModal({ isOpen, onClose, student }: ProfileShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile?uid=${student.customUid}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyUid = () => {
    if (student.customUid) {
      navigator.clipboard.writeText(student.customUid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-5 shadow-2xl border border-slate-800 flex flex-col relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Orbs */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 active:scale-95 transition-transform z-20 border border-white/10"
        >
          <X width={16} height={16} />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="h-8 w-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Share2 width={18} height={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white leading-tight">প্রোফাইল কার্ড শেয়ার</h2>
            <p className="text-[10px] text-slate-400 font-medium">বন্ধুদের সাথে ডিজিটাল স্টুডেন্ট কার্ড শেয়ার করুন</p>
          </div>
        </div>

        {/* ULTRA-PREMIUM DIGITAL STUDENT PASS CARD */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-teal-950/80 border border-teal-500/30 shadow-xl overflow-hidden mb-4 z-10">
          {/* Decorative Corner Watermark */}
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-teal-400">
            <Crown width={120} height={120} />
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles width={14} height={14} className="text-amber-400" />
              <span className="text-[11px] font-black tracking-widest text-teal-300 uppercase">QUIZ MATE PASS</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <ShieldCheck width={11} height={11} className="text-teal-400" />
              <span>VERIFIED PRO</span>
            </div>
          </div>

          {/* Student Main Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-teal-400 to-indigo-500 shadow-md">
                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/20">
                  {student.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-teal-300 font-black text-xl">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white truncate leading-snug">{student.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1">
                  <Crown width={10} height={10} /> Lvl {student.level || 1}
                </span>
                <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-400/30 flex items-center gap-1">
                  <GraduationCap width={10} height={10} /> {student.className || student.classId || "Class"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid inside Card */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">পয়েন্ট</span>
              <span className="text-xs font-black text-teal-300">{student.point || 0} XP</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">স্ট্রিক</span>
              <span className="text-xs font-black text-orange-400 flex items-center justify-center gap-0.5">
                <Flame width={11} height={11} className="fill-orange-400" /> {student.streak || 0}d
              </span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">পরীক্ষা</span>
              <span className="text-xs font-black text-indigo-300 flex items-center justify-center gap-0.5">
                <Trophy width={11} height={11} /> {student.totalExam || 0}
              </span>
            </div>
          </div>

          {/* Custom UID Footer inside Card */}
          <div className="mt-3 flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-teal-500/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-400">QM ID:</span>
              <span className="text-xs font-black text-teal-400 font-mono tracking-wider">{student.customUid}</span>
            </div>
            <button
              onClick={handleCopyUid}
              className="text-[10px] font-extrabold text-teal-300 hover:text-white px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-400/30 active:scale-95 transition-all"
            >
              {copied ? "কপি হয়েছে!" : "কপি"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 relative z-10">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
            <span>{copied ? "প্রোফাইল লিঙ্ক কপি করা হয়েছে! 🎉" : "প্রোফাইল লিঙ্ক কপি করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
