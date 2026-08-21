"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Loader2,
  Smile,
  CheckCheck,
  WifiOff,
  MessageCircle,
  Shield,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  senderEmail: string;
  text: string;
  createdAt: number;
  read?: boolean;
  pending?: boolean;
};

type Friend = {
  email: string;
  name: string;
  avatarUrl: string | null;
  level?: number;
  point?: number;
  customUid?: string;
};

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "👏", "💪", "😊", "🙏"];
const POLL_INTERVAL_MS = 5000;

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLabel(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "আজ";
  if (d.toDateString() === yesterday.toDateString()) return "গতকাল";
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
}

const avatarColors = [
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-violet-500", text: "text-white" },
  { bg: "bg-rose-500", text: "text-white" },
  { bg: "bg-amber-500", text: "text-white" },
  { bg: "bg-indigo-500", text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export default function DedicatedChatPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: rawEmail } = use(params);
  const friendEmail = decodeURIComponent(rawEmail).toLowerCase();
  const router = useRouter();

  const { data: session } = useSession();
  const myEmail = session?.user?.email?.toLowerCase() || "";

  const [friend, setFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // ── 1. Fetch friend details ──────────────────────────────────
  useEffect(() => {
    async function loadFriendProfile() {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const data = await res.json();
          const found = (data.friends || []).find(
            (f: any) => f.email?.toLowerCase() === friendEmail
          );
          if (found) {
            setFriend(found);
          } else {
            // Fallback object if not in friends list explicitly
            setFriend({
              email: friendEmail,
              name: friendEmail.split("@")[0],
              avatarUrl: null,
            });
          }
        }
      } catch (e) {
        console.error("Failed to load friend info", e);
        setFriend({
          email: friendEmail,
          name: friendEmail.split("@")[0],
          avatarUrl: null,
        });
      }
    }
    loadFriendProfile();
  }, [friendEmail]);

  // ── 2. Fetch messages & mark read ────────────────────────────
  const fetchMessages = useCallback(
    async (silent = false, since?: number) => {
      if (!friendEmail || !myEmail) return;
      try {
        let url = `/api/messages?friendEmail=${encodeURIComponent(
          friendEmail
        )}&markRead=true`;
        if (since && since > 0) {
          url += `&since=${since}`;
        }

        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const fetched: Message[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          senderEmail: m.senderEmail,
          text: m.text,
          createdAt: typeof m.createdAt === "number" ? m.createdAt : Date.now(),
          read: m.read ?? true,
          pending: false,
        }));

        if (fetched.length > 0) {
          const maxTs = Math.max(...fetched.map((m) => m.createdAt));
          lastTimestampRef.current = Math.max(lastTimestampRef.current, maxTs);
        }

        if (since && since > 0) {
          if (fetched.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newOnes = fetched.filter((m) => !existingIds.has(m.id));
              if (newOnes.length === 0) return prev;
              const cleaned = prev.filter((m) => !m.pending);
              return [...cleaned, ...newOnes];
            });
          }
        } else {
          setMessages(fetched);
        }

        setIsOffline(false);
        if (!silent) setIsInitialLoading(false);
      } catch {
        setIsOffline(true);
        if (!silent) setIsInitialLoading(false);
      }
    },
    [friendEmail, myEmail]
  );

  // ── 3. Start polling ─────────────────────────────────────────
  useEffect(() => {
    if (!friendEmail || !myEmail) return;

    setIsInitialLoading(true);
    lastTimestampRef.current = 0;
    setMessages([]);
    fetchMessages(false, 0);

    pollIntervalRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMessages(true, lastTimestampRef.current);
      }
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchMessages(true, lastTimestampRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [friendEmail, myEmail, fetchMessages]);

  // ── 4. Scroll to bottom ──────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ── 5. Send message ──────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !friendEmail || isSending) return;

      const optimisticId = `pending_${Date.now()}`;
      const optimisticTs = Date.now();
      const optimisticMsg: Message = {
        id: optimisticId,
        senderEmail: myEmail,
        text: trimmed,
        createdAt: optimisticTs,
        pending: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInputText("");
      setShowEmojis(false);

      if (inputRef.current) {
        inputRef.current.style.height = "42px";
      }

      setIsSending(true);

      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendEmail, text: trimmed }),
        });
        await fetchMessages(true, optimisticTs - 100);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, pending: false } : m
          )
        );
      } finally {
        setIsSending(false);
        inputRef.current?.focus();
      }
    },
    [friendEmail, isSending, myEmail, fetchMessages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  const friendName = friend?.name || friendEmail.split("@")[0];
  const ac = colorFor(friendName);
  let lastDateLabel = "";

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 mx-auto max-w-md shadow-2xl relative overflow-hidden">
      {/* ── Top Navigation Header ─────────────────────────────────── */}
      <header className="flex-shrink-0 px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/community")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 cursor-pointer flex-shrink-0"
            aria-label="ফিরে যান"
          >
            <ArrowLeft width={18} height={18} />
          </button>

          <div className="relative flex-shrink-0">
            <div
              className={`h-10 w-10 rounded-full ${ac.bg} flex items-center justify-center overflow-hidden shadow-xs border border-white`}
            >
              {friend?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={friend.avatarUrl}
                  alt={friendName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className={`${ac.text} font-black text-sm`}>
                  {friendName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 truncate leading-tight flex items-center gap-1.5">
              {friendName}
              {friend?.level && (
                <span className="text-[9px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/60">
                  Lvl {friend.level}
                </span>
              )}
            </h1>
            {isOffline ? (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <WifiOff width={10} height={10} />
                সংযোগ নেই
              </p>
            ) : (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                অ্যাক্টিভ আছেন
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ── Messages Chat Body ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 no-scrollbar bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-50">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
            <Loader2 width={32} height={32} className="animate-spin text-teal-600" />
            <p className="text-xs text-slate-400 font-semibold">মেসেজ লোড হচ্ছে...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center shadow-xs">
              <MessageCircle width={32} height={32} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">
                {friendName}-এর সাথে কথোপকথন শুরু করুন!
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                প্রথম মেসেজ পাঠিয়ে হাই জানান 👋
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = msg.senderEmail === myEmail;
              const dateLabel = formatDateLabel(msg.createdAt);
              const showDateLabel = dateLabel !== lastDateLabel;
              if (showDateLabel) lastDateLabel = dateLabel;

              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
              const isSameAsPrev = prevMsg?.senderEmail === msg.senderEmail;
              const isSameAsNext = nextMsg?.senderEmail === msg.senderEmail;

              return (
                <div key={msg.id}>
                  {showDateLabel && (
                    <div className="flex items-center justify-center my-4">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-3.5 py-0.5 rounded-full border border-slate-300/40 shadow-2xs">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.12 }}
                    className={`flex items-end gap-2 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    } ${isSameAsPrev ? "mt-0.5" : "mt-2.5"}`}
                  >
                    {!isMe && (
                      <div className="flex-shrink-0 w-7">
                        {!isSameAsNext ? (
                          <div
                            className={`h-7 w-7 rounded-full ${ac.bg} flex items-center justify-center overflow-hidden shadow-xs border border-white`}
                          >
                            {friend?.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={friend.avatarUrl}
                                alt={friendName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className={`${ac.text} font-black text-[11px]`}>
                                {friendName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={`relative max-w-[78%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 text-sm leading-relaxed break-words transition-opacity ${
                          msg.pending ? "opacity-70" : "opacity-100"
                        } ${
                          isMe
                            ? "bg-teal-600 text-white rounded-2xl rounded-br-xs shadow-xs"
                            : "bg-white text-slate-900 rounded-2xl rounded-bl-xs shadow-xs border border-slate-200/90"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {!isSameAsNext && (
                        <div
                          className={`flex items-center gap-1 mt-1 px-1 ${
                            isMe ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMe && (
                            <CheckCheck
                              width={13}
                              height={13}
                              className={
                                msg.pending
                                  ? "text-slate-300"
                                  : "text-teal-600 stroke-[2.5]"
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}

            {isOffline && (
              <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-rose-500 font-bold">
                <WifiOff width={12} height={12} />
                সংযোগ পুনরায় স্থাপন হচ্ছে...
              </div>
            )}

            <div ref={bottomRef} className="h-2" />
          </>
        )}
      </main>

      {/* ── Quick Emoji Picker ────────────────────────────────────── */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex-shrink-0 px-4 py-2.5 bg-white border-t border-slate-100 flex gap-2.5 overflow-x-auto no-scrollbar shadow-inner"
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSend(emoji)}
                className="text-2xl active:scale-75 transition-transform hover:scale-125 cursor-pointer flex-shrink-0 select-none p-1"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Input Toolbar ─────────────────────────────────── */}
      <footer className="flex-shrink-0 px-3 py-3 bg-white border-t border-slate-200/70 flex items-end gap-2 z-20">
        <button
          onClick={() => setShowEmojis((v) => !v)}
          className={`h-10 w-10 flex items-center justify-center rounded-2xl transition-all flex-shrink-0 cursor-pointer ${
            showEmojis
              ? "bg-teal-100 text-teal-700 border border-teal-300"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
          aria-label="ইমোজি"
        >
          <Smile width={20} height={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="মেসেজ লিখুন..."
            rows={1}
            className="w-full resize-none bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 border border-transparent transition-all max-h-28 overflow-y-auto no-scrollbar leading-relaxed"
            style={{ minHeight: "42px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 112) + "px";
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim() || isSending}
          className="h-10 w-10 flex items-center justify-center rounded-2xl bg-teal-600 text-white flex-shrink-0 transition-all hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none shadow-sm cursor-pointer"
          aria-label="পাঠান"
        >
          {isSending ? (
            <Loader2 width={18} height={18} className="animate-spin" />
          ) : (
            <Send width={17} height={17} />
          )}
        </motion.button>
      </footer>
    </div>
  );
}
