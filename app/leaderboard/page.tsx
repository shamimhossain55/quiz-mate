"use client";

import { Crown, ArrowUp, ArrowDown, Minus } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Leaderboard Page
 * কালার থিম: পুরো ব্যাকগ্রাউন্ড টিল, সাদা পিল-শেপ রো
 * টপ ৩ পোডিয়াম (গোল অ্যাভাটার + পিলার) + বাকিদের পিল-শেপ লিস্ট
 * প্রতি রো-তে প্রমোশন (▲) / ডিমোশন (▼) / অপরিবর্তিত (—) ব্যাজ
 */

type Player = {
  uid: string;
  name: string;
  point: number;
  avatarUrl: string | null;
  prevRank: number; // আগের র‍্যাঙ্ক - প্রমোশন/ডিমোশন বের করার জন্য
};

// এখানে পরে Firestore থেকে আসল ডেটা fetch করে বসাবেন (point অনুযায়ী sorted, prevRank আগের সপ্তাহের ডেটা থেকে)
const players: Player[] = [
  { uid: "u1", name: "আয়েশা রহমান", point: 1240, avatarUrl: null, prevRank: 2 },
  { uid: "u2", name: "তানভীর আহমেদ", point: 1180, avatarUrl: null, prevRank: 1 },
  { uid: "u3", name: "নুসরাত জাহান", point: 1105, avatarUrl: null, prevRank: 3 },
  { uid: "u4", name: "রাকিব হাসান", point: 990, avatarUrl: null, prevRank: 6 },
  { uid: "u5", name: "শামীম হোসেন", point: 850, avatarUrl: null, prevRank: 4 },
  { uid: "u6", name: "মিম আক্তার", point: 812, avatarUrl: null, prevRank: 7 },
  { uid: "u7", name: "ফাহিম শাহরিয়ার", point: 760, avatarUrl: null, prevRank: 5 },
  { uid: "u8", name: "সাদিয়া ইসলাম", point: 705, avatarUrl: null, prevRank: 8 },
];

const currentUserUid = "u5"; // লগইন করা ইউজারের uid

export default function LeaderboardPage() {
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        {/* ফিক্সড টপ সেকশন: শিরোনাম + পোডিয়াম */}
        <div className="flex-shrink-0 px-5 pt-6 pb-6 relative z-10 border-b border-slate-200">
          <p className="text-slate-900 text-lg font-medium text-center">লিডারবোর্ড</p>
          <p className="text-slate-400 text-xs text-center mt-0.5">এই সপ্তাহের সেরা ৩ জন</p>

          {/* পোডিয়াম */}
          <div className="flex items-end justify-center gap-3 mt-6">
            <PodiumCard player={top3[1]} rank={2} />
            <PodiumCard player={top3[0]} rank={1} />
            <PodiumCard player={top3[2]} rank={3} />
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন: বাকিদের পিল-শেপ লিস্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          <p className="text-xs font-medium text-slate-400 mb-3 pt-4">সব শিক্ষার্থী</p>
          <div className="flex flex-col gap-3">
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
      </div>

      <BottomNav activeTab="leaderboard" />
    </div>
  );
}

/**
 * RankChangeBadge
 * আগের র‍্যাঙ্কের সাথে তুলনা করে প্রমোশন (▲) / ডিমোশন (▼) / অপরিবর্তিত (—) দেখায়
 */
function RankChangeBadge({ currentRank, prevRank }: { currentRank: number; prevRank: number }) {
  const diff = prevRank - currentRank; // পজিটিভ মানে র‍্যাঙ্ক উপরে উঠেছে (promotion)

  if (diff > 0) {
    return (
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50">
        <ArrowUp size={12} className="text-emerald-600" strokeWidth={3} />
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-50">
        <ArrowDown size={12} className="text-red-500" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100">
      <Minus size={12} className="text-slate-400" strokeWidth={3} />
    </span>
  );
}

/**
 * PodiumCard
 * টপ ৩ এর জন্য গোল অ্যাভাটার + পিলার স্টাইল, ১ম জন মাঝে ও উঁচুতে
 */
function PodiumCard({ player, rank }: { player: Player; rank: 1 | 2 | 3 }) {
  const isFirst = rank === 1;
  const avatarSize = isFirst ? "h-16 w-16" : "h-12 w-12";
  const pillarHeight = isFirst ? "h-20" : rank === 2 ? "h-14" : "h-9";
  const ringColor = isFirst ? "ring-amber-300" : rank === 2 ? "ring-slate-200" : "ring-orange-200";

  return (
    <div className="flex flex-col items-center" style={{ width: isFirst ? 92 : 78 }}>
      {isFirst && (
        <Crown size={22} className="text-amber-300 mb-1" fill="#FCD34D" strokeWidth={1.5} />
      )}

      <div
        className={`${avatarSize} rounded-full ring-[3px] ${ringColor} bg-white flex items-center justify-center overflow-hidden mb-2 relative z-10`}
        style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
      >
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-teal-700 font-medium text-sm">{player.name.slice(0, 1)}</span>
        )}
      </div>

      <p className="text-slate-800 text-xs font-medium text-center leading-tight line-clamp-1 max-w-full">
        {player.name}
      </p>
      <p className="text-slate-400 text-[10px] mt-0.5 mb-2">{player.point} pt</p>

      {/* পিলার - গোল্ড / সিলভার / ব্রোঞ্জ */}
      <div
        className={`w-full ${pillarHeight} rounded-t-xl flex items-start justify-center pt-1.5`}
        style={{
          background:
            rank === 1
              ? "linear-gradient(180deg, #FFF3C4 0%, #F5B942 45%, #D89614 100%)"
              : rank === 2
              ? "linear-gradient(180deg, #F1F5F9 0%, #CBD5E1 45%, #94A3B8 100%)"
              : "linear-gradient(180deg, #F3C6A0 0%, #D9834B 45%, #B0602A 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.12)",
        }}
      >
        <span className="text-white text-sm font-medium drop-shadow">{rank}</span>
      </div>
    </div>
  );
}

/**
 * RankRow
 * ৪ম র‍্যাঙ্ক থেকে শুরু করে বাকিদের জন্য পিল-শেপ রো: নাম — ব্যাজ — পয়েন্ট
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
      className="flex items-center gap-3 rounded-full pl-4 pr-5 py-3 transition-transform active:scale-[0.98]"
      style={
        isCurrentUser
          ? {
              background: "linear-gradient(145deg, #FFF1EE 0%, #FFE1DB 100%)",
              boxShadow: "0 0 0 2px #FB7185, 0 4px 10px rgba(0,0,0,0.12)",
            }
          : {
              background: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
              border: "1px solid #F1F5F9",
            }
      }
    >
      <span
        className={`text-sm font-medium w-5 text-center flex-shrink-0 ${
          isCurrentUser ? "text-rose-600" : "text-slate-400"
        }`}
      >
        {rank}
      </span>

      <div className="h-8 w-8 rounded-full ring-2 ring-teal-100 bg-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.avatarUrl} alt={player.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-teal-700 font-medium text-xs">{player.name.slice(0, 1)}</span>
        )}
      </div>

      <p className="text-sm font-medium text-slate-900 truncate flex-1 min-w-0">
        {player.name}
      </p>

      <RankChangeBadge currentRank={rank} prevRank={player.prevRank} />

      <p
        className={`text-sm font-medium flex-shrink-0 ${
          isCurrentUser ? "text-rose-600" : "text-teal-700"
        }`}
      >
        {player.point}
      </p>
    </div>
  );
}