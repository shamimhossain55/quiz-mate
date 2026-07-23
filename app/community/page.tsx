"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Swords,
  Search,
  UserPlus,
  Users,
  Zap,
  Crown,
  Flame,
  Sparkles,
  Trophy,
  ChevronRight,
  Circle,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Premium Community Page
 * অনলাইন ফ্রেন্ডস ক্যারোসেল, ১v১ ব্যাটেল CTA, ফ্রেন্ড লিস্ট, এবং কমিউনিটি স্ট্যাটস
 */

type Friend = {
  uid: string;
  name: string;
  avatarUrl: string | null;
  className: string;
  isOnline: boolean;
  point: number;
  streak: number;
  level: number;
  lastActive?: string;
};

// এখানে পরে Firestore থেকে real friends list + presence (online/offline) ডেটা fetch করে বসাতে হবে
const friends: Friend[] = [
  { uid: "u1", name: "আয়েশা রহমান", avatarUrl: null, className: "ক্লাস ৯", isOnline: true, point: 1240, streak: 12, level: 15 },
  { uid: "u2", name: "তানভীর আহমেদ", avatarUrl: null, className: "ক্লাস ৯", isOnline: true, point: 1180, streak: 9, level: 14 },
  { uid: "u3", name: "নুসরাত জাহান", avatarUrl: null, className: "ক্লাস ৮", isOnline: false, point: 1105, streak: 8, level: 13, lastActive: "২ ঘণ্টা আগে" },
  { uid: "u4", name: "রাকিব হাসান", avatarUrl: null, className: "ক্লাস ৯", isOnline: false, point: 990, streak: 5, level: 11, lastActive: "৫ ঘণ্টা আগে" },
  { uid: "u6", name: "মিম আক্তার", avatarUrl: null, className: "ক্লাস ৮", isOnline: true, point: 812, streak: 4, level: 10 },
  { uid: "u7", name: "ফাহিম শাহরিয়ার", avatarUrl: null, className: "ক্লাস ৯", isOnline: false, point: 760, streak: 6, level: 9, lastActive: "১ দিন আগে" },
];

