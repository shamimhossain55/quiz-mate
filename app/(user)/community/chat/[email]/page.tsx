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
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  sendMessage,
  listenToMessages,
  setTypingIndicator,
  listenToTyping,
  type RtdbMessage,
} from "@/lib/rtdb/chat-service";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "👏", "💪", "😊", "🙏"];
/** টাইপিং indicator কতক্ষণ পর auto-clear হবে (ms) */
const TYPING_DEBOUNCE_MS = 1500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /** typing debounce timer */
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** আমি কি typing করছি — duplicate set এড়াতে */
  const isTypingRef = useRef(false);

  // ── 1. Load friend profile ────────────────────────────────────────────────
  useEffect(() => {
    async function loadFriendProfile() {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const data = await res.json();
          const found = (data.friends || []).find(
            (f: any) => f.email?.toLowerCase() === friendEmail
          );
          setFriend(
            found ?? {
              email: friendEmail,
              name: friendEmail.split("@")[0],
              avatarUrl: null,
            }
          );
        }
      } catch {
        setFriend({
          email: friendEmail,
          name: friendEmail.split("@")[0],
          avatarUrl: null,
        });
      }
    }
    loadFriendProfile();
  }, [friendEmail]);

  // ── 2. Real-time messages via RTDB onValue() ──────────────────────────────
  useEffect(() => {
    if (!myEmail || !friendEmail) return;

    setIsInitialLoading(true);
    setMessages([]);

    /**
     * listenToMessages() returns an unsubscribe function.
     * RTDB onValue() fires immediately with current data,
     * তারপর প্রতিটা নতুন change-এ আবার fire করে।
     * Polling দরকার নেই — এটাই RTDB এর সুবিধা।
     */
    let firstCall = true;
    const unsubscribe = listenToMessages(
      myEmail,
      friendEmail,
      80,
      (rtdbMsgs: RtdbMessage[]) => {
        const mapped: Message[] = rtdbMsgs.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.text,
          timestamp: m.timestamp,
          pending: false,
        }));
        setMessages(mapped);
        setIsOffline(false);
        if (firstCall) {
          setIsInitialLoading(false);
          firstCall = false;
        }
      }
    );

    // Offline detection: setTimeout fallback — RTDB নিজেই reconnect করে
    const offlineTimer = setTimeout(() => {
      if (firstCall) {
        setIsOffline(true);
        setIsInitialLoading(false);
        firstCall = false;
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(offlineTimer);
    };
  }, [myEmail, friendEmail]);

  // ── 3. Listen to friend's typing indicator (RTDB) ────────────────────────
  useEffect(() => {
    if (!myEmail || !friendEmail) return;

    const unsubscribe = listenToTyping(myEmail, friendEmail, (typing) => {
      setIsFriendTyping(typing);
    });

    return unsubscribe;
  }, [myEmail, friendEmail]);

  // ── 4. Scroll to bottom on new messages ──────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ── 5. Cleanup typing indicator on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (myEmail && friendEmail && isTypingRef.current) {
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [myEmail, friendEmail]);

  // ── 6. Handle input change + typing indicator ────────────────────────────
  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);
      if (!myEmail || !friendEmail) return;

      // Debounced typing indicator
      if (!isTypingRef.current && value.trim().length > 0) {
        isTypingRef.current = true;
        setTypingIndicator(myEmail, friendEmail, true).catch(() => {});
      }

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

      if (value.trim().length === 0) {
        isTypingRef.current = false;
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
        return;
      }

      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }, TYPING_DEBOUNCE_MS);
    },
    [myEmail, friendEmail]
  );

  // ── 7. Send message via RTDB ──────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !friendEmail || !myEmail || isSending) return;

      // Clear typing indicator immediately on send
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }

      // Optimistic UI: pending message দেখাও
      const optimisticId = `pending_${Date.now()}`;
      const optimisticMsg: Message = {
        id: optimisticId,
        senderId: myEmail,
        text: trimmed,
        timestamp: Date.now(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setInputText("");
      setShowEmojis(false);
      if (inputRef.current) inputRef.current.style.height = "42px";

      setIsSending(true);
      try {
        // RTDB-তে push — onValue() listener automatically নতুন message দেখাবে
        await sendMessage(myEmail, friendEmail, trimmed);
        // Optimistic message সরিয়ে নাও — listener নতুন real message আনবে
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      } catch {
        // Send failed — pending flag রাখো যাতে user জানে
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
    [friendEmail, myEmail, isSending]
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 mx-auto max-w-md shadow-2xl relative overflow-hidden">

      {/* ── Top Navigation Header ──────────────────────────────────── */}
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
            ) : isFriendTyping ? (
              /* Typing indicator ─ animated dots */
              <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                <span className="flex gap-0.5 items-center">
                  <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                টাইপ করছেন...
              </p>
            ) : (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                অ্যাক্টিভ আছেন
              </p>
            )}
          </div>
        </div>

        {/* RTDB badge */}
        <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 border border-teal-200/60">
          <Zap width={10} height={10} className="text-teal-600" />
          <span className="text-[9px] font-extrabold text-teal-700">Live</span>
        </div>
      </header>

      {/* ── Messages Chat Body ─────────────────────────────────────── */}
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
                প্রথম মেসেজ পাঠিয়ে হাই জানান 👋
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === myEmail;
              const dateLabel = formatDateLabel(msg.timestamp);
              const showDateLabel = dateLabel !== lastDateLabel;
              if (showDateLabel) lastDateLabel = dateLabel;

              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
              const isSameAsPrev = prevMsg?.senderId === msg.senderId;
              const isSameAsNext = nextMsg?.senderId === msg.senderId;

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
                          msg.pending ? "opacity-60" : "opacity-100"
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
                            {formatTime(msg.timestamp)}
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

            {/* Friend typing indicator bubble */}
            <AnimatePresence>
              {isFriendTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-end gap-2 mt-2"
                >
                  <div className={`h-7 w-7 rounded-full ${ac.bg} flex items-center justify-center shadow-xs border border-white flex-shrink-0`}>
                    <span className={`${ac.text} font-black text-[11px]`}>
                      {friendName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-xs shadow-xs border border-slate-200/90 px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

      {/* ── Quick Emoji Picker ─────────────────────────────────────── */}
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

      {/* ── Bottom Input Toolbar ──────────────────────────────────── */}
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
            id="chat-input"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
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
