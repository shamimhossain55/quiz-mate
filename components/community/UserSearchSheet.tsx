"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  UserPlus,
  Check,
  Loader2,
  Zap,
  Flame,
  Users,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  uid: string;
  name: string;
  customUid: string;
  avatarUrl: string | null;
  level: number;
  point: number;
  streak: number;
  className: string;
  bio?: string;
  friendsCount?: number;
}

interface UserSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Set of emails the current user is already friends with */
  friendEmails?: Set<string>;
  /** Set of emails to which a pending request was already sent */
  pendingOutgoing?: Set<string>;
  onRequestSent?: () => void;
}

const avatarColors = [
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export default function UserSearchSheet({
  isOpen,
  onClose,
  friendEmails = new Set(),
  pendingOutgoing = new Set(),
  onRequestSent,
}: UserSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
      setQuery("");
      setProfile(null);
      setNotFound(false);
      setSent(false);
    }
  }, [isOpen]);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setProfile(null);
    setNotFound(false);
    setSent(false);
    try {
      const res = await fetch(`/api/profile/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.users?.length > 0) {
        const u = data.users[0];
        setProfile({
          uid: u.email,
          name: u.name,
          customUid: u.customUid,
          avatarUrl: u.avatarUrl,
          level: u.level,
          point: u.point,
          streak: u.streak || 1,
          className: u.className || "",
          bio: u.bio || "",
          friendsCount: u.friendsCount || 0,
        });
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!profile) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: profile.customUid || profile.uid }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        showToast("ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে! 🎉");
        onRequestSent?.();
      } else {
        showToast(data.error || "রিকোয়েস্ট পাঠানো যায়নি", "err");
      }
    } catch {
      showToast("একটি সমস্যা হয়েছে", "err");
    } finally {
      setIsSending(false);
    }
  }

  const isFriend = profile ? friendEmails.has(profile.uid.toLowerCase()) : false;
  const isPending = profile ? pendingOutgoing.has(profile.uid.toLowerCase()) : false;
  const ac = profile ? colorFor(profile.name) : avatarColors[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Centered Modal */}
          <motion.div
            key="modal"
            initial={{ scale: 0.9, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                    <Search width={16} height={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                      ইউজার খুঁজুন
                    </h2>
                    <p className="text-[10px] font-medium text-slate-400">
                      UID দিয়ে খুঁজুন ও বন্ধু বানান
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90 transition-transform"
                >
                  <X width={14} height={14} />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search
                    width={14}
                    height={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="UID লিখুন (যেমন: 872914)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isSearching ? (
                    <Loader2 width={13} height={13} className="animate-spin" />
                  ) : (
                    "খুঁজুন"
                  )}
                </button>
              </form>

              {/* Toast */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-3 px-4 py-2 rounded-xl text-[11px] font-extrabold text-center ${
                      toast.type === "ok"
                        ? "bg-teal-600 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {toast.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <div className="min-h-[130px]">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 width={22} height={22} className="animate-spin text-teal-600" />
                    <p className="text-xs font-bold text-slate-500">খুঁজছি...</p>
                  </div>
                ) : profile ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 flex flex-col items-center gap-3"
                    style={{ boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className={`h-16 w-16 rounded-full ${ac.bg} flex items-center justify-center shadow-md ring-4 ring-white overflow-hidden`}
                      >
                        {profile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className={`${ac.text} font-extrabold text-2xl`}>
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Level badge */}
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-2 border-white shadow-sm">
                        <Crown width={10} height={10} className="text-white" />
                      </div>
                    </div>

                    {/* Name & UID */}
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-slate-900">{profile.name}</p>
                      <p className="text-[10px] font-extrabold text-teal-700 tracking-wider mt-0.5">
                        #{profile.customUid}
                      </p>
                      {profile.className && (
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {profile.className}
                        </p>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5">
                          <Zap width={10} height={10} className="text-teal-600" />
                          <span className="text-xs font-black text-slate-900">{profile.point}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">XP</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5">
                          <Flame width={10} height={10} className="text-orange-500" />
                          <span className="text-xs font-black text-slate-900">{profile.streak}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">স্ট্রিক</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5">
                          <Users width={10} height={10} className="text-indigo-500" />
                          <span className="text-xs font-black text-slate-900">{profile.friendsCount ?? 0}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">বন্ধু</span>
                      </div>
                    </div>

                    {/* Friend Request Button */}
                    {isFriend ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                        <Check width={14} height={14} />
                        ইতোমধ্যে বন্ধু
                      </div>
                    ) : isPending || sent ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-extrabold">
                        <Check width={14} height={14} />
                        রিকোয়েস্ট পাঠানো হয়েছে
                      </div>
                    ) : (
                      <button
                        onClick={handleSendRequest}
                        disabled={isSending}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-extrabold shadow-md active:scale-95 disabled:opacity-60 transition-all hover:shadow-lg"
                      >
                        {isSending ? (
                          <Loader2 width={14} height={14} className="animate-spin" />
                        ) : (
                          <UserPlus width={14} height={14} />
                        )}
                        {isSending ? "পাঠানো হচ্ছে..." : "Friend Request পাঠাও"}
                      </button>
                    )}
                  </motion.div>
                ) : notFound ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Search width={22} height={22} className="text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">কাউকে পাওয়া যায়নি</p>
                    <p className="text-[10px] text-slate-400">সঠিক UID দিয়ে আবার চেষ্টা করুন</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center">
                      <UserPlus width={22} height={22} className="text-teal-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">বন্ধুর UID টাইপ করুন</p>
                    <p className="text-[10px] text-slate-400 max-w-[190px]">
                      UID হলো প্রোফাইলে দেওয়া ৬ সংখ্যার কোড
                    </p>
                  </div>
                )}
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