// অ্যাভাটার কালার ম্যাপ
const avatarColors = [
  { bg: "bg-teal-100", text: "text-teal-800", ring: "ring-teal-200" },
  { bg: "bg-indigo-100", text: "text-indigo-800", ring: "ring-indigo-200" },
  { bg: "bg-rose-100", text: "text-rose-800", ring: "ring-rose-200" },
  { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" },
  { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" },
  { bg: "bg-violet-100", text: "text-violet-800", ring: "ring-violet-200" },
];

export default function CommunityPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const onlineFriends = friends.filter((f) => f.isOnline);
  const offlineFriends = friends.filter((f) => !f.isOnline);
  const totalXP = friends.reduce((sum, f) => sum + f.point, 0);

  const filteredOnline = searchQuery
    ? onlineFriends.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : onlineFriends;
  const filteredOffline = searchQuery
    ? offlineFriends.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : offlineFriends;

  function handleMessage(friend: Friend) {
    console.log("মেসেজ পাঠাও:", friend.uid);
  }

  function handleChallenge(friend: Friend) {
    console.log("চ্যালেঞ্জ পাঠাও:", friend.uid);
  }

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-violet-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-1.5s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ট্রান্সপারেন্ট হেডার */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2 relative z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-violet-100/80 text-violet-700 flex items-center justify-center border border-violet-200/60 shadow-2xs">
                <Users width={20} height={20} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  কমিউনিটি
                </h1>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  <span className="inline-flex items-center gap-0.5">
                    <Circle width={6} height={6} className="fill-emerald-500 text-emerald-500" />
                    {onlineFriends.length} জন অনলাইন
                  </span>
                  {" · "}{friends.length} জন বন্ধু
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSearch(!showSearch)}
                aria-label="বন্ধু খুঁজুন"
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/90 border border-slate-200/80 active:scale-95 transition-all hover:shadow-sm shadow-2xs"
              >
                <Search width={16} height={16} className="text-slate-600" />
              </button>
              <button
                aria-label="বন্ধু যোগ করুন"
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-teal-700 text-white active:scale-95 transition-all hover:bg-teal-800 shadow-md"
              >
                <UserPlus width={16} height={16} />
              </button>
            </div>
          </div>

          {/* সার্চ বার (ট্রানজিশন) */}
          {showSearch && (
            <div className="mb-2 relative">
              <Search width={14} height={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="বন্ধুর নাম লিখুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-300 transition-all shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* স্ক্রলযোগ্য মিডল কন্টেন্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-6 space-y-4 no-scrollbar">

          {/* ১v১ ব্যাটেল হিরো CTA কার্ড */}
          <div
            className="rounded-2xl p-3.5 relative overflow-hidden shadow-[0_8px_20px_rgba(99,102,241,0.18)] border border-white/30 group cursor-pointer active:scale-[0.99] transition-all"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 55%, #A855F7 100%)",
            }}
            onClick={() => router.push("/quiz/setup")}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-violet-300/20 blur-md pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Swords width={16} height={16} className="text-amber-300" />
                  <span className="text-[10px] font-extrabold text-violet-200 uppercase tracking-wider">১v১ কুইজ ব্যাটেল</span>
                </div>
                <h3 className="text-base font-extrabold text-white leading-snug">
                  বন্ধুকে চ্যালেঞ্জ করো!
                </h3>
                <p className="text-[10px] text-violet-200 font-medium mt-0.5">
                  একটি বিষয় বেছে নাও আর রিয়েল-টাইমে লড়াই করো ⚔️
                </p>
              </div>
              <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:scale-110 transition-transform">
                <Swords width={22} height={22} className="text-white" />
              </div>
            </div>
          </div>

          {/* অনলাইন ফ্রেন্ডস হরিজন্টাল ক্যারোসেল */}
          {onlineFriends.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Circle width={7} height={7} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-700 tracking-wide">
                    এখন অনলাইন ({onlineFriends.length})
                  </p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {onlineFriends.map((friend, idx) => {
                  const ac = avatarColors[idx % avatarColors.length];
                  return (
                    <div
                      key={friend.uid}
                      className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group"
                      onClick={() => handleChallenge(friend)}
                    >
                      <div className="relative">
                        <div className={`h-14 w-14 rounded-full ${ac.bg} ring-2 ${ac.ring} flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform`}>
                          {friend.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className={`${ac.text} font-extrabold text-lg`}>
                              {friend.name.slice(0, 1)}
                            </span>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 text-center leading-tight line-clamp-1 max-w-[68px]">
                        {friend.name.split(" ")[0]}
                      </p>
                      <span className="text-[8px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-100">
                        {friend.point} XP
                      </span>
                    </div>
                  );
                })}

                {/* বন্ধু যোগ করুন বাটন */}
                <div className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group">
                  <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-teal-400 group-hover:bg-teal-50 transition-all">
                    <UserPlus width={20} height={20} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 text-center leading-tight">
                    যোগ করুন
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* কমিউনিটি স্ট্যাটস মিনি কার্ডস */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 flex flex-col items-center shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
              <Trophy width={16} height={16} className="text-amber-500 mb-1" />
              <span className="text-sm font-black text-slate-900">{friends.length}</span>
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">বন্ধু</span>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 flex flex-col items-center shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
              <Zap width={16} height={16} className="text-teal-600 mb-1" />
              <span className="text-sm font-black text-slate-900">{totalXP}</span>
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">টোটাল XP</span>
            </div>
            <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 flex flex-col items-center shadow-[0_1px_4px_rgba(15,23,42,0.03)]">
              <Flame width={16} height={16} className="text-orange-500 mb-1" />
              <span className="text-sm font-black text-slate-900">{onlineFriends.length}</span>
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">অনলাইন</span>
            </div>
          </div>

          {/* সব বন্ধু — ফুল লিস্ট */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-700 tracking-wide">সব বন্ধু</p>
              <span className="text-[10px] font-semibold text-slate-400">{friends.length} জন</span>
            </div>

            {/* অনলাইন সেকশন */}
            {filteredOnline.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
                  <Circle width={5} height={5} className="fill-emerald-500 text-emerald-500" />
                  অনলাইন
                </p>
                <div className="flex flex-col gap-2">
                  {filteredOnline.map((friend, idx) => (
                    <FriendCard
                      key={friend.uid}
                      friend={friend}
                      colorIdx={idx}
                      onMessage={() => handleMessage(friend)}
                      onChallenge={() => handleChallenge(friend)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* অফলাইন সেকশন */}
            {filteredOffline.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Circle width={5} height={5} className="fill-slate-300 text-slate-300" />
                  অফলাইন
                </p>
                <div className="flex flex-col gap-2">
                  {filteredOffline.map((friend, idx) => (
                    <FriendCard
                      key={friend.uid}
                      friend={friend}
                      colorIdx={idx + onlineFriends.length}
                      onMessage={() => handleMessage(friend)}
                      onChallenge={() => handleChallenge(friend)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <BottomNav activeTab="community" />
    </div>
  );
}

/**
 * FriendCard
 * প্রিমিয়াম ফ্রেন্ড কার্ড — অ্যাভাটার, স্ট্যাটাস, লেভেল, স্ট্রিক, মেসেজ ও চ্যালেঞ্জ বাটন
 */
function FriendCard({
  friend,
  colorIdx,
  onMessage,
  onChallenge,
}: {
  friend: Friend;
  colorIdx: number;
  onMessage: () => void;
  onChallenge: () => void;
}) {
  const ac = avatarColors[colorIdx % avatarColors.length];

  return (
    <div className="flex items-center gap-2.5 rounded-xl pl-3 pr-2.5 py-2.5 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 active:scale-[0.99]">
      {/* অ্যাভাটার */}
      <div className="relative flex-shrink-0">
        <div className={`h-10 w-10 rounded-full ${ac.bg} ring-2 ${ac.ring} flex items-center justify-center overflow-hidden shadow-2xs`}>
          {friend.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
          ) : (
            <span className={`${ac.text} font-extrabold text-sm`}>
              {friend.name.slice(0, 1)}
            </span>
          )}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
            friend.isOnline ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      </div>

      {/* ইউজার তথ্য */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-extrabold text-slate-900 truncate">{friend.name}</p>
          <span className="text-[8px] font-extrabold px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Lvl {friend.level}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-slate-400 font-medium">{friend.className}</span>
          <span className="text-[9px] text-slate-300">•</span>
          <span className="text-[9px] font-bold text-teal-700">{friend.point} XP</span>
          {friend.streak > 0 && (
            <>
              <span className="text-[9px] text-slate-300">•</span>
              <span className="flex items-center gap-0.5 text-[8px] font-bold text-orange-600">
                <Flame width={9} height={9} className="fill-orange-500 text-orange-500" />
                {friend.streak}d
              </span>
            </>
          )}
          {!friend.isOnline && friend.lastActive && (
            <>
              <span className="text-[9px] text-slate-300">•</span>
              <span className="text-[9px] text-slate-400 font-medium">{friend.lastActive}</span>
            </>
          )}
        </div>
      </div>

      {/* অ্যাকশন বাটনস */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          aria-label="মেসেজ পাঠান"
          onClick={onMessage}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-teal-50 border border-teal-100 active:scale-95 transition-all hover:bg-teal-100"
        >
          <MessageCircle width={14} height={14} className="text-teal-700" />
        </button>
        {friend.isOnline && (
          <button
            aria-label="১v১ চ্যালেঞ্জ পাঠান"
            onClick={onChallenge}
            className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white active:scale-95 transition-all hover:shadow-md text-[10px] font-extrabold shadow-sm"
          >
            <Swords width={12} height={12} />
            ব্যাটেল
          </button>
        )}
      </div>
    </div>
  );
}