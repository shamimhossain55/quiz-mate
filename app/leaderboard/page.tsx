"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Trophy,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Zap,
  Award,
  Play,
  Timer,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Ultra-Competitive & Transparent Leaderboard Page (লিডারবোর্ড)
 * ট্রান্সপারেন্ট অ্যাম্বিয়েন্ট স্টেজ + ৩ডি পোডিয়াম + মোটিভেশনাল র‍্যাঙ্ক টার্গেট মিটার
 */

type Player = {
  uid: string;
  name: string;
  point: number;
  avatarUrl: string | null;
  prevRank: number;
  streak: number;
  level: number;
  badgeTitle?: string;
};

const playersWeekly: Player[] = [
  { uid: "u1", name: "আয়েশা রহমান", point: 1240, avatarUrl: null, prevRank: 2, streak: 12, level: 15, badgeTitle: "🏆 চ্যাম্পিয়ন" },
  { uid: "u2", name: "তানভীর আহমেদ", point: 1180, avatarUrl: null, prevRank: 1, streak: 9, level: 14, badgeTitle: "⚡ রানার-আপ" },
  { uid: "u3", name: "নুসরাত জাহান", point: 1105, avatarUrl: null, prevRank: 3, streak: 8, level: 13, badgeTitle: "🔥 ৩য় স্থান" },
  { uid: "u4", name: "রাকিব হাসান", point: 990, avatarUrl: null, prevRank: 6, streak: 5, level: 11 },
  { uid: "u5", name: "শামীম হোসেন", point: 850, avatarUrl: null, prevRank: 7, streak: 7, level: 12 }, // Logged in user
  { uid: "u6", name: "মিম আক্তার", point: 812, avatarUrl: null, prevRank: 4, streak: 4, level: 10 },
  { uid: "u7", name: "ফাহিম শাহরিয়ার", point: 760, avatarUrl: null, prevRank: 5, streak: 6, level: 9 },
  { uid: "u8", name: "সাদিয়া ইসলাম", point: 705, avatarUrl: null, prevRank: 8, streak: 3, level: 8 },
];

const playersMonthly: Player[] = [
  { uid: "u2", name: "তানভীর আহমেদ", point: 4820, avatarUrl: null, prevRank: 2, streak: 21, level: 14, badgeTitle: "🏆 চ্যাম্পিয়ন" },
  { uid: "u1", name: "আয়েশা রহমান", point: 4650, avatarUrl: null, prevRank: 1, streak: 18, level: 15, badgeTitle: "⚡ রানার-আপ" },
  { uid: "u3", name: "নুসরাত জাহান", point: 3950, avatarUrl: null, prevRank: 3, streak: 14, level: 13, badgeTitle: "🔥 ৩য় স্থান" },
  { uid: "u4", name: "রাকিব হাসান", point: 3450, avatarUrl: null, prevRank: 4, streak: 10, level: 11 },
  { uid: "u5", name: "শামীম হোসেন", point: 3210, avatarUrl: null, prevRank: 8, streak: 7, level: 12 }, // Logged in user
  { uid: "u6", name: "মিম আক্তার", point: 3100, avatarUrl: null, prevRank: 5, streak: 8, level: 10 },
];

const playersAllTime: Player[] = [
  { uid: "u1", name: "আয়েশা রহমান", point: 18450, avatarUrl: null, prevRank: 1, streak: 45, level: 25, badgeTitle: "👑 অল-টাইম কিং" },
  { uid: "u2", name: "তানভীর আহমেদ", point: 16900, avatarUrl: null, prevRank: 2, streak: 38, level: 23, badgeTitle: "⚔️ মাস্টরমাইন্ড" },
  { uid: "u3", name: "নুসরাত জাহান", point: 14200, avatarUrl: null, prevRank: 3, streak: 30, level: 20, badgeTitle: "🌟 গ্র্যান্ডমাস্টার" },
  { uid: "u5", name: "শামীম হোসেন", point: 11500, avatarUrl: null, prevRank: 6, streak: 15, level: 18 },
  { uid: "u4", name: "রাকিব হাসান", point: 10800, avatarUrl: null, prevRank: 4, streak: 12, level: 16 },
];

