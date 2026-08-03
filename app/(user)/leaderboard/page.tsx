"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Crown,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Flame,
  Zap,
  Award,
  Play,
  Timer,
  Globe,
  GraduationCap,
  MapPin,
  Compass,
  Star,
  SlidersHorizontal,
  Check,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { getTopStudents, getStudentProfile } from "@/lib/firestore/student";
import { Student } from "@/types/firestore";

/* ── Types ───────────────────────────────────────────────── */
type Player = {
  uid: string;
  name: string;
  email: string;
  customUid?: string;
  point: number;
  avatarUrl: string | null;
  prevRank: number;
  streak: number;
  level: number;
  classId?: string;
  className?: string;
  division?: string;
  district?: string;
  group?: string;
};

type ScopeFilter = "all" | "class" | "district" | "division";
type TimeframeFilter = "weekly" | "monthly" | "allTime";

/* ── Filter Bottom Sheet ─────────────────────────────────── */
function FilterSheet({
  open,
  onClose,
  scope,
  setScope,
  timeframe,
  setTimeframe,
  userProfile,
}: {
  open: boolean;
  onClose: () => void;
  scope: ScopeFilter;
  setScope: (s: ScopeFilter) => void;
  timeframe: TimeframeFilter;
  setTimeframe: (t: TimeframeFilter) => void;
  userProfile: Student | null;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  /* close on backdrop tap */
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  const scopes: { id: ScopeFilter; icon: React.ReactNode; label: string; sub: string }[] = [
    {
      id: "all",
      icon: <Globe width={18} height={18} />,
      label: "সামগ্রিক",
      sub: "সকল শিক্ষার্থীর মেধা তালিকা",
    },
    {
      id: "class",
      icon: <GraduationCap width={18} height={18} />,
      label: userProfile?.className || "আমার শ্রেণী",
      sub: "একই শ্রেণীর প্রতিযোগীদের মধ্যে",
    },
    {
      id: "district",
      icon: <MapPin width={18} height={18} />,
      label: userProfile?.district ? `${userProfile.district} জেলা` : "আমার জেলা",
      sub: "একই জেলার প্রতিযোগীদের মধ্যে",
    },
    {
      id: "division",
      icon: <Compass width={18} height={18} />,
      label: userProfile?.division ? `${userProfile.division} বিভাগ` : "আমার বিভাগ",
      sub: "একই বিভাগের প্রতিযোগীদের মধ্যে",
    },
  ];

  const timeframes: { id: TimeframeFilter; label: string; emoji: string }[] = [
    { id: "weekly", label: "এই সপ্তাহ", emoji: "📅" },
    { id: "monthly", label: "এই মাস", emoji: "📆" },
    { id: "allTime", label: "সর্বকালের", emoji: "🏛️" },
  ];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="w-full max-w-sm rounded-t-3xl overflow-hidden animate-scale-up"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-black text-white">ফিল্টার সেটিংস</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              পছন্দমতো র‍্যাঙ্কিং ভিউ বেছে নাও
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <X width={15} height={15} className="text-slate-300" />
          </button>
        </div>

        {/* Scope Section */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-extrabold text-teal-400 uppercase tracking-widest mb-2.5">
            এলাকা / শ্রেণী ভিত্তিক ভিউ
          </p>
          <div className="space-y-2">
            {scopes.map((sc) => {
              const isSelected = scope === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setScope(sc.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-teal-400/60 bg-teal-500/15 shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                      : "border-white/5 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-teal-500 text-slate-950"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {sc.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-extrabold leading-tight ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {sc.label}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{sc.sub}</p>
                  </div>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-teal-400 flex items-center justify-center flex-shrink-0">
                      <Check width={13} height={13} strokeWidth={3} className="text-slate-950" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeframe Section */}
        <div className="px-5 pt-3 pb-6">
          <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-2.5">
            সময়কাল
          </p>
          <div className="flex gap-2">
            {timeframes.map((tf) => {
              const isSelected = timeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold border transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? "border-indigo-400/60 bg-indigo-500/20 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/8"
                  }`}
                >
                  <span>{tf.emoji}</span>
                  <span>{tf.label}</span>
                </button>
              );
            })}
          </div>

          {/* Apply Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 text-slate-950 font-black text-sm shadow-[0_8px_24px_rgba(20,184,166,0.3)] active:scale-[0.98] transition-transform cursor-pointer"
          >
            ✓ ফিল্টার প্রয়োগ করো
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [timeframe, setTimeframe] = useState<TimeframeFilter>("weekly");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Friend states
  const [friendEmails, setFriendEmails] = useState<Set<string>>(new Set());
  const [outgoingRequests, setOutgoingRequests] = useState<Set<string>>(new Set());
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const students = await getTopStudents(50);
        if (students && students.length > 0) {
          const mapped: Player[] = students.map((st, idx) => {
            const rawName =
              st.name && !st.name.includes("@")
                ? st.name
                : st.email
                ? st.email.split("@")[0]
                : "শিক্ষার্থী";
            return {
              uid: st.email || st.id,
              name: rawName,
              email: st.email || "",
              customUid: st.customUid || "",
              point: st.point || 0,
              avatarUrl: st.avatarUrl || null,
              prevRank: idx + 1,
              streak: st.streak || 1,
              level: st.level || Math.floor((st.point || 0) / 100) + 1,
              classId: st.classId || "class6",
              className: st.className || "",
              division: st.division || "",
              district: st.district || "",
              group: st.group || "all",
            };
          });
          setAllPlayers(mapped);
        } else {
          setAllPlayers([]);
        }

        if (session?.user?.email) {
          const profile = await getStudentProfile(session.user.email);
          if (profile) setCurrentUserProfile(profile);

          // Fetch friends status
          try {
            const fRes = await fetch("/api/friends");
            if (fRes.ok) {
              const fData = await fRes.json();
              setFriendEmails(
                new Set((fData.friends || []).map((f: any) => f.email?.toLowerCase()))
              );
              setOutgoingRequests(
                new Set((fData.outgoingRequests || []).map((r: any) => r.receiverEmail?.toLowerCase()))
              );
            }
          } catch {}
        }
      } catch (e) {
        console.error("Leaderboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  const handleSendFriendRequest = async (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetEmail = player.email.toLowerCase();
    if (
      friendEmails.has(targetEmail) ||
      outgoingRequests.has(targetEmail) ||
      sendingEmails.has(targetEmail)
    )
      return;

    setSendingEmails((prev) => new Set(prev).add(targetEmail));
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: player.customUid || player.email }),
      });
      if (res.ok) {
        setOutgoingRequests((prev) => new Set(prev).add(targetEmail));
      }
    } catch {
    } finally {
      setSendingEmails((prev) => {
        const next = new Set(prev);
        next.delete(targetEmail);
        return next;
      });
    }
  };

  const currentUserEmail = session?.user?.email?.toLowerCase() || "";
  const currentUserAvatarKey = currentUserEmail ? `qm_avatar_${currentUserEmail}` : null;

  const filteredPlayers = allPlayers.filter((p) => {
    if (scope === "class")
      return !currentUserProfile?.classId || p.classId === currentUserProfile.classId;
    if (scope === "district")
      return !currentUserProfile?.district || p.district === currentUserProfile.district;
    if (scope === "division")
      return !currentUserProfile?.division || p.division === currentUserProfile.division;
    return true;
  });

  const top3 = filteredPlayers.slice(0, 3);
  const rest = filteredPlayers.slice(3);

  const currentUserIndex = filteredPlayers.findIndex(
    (p) => p.email.toLowerCase() === currentUserEmail
  );
  const currentUserPlayer = currentUserIndex >= 0 ? filteredPlayers[currentUserIndex] : null;
  const nextPlayerAbove = currentUserIndex > 0 ? filteredPlayers[currentUserIndex - 1] : null;
  const pointsToNextRank =
    nextPlayerAbove && currentUserPlayer
      ? nextPlayerAbove.point - currentUserPlayer.point + 1
      : 0;
  const progressPct =
    nextPlayerAbove && currentUserPlayer
      ? Math.min(100, Math.round((currentUserPlayer.point / (nextPlayerAbove.point || 1)) * 100))
      : 100;

  // Always sanitize: if profile name is an email, fall back to username part
  function cleanDisplayName(name?: string, email?: string): string {
    if (name && !name.includes("@") && name.trim().length > 0) return name.trim();
    const src = email || "";
    const u = src.split("@")[0] || "শিক্ষার্থী";
    return u.charAt(0).toUpperCase() + u.slice(1);
  }

  const userDisplayName = cleanDisplayName(
    currentUserProfile?.name || session?.user?.name || undefined,
    currentUserProfile?.email || currentUserEmail || undefined
  );

  /* Active filter label shown on header chip */
  const activeFilterLabel =
    scope === "all"
      ? "সামগ্রিক"
      : scope === "class"
      ? currentUserProfile?.className || "শ্রেণী"
      : scope === "district"
      ? currentUserProfile?.district || "জেলা"
      : currentUserProfile?.division || "বিভাগ";

  const timeframeLabel =
    timeframe === "weekly" ? "এই সপ্তাহ" : timeframe === "monthly" ? "এই মাস" : "সর্বকালের";

  return (
    <>
      {/* Filter Bottom Sheet */}
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        scope={scope}
        setScope={setScope}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        userProfile={currentUserProfile}
      />

      <div
        className="h-screen font-sans flex flex-col selection:bg-teal-500 selection:text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        {/* Ambient orbs */}
        <div className="absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl pointer-events-none animate-ambient-float" />
        <div
          className="absolute top-1/2 -right-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none animate-ambient-float"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="absolute -bottom-20 left-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-ambient-float"
          style={{ animationDelay: "-2s" }}
        />

        <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

          {/* ── COMPACT HEADER ── */}
          <div className="flex-shrink-0 px-4 pt-5 pb-3 relative z-20">
            <div className="flex items-center justify-between mb-3">
              {/* Title */}
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_4px_16px_rgba(251,191,36,0.5)]">
                  <Trophy width={20} height={20} className="text-amber-900 fill-amber-900" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight leading-none">
                    মেধা লিডারবোর্ড
                  </h1>
                  <p className="text-[10px] text-teal-300 font-bold leading-none mt-0.5">
                    প্রতিযোগিতায় শীর্ষে যাও · XP জমাও
                  </p>
                </div>
              </div>

              {/* Right side: season chip + filter button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-400/25 px-2 py-1 rounded-full">
                  <Timer width={10} height={10} className="text-rose-300" />
                  <span className="text-[9.5px] font-extrabold text-rose-300">সিজন ৪</span>
                </div>

                {/* Filter icon button */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="relative h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center cursor-pointer active:scale-95 transition-transform hover:bg-white/15"
                >
                  <SlidersHorizontal width={17} height={17} className="text-slate-200" />
                  {/* Active indicator dot */}
                  {(scope !== "all" || timeframe !== "weekly") && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-teal-400 border-2 border-slate-900" />
                  )}
                </button>
              </div>
            </div>

            {/* Active filter pill (shows current selection) */}
            <div
              className="flex items-center gap-2 mb-3 cursor-pointer"
              onClick={() => setFilterOpen(true)}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-slate-400">ভিউ:</span>
                <span className="text-[10.5px] font-extrabold text-teal-300">
                  {activeFilterLabel}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10.5px] font-extrabold text-indigo-300">
                  {timeframeLabel}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-medium">পরিবর্তন করতে ট্যাপ করো ›</span>
            </div>

            {/* ── 3D PODIUM ── */}
            {loading ? (
              <div className="flex items-end justify-center gap-3 pt-2 pb-1 h-40">
                {[72, 88, 72].map((w, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: w }}>
                    <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                    <div
                      className="w-full rounded-t-xl bg-white/10 animate-pulse"
                      style={{ height: i === 1 ? 64 : i === 0 ? 44 : 28 }}
                    />
                  </div>
                ))}
              </div>
            ) : top3.length > 0 ? (
              <div className="flex items-end justify-center gap-2.5 pt-1 pb-1">
                {top3[1] ? (
                  <PodiumCard
                    player={top3[1]}
                    rank={2}
                    isCurrentUser={top3[1].email.toLowerCase() === currentUserEmail}
                    currentUserAvatarKey={currentUserAvatarKey}
                    onPress={() => router.push(`/users/${encodeURIComponent(top3[1].uid)}`)}
                  />
                ) : (
                  <div style={{ width: 72 }} />
                )}
                {top3[0] && (
                  <PodiumCard
                    player={top3[0]}
                    rank={1}
                    isCurrentUser={top3[0].email.toLowerCase() === currentUserEmail}
                    currentUserAvatarKey={currentUserAvatarKey}
                    onPress={() => router.push(`/users/${encodeURIComponent(top3[0].uid)}`)}
                  />
                )}
                {top3[2] ? (
                  <PodiumCard
                    player={top3[2]}
                    rank={3}
                    isCurrentUser={top3[2].email.toLowerCase() === currentUserEmail}
                    currentUserAvatarKey={currentUserAvatarKey}
                    onPress={() => router.push(`/users/${encodeURIComponent(top3[2].uid)}`)}
                  />
                ) : (
                  <div style={{ width: 72 }} />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                <Trophy width={36} height={36} className="text-amber-400 opacity-50" />
                <p className="text-xs font-bold text-slate-300">এখনো কোনো প্রতিযোগী নেই</p>
                <p className="text-[10px] text-slate-500">প্রথম কুইজ খেলে শীর্ষে জায়গা করে নাও!</p>
              </div>
            )}
          </div>

          {/* ── SCROLLABLE BODY ── */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-2.5 no-scrollbar pt-1">

            {/* MY RANK BOOSTER CARD */}
            {currentUserPlayer && (
              <div
                className="rounded-2xl p-3.5 border border-teal-400/40 shadow-[0_8px_24px_rgba(20,184,166,0.18)] relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(15,118,110,0.18) 0%, rgba(15,23,42,0.98) 100%)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />

                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar with rank badge */}
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center ring-2 ring-teal-400/50">
                        {(currentUserPlayer.avatarUrl ||
                          (currentUserAvatarKey &&
                            typeof window !== "undefined" &&
                            localStorage.getItem(currentUserAvatarKey))) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              currentUserPlayer.avatarUrl ||
                              (currentUserAvatarKey
                                ? localStorage.getItem(currentUserAvatarKey) || ""
                                : "")
                            }
                            alt={userDisplayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-teal-300 font-black text-base">
                            {userDisplayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-md border-[1.5px] border-slate-900">
                        <span className="text-[7.5px] font-black text-white">
                          {currentUserIndex + 1}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-black text-white truncate leading-tight">
                          {userDisplayName}
                        </p>
                        <span className="px-1.5 py-0.2 rounded-full bg-teal-400/20 border border-teal-400/40 text-teal-300 text-[8px] font-black flex-shrink-0">
                          তুমি
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {currentUserPlayer.point} XP · লেভেল {currentUserPlayer.level}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/quiz/setup")}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 text-[10.5px] font-black shadow-lg active:scale-95 transition-transform flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  >
                    <Play width={11} height={11} className="fill-slate-950" />
                    খেলো
                  </button>
                </div>

                {/* Progress to next rank */}
                {nextPlayerAbove ? (
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                    <div className="flex items-center justify-between text-[9.5px] font-bold mb-1.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Zap width={11} height={11} className="text-amber-400 fill-amber-400" />
                        #{currentUserIndex} ছাড়িয়ে যেতে মাত্র
                      </span>
                      <span className="text-amber-400 font-extrabold">
                        +{pointsToNextRank} XP
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full relative overflow-hidden transition-all duration-700"
                        style={{
                          width: `${progressPct}%`,
                          background:
                            "linear-gradient(90deg, #14b8a6, #6366f1, #f59e0b)",
                        }}
                      >
                        <div className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-2 text-center">
                    <span className="text-[10px] font-black text-amber-300">
                      👑 তুমি এই ভিউতে শীর্ষে! র‍্যাঙ্ক ধরে রাখো।
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* REST LIST */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <p className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                    <Star width={12} height={12} className="text-amber-400 fill-amber-400" />
                    অন্যান্য প্রতিযোগী
                  </p>
                  <span className="text-[9px] text-slate-500 font-semibold">
                    {filteredPlayers.length} জন
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {rest.map((player, idx) => {
                    const pEmail = player.email.toLowerCase();
                    return (
                      <RankRow
                        key={player.uid}
                        player={player}
                        rank={idx + 4}
                        isCurrentUser={pEmail === currentUserEmail}
                        currentUserAvatarKey={currentUserAvatarKey}
                        onPress={() => router.push(`/users/${encodeURIComponent(player.uid)}`)}
                        isFriend={friendEmails.has(pEmail)}
                        isOutgoing={outgoingRequests.has(pEmail)}
                        isSending={sendingEmails.has(pEmail)}
                        onSendRequest={(e) => handleSendFriendRequest(player, e)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state for filtered scope */}
            {filteredPlayers.length === 0 && !loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-1.5">
                <p className="text-sm font-extrabold text-white">এই ফিল্টারে কোনো প্রতিযোগী নেই</p>
                <p className="text-[10px] text-slate-400">
                  বন্ধুদের QuizMate-এ আমন্ত্রণ জানাও!
                </p>
              </div>
            )}

            {/* SEASON REWARD BANNER */}
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3 border border-amber-400/25"
              style={{
                background:
                  "linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(15,23,42,0.9) 100%)",
              }}
            >
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 border border-amber-400/25">
                <Award width={20} height={20} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white leading-tight">
                  সিজন ৪ পুরস্কার
                </h4>
                <p className="text-[10px] text-amber-200/70 font-medium mt-0.5">
                  ১ম-৩য় স্থানে গোল্ডেন ব্যাজ + ৫০০ XP বোনাস!
                </p>
              </div>
            </div>
          </div>
        </div>

        <BottomNav activeTab="leaderboard" />
      </div>
    </>
  );
}

/* ── PodiumCard ───────────────────────────────────────────── */
function PodiumCard({
  player,
  rank,
  isCurrentUser,
  currentUserAvatarKey,
  onPress,
}: {
  player: Player;
  rank: 1 | 2 | 3;
  isCurrentUser?: boolean;
  currentUserAvatarKey?: string | null;
  onPress?: () => void;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const pillarHeight = isFirst ? 64 : isSecond ? 44 : 28;
  const avatarSize = isFirst ? "h-14 w-14" : "h-10 w-10";

  const pillarBg = isFirst
    ? "linear-gradient(180deg, #fde68a 0%, #f59e0b 40%, #b45309 100%)"
    : isSecond
    ? "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)"
    : "linear-gradient(180deg, #fed7aa 0%, #f97316 50%, #c2410c 100%)";

  const ringCls = isFirst
    ? "ring-[3px] ring-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.7)]"
    : isSecond
    ? "ring-2 ring-slate-300/70 shadow-[0_0_10px_rgba(148,163,184,0.35)]"
    : "ring-2 ring-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.35)]";

  const avatarSrc =
    player.avatarUrl ||
    (isCurrentUser && typeof window !== "undefined" && currentUserAvatarKey
      ? localStorage.getItem(currentUserAvatarKey)
      : null);

  const displayName =
    player.name && !player.name.includes("@")
      ? player.name
      : player.email
      ? player.email.split("@")[0]
      : "শিক্ষার্থী";

  return (
    <div
      className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
      style={{ width: isFirst ? 88 : 74 }}
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPress?.()}
    >
      {/* Crown for 1st */}
      {isFirst ? (
        <div className="mb-0.5">
          <Crown
            width={24}
            height={24}
            className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
          />
        </div>
      ) : (
        <div className="h-7" />
      )}

      {/* Avatar */}
      <div
        className={`${avatarSize} rounded-full ${ringCls} overflow-hidden bg-slate-800 flex items-center justify-center mb-1.5 relative`}
      >
        {isCurrentUser && (
          <div className="absolute inset-0 rounded-full ring-2 ring-teal-400/60 animate-ping opacity-25 pointer-events-none" />
        )}
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={`font-black text-amber-300 ${isFirst ? "text-base" : "text-sm"}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-white text-[11px] font-black text-center line-clamp-1 leading-tight px-1 max-w-full">
        {displayName}
      </p>

      {/* Sub label */}
      {player.district ? (
        <span className="text-[8.5px] text-teal-300 font-bold truncate max-w-full">
          📍 {player.district}
        </span>
      ) : (
        <span className="text-[8.5px] text-slate-500 font-bold">🎓 {player.className || "—"}</span>
      )}

      {/* XP chip */}
      <div className="flex items-center gap-0.5 mt-0.5 mb-1.5 px-2 py-0.5 rounded-full bg-white/8 border border-white/10">
        <Zap width={9} height={9} className="text-amber-400 fill-amber-400" />
        <span className="text-[9px] font-black text-white">{player.point}</span>
      </div>

      {/* Pillar */}
      <div
        className="w-full rounded-t-xl flex flex-col items-center justify-start pt-1.5 relative overflow-hidden"
        style={{
          height: pillarHeight,
          background: pillarBg,
          boxShadow:
            "inset 0 2px 5px rgba(255,255,255,0.35), 0 8px 18px rgba(0,0,0,0.5)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-white/55" />
        <span className="text-white font-black text-xs drop-shadow-md">{rank}</span>
        <span className="text-[7.5px] font-bold text-white/90 uppercase tracking-wider">
          {isFirst ? "১ম" : isSecond ? "২য়" : "৩য়"}
        </span>
      </div>
    </div>
  );
}

/* ── RankChangeBadge ──────────────────────────────────────── */
function RankChangeBadge({ curr, prev }: { curr: number; prev: number }) {
  const diff = prev - curr;
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-[8px] font-extrabold text-emerald-400 border border-emerald-500/25">
        <ArrowUp width={8} height={8} strokeWidth={3} />
        {diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/15 text-[8px] font-extrabold text-rose-400 border border-rose-500/25">
        <ArrowDown width={8} height={8} strokeWidth={3} />
        {Math.abs(diff)}
      </span>
    );
  return (
    <span className="h-4 w-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
      <Minus width={7} height={7} className="text-slate-500" />
    </span>
  );
}

/* ── RankRow ──────────────────────────────────────────────── */
function RankRow({
  player,
  rank,
  isCurrentUser,
  currentUserAvatarKey,
  onPress,
  isFriend,
  isOutgoing,
  isSending,
  onSendRequest,
}: {
  player: Player;
  rank: number;
  isCurrentUser: boolean;
  currentUserAvatarKey?: string | null;
  onPress?: () => void;
  isFriend?: boolean;
  isOutgoing?: boolean;
  isSending?: boolean;
  onSendRequest?: (e: React.MouseEvent) => void;
}) {
  const avatarSrc =
    player.avatarUrl ||
    (isCurrentUser && typeof window !== "undefined" && currentUserAvatarKey
      ? localStorage.getItem(currentUserAvatarKey)
      : null);

  const displayName =
    player.name && !player.name.includes("@")
      ? player.name
      : player.email
      ? player.email.split("@")[0]
      : "শিক্ষার্থী";

  return (
    <div
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPress?.()}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
        isCurrentUser
          ? "border-teal-500/50 shadow-[0_4px_16px_rgba(20,184,166,0.18)]"
          : "border-white/5 hover:border-white/10 hover:bg-white/5"
      }`}
      style={{
        background: isCurrentUser
          ? "linear-gradient(135deg, rgba(15,118,110,0.22) 0%, rgba(15,23,42,0.95) 100%)"
          : "rgba(255,255,255,0.035)",
      }}
    >
      {/* Rank */}
      <span
        className={`text-xs font-black w-5 text-center flex-shrink-0 ${
          isCurrentUser
            ? "text-teal-400"
            : rank <= 5
            ? "text-amber-400"
            : rank <= 10
            ? "text-slate-300"
            : "text-slate-600"
        }`}
      >
        #{rank}
      </span>

      {/* Avatar */}
      <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-white/8">
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[11px] font-black text-slate-300">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-extrabold text-white truncate">{displayName}</p>
          {isCurrentUser && (
            <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded-full bg-teal-400/15 text-teal-300 border border-teal-400/30 flex-shrink-0">
              তুমি
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[8.5px] text-slate-500 font-medium">
          <span>Lv.{player.level}</span>
          {player.district && (
            <>
              <span>·</span>
              <span className="text-teal-400/75 font-semibold">📍 {player.district}</span>
            </>
          )}
          <span className="flex items-center gap-0.5 text-amber-400/80 font-bold">
            <Flame width={8} height={8} className="fill-amber-400/80" />
            {player.streak}d
          </span>
        </div>
      </div>

      <RankChangeBadge curr={rank} prev={player.prevRank} />

      {/* XP */}
      <div className="text-right flex-shrink-0 min-w-[36px]">
        <p
          className={`text-xs font-black ${
            isCurrentUser ? "text-teal-300" : rank <= 3 ? "text-amber-400" : "text-slate-300"
          }`}
        >
          {player.point}
        </p>
        <p className="text-[8px] text-slate-600 font-bold uppercase">XP</p>
      </div>

      {/* Add Friend button */}
      {!isCurrentUser && (
        <button
          onClick={onSendRequest}
          disabled={isFriend || isOutgoing || isSending}
          title={isFriend ? "ইতোমধ্যে বন্ধু" : isOutgoing ? "রিকোয়েস্ট পাঠানো হয়েছে" : "ফ্রেন্ড রিকোয়েস্ট পাঠান"}
          className="h-7 w-7 rounded-lg flex items-center justify-center border transition-all active:scale-90 flex-shrink-0 cursor-pointer disabled:opacity-80"
          style={{
            background: isFriend
              ? "rgba(16,185,129,0.15)"
              : isOutgoing
              ? "rgba(100,116,139,0.2)"
              : "rgba(20,184,166,0.15)",
            borderColor: isFriend
              ? "rgba(16,185,129,0.3)"
              : isOutgoing
              ? "rgba(100,116,139,0.3)"
              : "rgba(20,184,166,0.3)",
            color: isFriend ? "#34d399" : isOutgoing ? "#94a3b8" : "#2dd4bf",
          }}
        >
          {isSending ? (
            <Loader2 width={12} height={12} className="animate-spin" />
          ) : isFriend || isOutgoing ? (
            <Check width={12} height={12} />
          ) : (
            <UserPlus width={12} height={12} />
          )}
        </button>
      )}
    </div>
  );
}