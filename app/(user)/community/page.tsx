"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Swords,
  Search,
  UserPlus,
  Users,
  Circle,
  X,
  Loader2,
  UserCheck,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/layout/BottomNav";
import UserSearchSheet from "@/components/community/UserSearchSheet";
import IncomingRequestsModal from "@/components/community/IncomingRequestsModal";
import BattleSetupModal from "@/components/community/BattleSetupModal";

/**
 * Premium Community Page
 * ফায়ারবেস থেকে real friends list, incoming/outgoing requests লোড করে।
 */

type Friend = {
  email: string;
  name: string;
  avatarUrl: string | null;
  className?: string;
  isOnline?: boolean;
  point: number;
  streak: number;
  level: number;
  customUid: string;
};

type FriendRequest = {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  senderAvatar?: string | null;
  senderUid?: string;
  receiverEmail: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
};

// অ্যাভাটার কালার ম্যাপ
const avatarColors = [
  { bg: "bg-teal-500", text: "text-white", ring: "ring-teal-200" },
  { bg: "bg-violet-500", text: "text-white", ring: "ring-violet-200" },
  { bg: "bg-rose-500", text: "text-white", ring: "ring-rose-200" },
  { bg: "bg-amber-500", text: "text-white", ring: "ring-amber-200" },
  { bg: "bg-indigo-500", text: "text-white", ring: "ring-indigo-200" },
  { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-200" },
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // ── Data state ─────────────────────────────────
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingEmails, setOutgoingEmails] = useState<Set<string>>(new Set());
  const [friendEmails, setFriendEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState<
    Record<string, { text: string; senderEmail: string; read: boolean }>
  >({});

  // ── UI state ────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [battleTargetFriend, setBattleTargetFriend] = useState<Friend | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Load from Firebase via API ──────────────────
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) return;
      const data = await res.json();

      const rawFriends: Friend[] = (data.friends || []).map((f: any) => ({
        email: f.email,
        name: f.name || "শিক্ষার্থী",
        avatarUrl: f.avatarUrl || null,
        className: f.className || "",
        isOnline: false, // presence feature হবে পরে
        point: f.point || 0,
        streak: f.streak || 1,
        level: f.level || 1,
        customUid: f.customUid || "",
      }));
      setFriends(rawFriends);
      setFriendEmails(new Set(rawFriends.map((f) => f.email.toLowerCase())));

      setIncomingRequests(data.incomingRequests || []);

      const outgoing: Set<string> = new Set(
        (data.outgoingRequests || []).map((r: any) => r.receiverEmail?.toLowerCase())
      );
      setOutgoingEmails(outgoing);

      // Fetch last message for each friend
      const msgMap: Record<string, { text: string; senderEmail: string; read: boolean }> = {};
      await Promise.all(
        rawFriends.map(async (f) => {
          try {
            const r = await fetch(`/api/messages?friendEmail=${encodeURIComponent(f.email)}`);
            if (!r.ok) return;
            const d = await r.json();
            if (d.lastMessage) {
              msgMap[f.email.toLowerCase()] = d.lastMessage;
            } else if (d.messages && d.messages.length > 0) {
              const last = d.messages[d.messages.length - 1];
              msgMap[f.email.toLowerCase()] = {
                text: last.text || "",
                senderEmail: last.senderEmail || "",
                read: last.read ?? true,
              };
            }
          } catch {}
        })
      );
      setLastMessages(msgMap);
    } catch (e) {
      console.error("Failed to load community data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Respond to friend request ───────────────────
  async function handleRespond(requestId: string, action: "accept" | "decline") {
    setRespondingId(requestId);
    try {
      const res = await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          action === "accept" ? "বন্ধু যুক্ত হয়েছে! 🎉" : "রিকোয়েস্ট বাতিল করা হয়েছে",
          "ok"
        );
        // Optimistic remove from list
        setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === "accept") loadData(); // refresh friends list
      } else {
        showToast(data.error || "একটি সমস্যা হয়েছে", "err");
      }
    } catch {
      showToast("সার্ভার সমস্যা", "err");
    } finally {
      setRespondingId(null);
    }
  }

  // ── Derived ─────────────────────────────────────
  const pendingCount = incomingRequests.length;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 width={28} height={28} className="animate-spin text-teal-600" />
          <p className="text-xs font-bold text-slate-400">লোড হচ্ছে...</p>
        </div>
        <BottomNav activeTab="community" />
      </div>
    );
  }

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50 relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-violet-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-1.5s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2 relative z-20">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-violet-100/80 text-violet-700 flex items-center justify-center border border-violet-200/60 shadow-2xs">
                <Users width={20} height={20} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                  কমিউনিটি
                </h1>
                <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                  {friends.length} জন বন্ধু
                  {pendingCount > 0 && (
                    <span className="ml-1 inline-flex items-center text-rose-500 font-bold">
                      · {pendingCount} রিকোয়েস্ট
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              {/* Wide Search Bar Pill (as drawn in feedback) */}
              <button
                onClick={() => setShowSearch(true)}
                aria-label="UID দিয়ে বন্ধু খুঁজুন"
                className="flex-1 max-w-[170px] h-9 flex items-center justify-between bg-white/90 border border-slate-200/90 rounded-full pl-3 pr-1.5 py-1 text-slate-400 hover:border-teal-400 active:scale-95 transition-all shadow-2xs cursor-pointer group"
              >
                <span className="text-[10.5px] font-medium text-slate-400 truncate select-none">
                  UID দিয়ে খুঁজুন...
                </span>
                <div className="h-6 w-6 rounded-full bg-slate-100 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <Search width={13} height={13} className="text-slate-500 group-hover:text-white" />
                </div>
              </button>

              {/* Friend Requests icon button with Count Badge */}
              <button
                onClick={() => setShowRequestsModal(true)}
                aria-label="ফ্রেন্ড রিকোয়েস্ট সমূহ"
                className="relative h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-teal-700 text-white active:scale-95 transition-all hover:bg-teal-800 shadow-md cursor-pointer"
              >
                <UserPlus width={16} height={16} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center px-[3px] border-2 border-white shadow-sm animate-pulse">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ──────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-1 pb-6 space-y-4 no-scrollbar">

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl px-4 py-2.5 text-xs font-extrabold text-center shadow-md ${
                  toast.type === "ok"
                    ? "bg-teal-600 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {toast.msg}
              </motion.div>
            )}
          </AnimatePresence>



          {/* ── Incoming Friend Requests — Facebook Style ── */}
          <AnimatePresence>
            {incomingRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <Bell width={12} height={12} className="text-rose-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Friend Requests
                  </p>
                  <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {incomingRequests.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {incomingRequests.map((req) => {
                    const ac = colorFor(req.senderName);
                    const isResponding = respondingId === req.id;
                    return (
                      <motion.div
                        key={req.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="rounded-2xl bg-white border border-slate-200/80 p-3 flex items-center gap-3"
                        style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`h-12 w-12 rounded-full ${ac.bg} ring-2 ${ac.ring} flex items-center justify-center overflow-hidden`}>
                            {req.senderAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={req.senderAvatar} alt={req.senderName} className="h-full w-full object-cover" />
                            ) : (
                              <span className={`${ac.text} font-extrabold text-lg`}>
                                {req.senderName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info + Buttons */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[13px] font-extrabold text-slate-900 truncate leading-tight">
                                {req.senderName}
                              </p>
                              {req.senderUid && (
                                <p className="text-[9px] font-bold text-teal-700 mt-0.5">
                                  #{req.senderUid}
                                </p>
                              )}
                              <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                {new Date(req.createdAt).toLocaleDateString("bn-BD", {
                                  day: "numeric",
                                  month: "short",
                                })} আগে
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons — Facebook Style */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleRespond(req.id, "accept")}
                              disabled={isResponding}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-teal-600 text-white text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-60 shadow-sm hover:bg-teal-700"
                            >
                              {isResponding ? (
                                <Loader2 width={12} height={12} className="animate-spin" />
                              ) : (
                                <UserCheck width={12} height={12} />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => handleRespond(req.id, "decline")}
                              disabled={isResponding}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-[11px] font-extrabold active:scale-95 transition-all disabled:opacity-60 hover:bg-slate-300"
                            >
                              <X width={12} height={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Online Friends Carousel ────────── */}
          {friends.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Circle width={7} height={7} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-700 tracking-wide">
                    বন্ধুরা ({friends.length})
                  </p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {friends.map((friend, idx) => {
                  const ac = colorFor(friend.name);
                  return (
                    <div
                      key={friend.email}
                      className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group"
                      onClick={() =>
                        router.push(
                          `/community/chat/${encodeURIComponent(friend.email)}`
                        )
                      }
                    >
                      <div className="relative">
                        <div className={`h-14 w-14 rounded-full ${ac.bg} ring-2 ${ac.ring} flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform`}>
                          {friend.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className={`${ac.text} font-extrabold text-lg`}>
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Message indicator dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center shadow-xs">
                          <MessageCircle width={10} height={10} className="text-white" />
                        </div>
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

                {/* Add Friend button */}
                <div
                  className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group"
                  onClick={() => setShowSearch(true)}
                >
                  <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-teal-400 group-hover:bg-teal-50 transition-all">
                    <UserPlus width={20} height={20} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 text-center leading-tight">যোগ করুন</p>
                </div>
              </div>
            </div>
          )}



          {/* ── Full Friends List ───────────────── */}
          {friends.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 tracking-wide">সব বন্ধু</p>
                <span className="text-[10px] font-semibold text-slate-400">{friends.length} জন</span>
              </div>
              <div className="flex flex-col gap-2">
                {friends.map((friend, idx) => (
                  <FriendCard
                    key={friend.email}
                    friend={friend}
                    colorIdx={idx}
                    myEmail={session?.user?.email?.toLowerCase() || ""}
                    lastMessage={lastMessages[friend.email.toLowerCase()] ?? null}
                    onChallenge={() => setBattleTargetFriend(friend)}
                    onMessage={() =>
                      router.push(
                        `/community/chat/${encodeURIComponent(friend.email)}`
                      )
                    }
                    onNameClick={() =>
                      router.push(
                        `/community/chat/${encodeURIComponent(friend.email)}`
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
                <Users width={28} height={28} className="text-teal-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">এখনো কোনো বন্ধু নেই</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mb-4">
                Search icon চাপো এবং UID দিয়ে বন্ধু খুঁজে রিকোয়েস্ট পাঠাও!
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all hover:bg-teal-700"
              >
                <UserPlus width={14} height={14} />
                বন্ধু খুঁজুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 1v1 Battle Setup Modal ─────────────── */}
      <BattleSetupModal
        isOpen={!!battleTargetFriend}
        onClose={() => setBattleTargetFriend(null)}
        friend={battleTargetFriend}
        myEmail={session?.user?.email?.toLowerCase() || ""}
        myName={session?.user?.name || "শিক্ষার্থী"}
        myAvatarUrl={session?.user?.image || null}
      />

      {/* ── User Search Sheet ──────────────────── */}
      <UserSearchSheet
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        friendEmails={friendEmails}
        pendingOutgoing={outgoingEmails}
        onRequestSent={() => {
          loadData();
          showToast("ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে! 🎉");
        }}
      />

      {/* ── Incoming Requests Modal ────────────── */}
      <IncomingRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        requests={incomingRequests}
        onRespond={handleRespond}
        respondingId={respondingId}
      />

      {/* ── BottomNav — badge shows pending count ─ */}
      <BottomNav
        activeTab="community"
        badgeCounts={{ community: pendingCount }}
      />
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
  myEmail,
  lastMessage,
  onMessage,
  onChallenge,
  onNameClick,
}: {
  friend: Friend;
  colorIdx: number;
  myEmail: string;
  lastMessage: { text: string; senderEmail: string; read: boolean } | null;
  onMessage: () => void;
  onChallenge: () => void;
  onNameClick?: () => void;
}) {
  const ac = colorFor(friend.name);

  const lastMsg = lastMessage;
  const isUnread =
    lastMsg !== null &&
    lastMsg.text !== "" &&
    lastMsg.senderEmail !== myEmail &&
    !lastMsg.read;

  return (
    <div className="flex items-center gap-2.5 rounded-xl pl-3 pr-2.5 py-2.5 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 active:scale-[0.99]">
      {/* অ্যাভাটার — click করলে dedicated chat page এ যাবে */}
      <div
        className="relative flex-shrink-0 cursor-pointer"
        onClick={onNameClick}
      >
        <div className={`h-10 w-10 rounded-full ${ac.bg} ring-2 ${ac.ring} flex items-center justify-center overflow-hidden shadow-2xs hover:scale-105 transition-transform`}>
          {friend.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={friend.avatarUrl} alt={friend.name} className="h-full w-full object-cover" />
          ) : (
            <span className={`${ac.text} font-extrabold text-sm`}>
              {friend.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* ইউজার তথ্য */}
      <div className="flex-1 min-w-0" onClick={onNameClick} style={{ cursor: "pointer" }}>
        <div className="flex items-center gap-1">
          <p className="text-xs font-extrabold text-slate-900 truncate hover:text-teal-700 transition-colors">{friend.name}</p>
          <span className="text-[8px] font-extrabold px-1 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Lvl {friend.level}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 max-w-[150px]">
          {lastMsg !== null ? (
            <div className="flex items-center gap-1.5 overflow-hidden">
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-teal-500 flex-shrink-0 animate-pulse" />
              )}
              <span
                className={`text-[9.5px] truncate ${
                  isUnread
                    ? "font-extrabold text-slate-950"
                    : "font-medium text-slate-400"
                }`}
              >
                {lastMsg.text === ""
                  ? "কথোপকথন শুরু করুন..."
                  : lastMsg.senderEmail === myEmail
                  ? `আপনি: ${lastMsg.text}`
                  : lastMsg.text}
              </span>
            </div>
          ) : (
            <span className="text-[9px] font-medium text-slate-300 italic">মেসেজ নেই</span>
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
        <button
          aria-label="১v১ চ্যালেঞ্জ পাঠান"
          onClick={onChallenge}
          className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white active:scale-95 transition-all hover:shadow-md text-[10px] font-extrabold shadow-sm"
        >
          <Swords width={12} height={12} />
          ব্যাটেল
        </button>
      </div>
    </div>
  );
}