const currentUserUid = "u5"; // শামীম হোসেন

export default function LeaderboardPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "allTime">("weekly");

  const currentPlayersList =
    timeframe === "monthly"
      ? playersMonthly
      : timeframe === "allTime"
      ? playersAllTime
      : playersWeekly;

  const top3 = currentPlayersList.slice(0, 3);
  const rest = currentPlayersList.slice(3);

  // Current logged in user calculations
  const currentUserIndex = currentPlayersList.findIndex((p) => p.uid === currentUserUid);
  const currentUser = currentPlayersList[currentUserIndex];
  const nextPlayerAbove = currentUserIndex > 0 ? currentPlayersList[currentUserIndex - 1] : null;
  const pointsToNextRank = nextPlayerAbove ? nextPlayerAbove.point - currentUser.point + 1 : 0;
  const progressPercentToNext = nextPlayerAbove
    ? Math.min(100, Math.round((currentUser.point / nextPlayerAbove.point) * 100))
    : 100;

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50 selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      {/* গ্লোয়িং অ্যাম্বিয়েন্ট ব্লারস (ট্রান্সপারেন্ট পেজ ফিল) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-1.5s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">
        
        {/* ট্রান্সপারেন্ট স্লিম হেডার ও ৩ডি পোডিয়াম স্টেজ */}
        <div className="flex-shrink-0 px-4 pt-5 pb-2 relative z-20">
          
          {/* ১-লাইন হেডার ও সিজন কাউন্টডাউন */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-8 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                <Trophy width={18} height={18} className="text-amber-500 fill-amber-500" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                লিডারবোর্ড
              </h1>
            </div>

            <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-50/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-teal-200/80 shadow-2xs">
              <Timer width={11} height={11} className="text-amber-500" />
              <span>💎 সিজন ৪ • বাকি ২ দিন</span>
            </div>
          </div>

          {/* ট্রান্সপারেন্ট ফিল্টার ট্যাব: এই সপ্তাহ | এই মাস | সর্বকালের */}
          <div className="flex items-center justify-center gap-1 p-0.5 bg-slate-200/70 backdrop-blur-md rounded-full max-w-[270px] mx-auto border border-slate-300/40 mb-3.5 shadow-inner">
            <button
              onClick={() => setTimeframe("weekly")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                timeframe === "weekly"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              এই সপ্তাহ
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                timeframe === "monthly"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              এই মাস
            </button>
            <button
              onClick={() => setTimeframe("allTime")}
              className={`flex-1 py-1 text-[11px] font-extrabold rounded-full transition-all duration-300 ${
                timeframe === "allTime"
                  ? "bg-teal-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              অল-টাইম
            </button>
          </div>

          {/* ট্রান্সপারেন্ট ৩ডি পোডিয়াম স্টেজ */}
          <div className="flex items-end justify-center gap-2.5 pt-1">
            {top3[1] && <PodiumCard player={top3[1]} rank={2} />}
            {top3[0] && <PodiumCard player={top3[0]} rank={1} />}
            {top3[2] && <PodiumCard player={top3[2]} rank={3} />}
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-6 space-y-3.5 no-scrollbar">
          
          {/* তোমার বর্তমান স্থান ও টার্গেট মিটার (Interactive Target Booster) */}
          {currentUser && (
            <div
              className="rounded-2xl p-3.5 relative overflow-hidden transition-all duration-300 shadow-[0_6px_16px_rgba(244,63,94,0.15)] border border-rose-200/90 group"
              style={{
                background: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%)",
              }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  {/* র‍্যাঙ্ক ব্যাজ */}
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-black text-sm flex flex-col items-center justify-center shadow-md border border-white/40">
                    <span className="text-[8px] font-bold text-rose-100 leading-none">র‍্যাঙ্ক</span>
                    <span className="leading-tight">#{currentUserIndex + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-extrabold text-rose-950 leading-tight">
                        {currentUser.name} (তুমি)
                      </p>
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-800 text-[8px] font-extrabold">
                        Lvl {currentUser.level}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-700 mt-0.5">
                      {currentUser.point} XP পয়েন্ট অর্জিত
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/quiz/setup")}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black shadow-md active:scale-95 hover:scale-105 transition-transform flex items-center gap-1 flex-shrink-0"
                >
                  <Play width={12} height={12} fill="white" />
                  কুইজ খেলুন
                </button>
              </div>

              {/* টার্গেট প্রোগ্রেস মিটার */}
              {nextPlayerAbove ? (
                <div className="mt-2.5 relative z-10 bg-white/80 p-2 rounded-xl border border-rose-200 backdrop-blur-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-900 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap width={12} height={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                      পরবর্তী র‍্যাঙ্ক অতিক্রম করতে:
                    </span>
                    <span className="text-rose-600 font-black">+{pointsToNextRank} XP</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-rose-100 overflow-hidden p-0.5 border border-rose-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPercentToNext}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-1.5 rounded-xl bg-amber-100/90 border border-amber-300 text-center">
                  <span className="text-[10px] font-black text-amber-800 flex items-center justify-center gap-1">
                    👑 তুমি শীর্ষে আছো! স্থান ধরে রাখতে নিয়মিত কুইজ খেলো।
                  </span>
                </div>
              )}
            </div>
          )}

          {/* বাকি শিক্ষার্থী তালিকা */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-700 tracking-wide">অন্যান্য প্রতিযোগীবৃন্দ</p>
              <span className="text-[10px] font-semibold text-slate-400">প্রতি ঘন্টা আপডেট হয়</span>
            </div>

            <div className="flex flex-col gap-2">
              {rest.map((player, idx) => (
                <RankRow
                  key={player.uid}
                  player={player}
                  rank={idx + 4}
                  isCurrentUser={player.uid === currentUserUid}
                />
              ))}
            </div>
          </div>

          {/* পুরস্কার ও সম্মাননা ব্যানার */}
          <div className="rounded-2xl p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-teal-500/10 border border-amber-300/40 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
              <Award width={18} height={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                সিজন ৪ পুরস্কার
              </h4>
              <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                ১ম-৩য় স্থান অর্জনকারী পাবে বিশেষ গোল্ডেন ব্যাজ + ৫০০ বোনাস XP!
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ফিক্সড বটম নেভিগেশন */}
      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

/**
 * RankChangeBadge
 */
function RankChangeBadge({ currentRank, prevRank }: { currentRank: number; prevRank: number }) {
  const diff = prevRank - currentRank;

  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100/90 text-[8px] font-extrabold text-emerald-700 border border-emerald-200">
        <ArrowUp width={9} height={9} strokeWidth={3} />
        {diff}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-100/90 text-[8px] font-extrabold text-rose-600 border border-rose-200">
        <ArrowDown width={9} height={9} strokeWidth={3} />
        {Math.abs(diff)}
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-slate-100">
      <Minus width={8} height={8} className="text-slate-400" strokeWidth={3} />
    </span>
  );
}

/**
 * PodiumCard
 * ট্রান্সপারেন্ট ৩ডি পোডিয়াম পিলার ও গোল্ডেন ক্রাউন
 */
function PodiumCard({ player, rank }: { player: Player; rank: 1 | 2 | 3 }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const avatarSize = isFirst ? "h-12 w-12" : "h-9 w-9";
  const pillarHeight = isFirst ? "h-16" : isSecond ? "h-11" : "h-7";
  
  const pillarGradient = isFirst
    ? "linear-gradient(180deg, #FCD34D 0%, #F59E0B 40%, #B45309 100%)"
    : isSecond
    ? "linear-gradient(180deg, #E2E8F0 0%, #94A3B8 50%, #475569 100%)"
    : "linear-gradient(180deg, #FFEDD5 0%, #F97316 50%, #C2410C 100%)";

  const ringClass = isFirst
    ? "ring-3 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]"
    : isSecond
    ? "ring-2 ring-slate-300 shadow-[0_0_8px_rgba(148,163,184,0.3)]"
    : "ring-2 ring-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.3)]";

  return (
    <div className="flex flex-col items-center" style={{ width: isFirst ? 82 : 70 }}>
      
      {/* ১ম স্থান: গোল্ডেন ক্রাউন */}
      {isFirst && (
        <div className="relative mb-0.5">
          <Crown width={20} height={20} className="text-amber-400 fill-amber-400 filter drop-shadow-md" />
        </div>
      )}

      {/* অ্যাভাটার */}
      <div
        className={`${avatarSize} rounded-full ${ringClass} bg-white flex items-center justify-center overflow-hidden mb-1 relative z-10 transition-transform hover:scale-105 cursor-pointer shadow-sm`}
      >
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-teal-900 font-extrabold text-sm">
            {player.name.slice(0, 1)}
          </span>
        )}
      </div>

      {/* নাম ও পয়েন্ট */}
      <p className="text-slate-900 text-[11px] font-black text-center leading-tight line-clamp-1 max-w-full">
        {player.name}
      </p>

      <div className="inline-flex items-center gap-0.5 mt-0.5 mb-1.5 px-2 py-0.2 rounded-full bg-white/90 backdrop-blur-md border border-teal-100 shadow-2xs">
        <span className="text-[9px] font-black text-teal-800">{player.point} XP</span>
      </div>

      {/* ৩ডি পোডিয়াম পিলার */}
      <div
        className={`w-full ${pillarHeight} rounded-t-xl flex flex-col items-center justify-start pt-1 relative overflow-hidden transition-all duration-300 shadow-md border-t border-white/60`}
        style={{
          background: pillarGradient,
          boxShadow: "inset 0 1.5px 3px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.12)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70" />

        <span className="text-white text-xs font-black drop-shadow-sm leading-none">
          {rank}
        </span>
        <span className="text-[8px] font-bold text-white/90 uppercase tracking-wide mt-0.5">
          {isFirst ? "১ম" : isSecond ? "২য়" : "৩য়"}
        </span>
      </div>
    </div>
  );
}

/**
 * RankRow
 */
function RankRow({
  player,
  rank,
  isCurrentUser,
}: {
  player: Player;
  rank: number;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl pl-3 pr-3.5 py-2.5 transition-all duration-200 active:scale-[0.98] hover:shadow-sm border"
      style={
        isCurrentUser
          ? {
              background: "linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 100%)",
              boxShadow: "0 2px 10px rgba(244, 63, 94, 0.12)",
              borderColor: "#FB7185",
            }
          : {
              background: "#FFFFFF",
              boxShadow: "0 1px 5px rgba(15, 23, 42, 0.03)",
              borderColor: "#F1F5F9",
            }
      }
    >
      {/* র‍্যাঙ্ক নম্বর */}
      <div className="flex flex-col items-center justify-center w-5 flex-shrink-0">
        <span
          className={`text-xs font-black ${
            isCurrentUser ? "text-rose-600" : rank <= 5 ? "text-teal-700" : "text-slate-400"
          }`}
        >
          #{rank}
        </span>
      </div>

      {/* অ্যাভাটার */}
      <div className="h-8 w-8 rounded-full ring-2 ring-teal-100 bg-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-teal-800 font-extrabold text-xs">{player.name.slice(0, 1)}</span>
        )}
      </div>

      {/* ইউজার তথ্য */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-extrabold text-slate-900 truncate">{player.name}</p>
          {isCurrentUser && (
            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded-full bg-rose-200 text-rose-800">
              তুমি
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-slate-400 font-medium">Lvl {player.level}</span>
          <span className="flex items-center gap-0.5 text-[8px] font-bold text-orange-600 bg-orange-50 px-1 py-0.2 rounded-full border border-orange-100">
            <Flame width={9} height={9} className="fill-orange-500 text-orange-500" />
            {player.streak}d
          </span>
        </div>
      </div>

      {/* র‍্যাঙ্ক চেঞ্জ ব্যাজ */}
      <RankChangeBadge currentRank={rank} prevRank={player.prevRank} />

      {/* পয়েন্ট */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-xs font-black ${
            isCurrentUser ? "text-rose-600" : "text-teal-700"
          }`}
        >
          {player.point}
        </p>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">XP pt</p>
      </div>
    </div>
  );
}