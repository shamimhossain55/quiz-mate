"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ArrowLeft,
  MessageCircle,
  Loader2,
  Smile,
  CheckCheck,
  WifiOff,
} from "lucide-react";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  senderEmail: string;
  text: string;
  createdAt: number;
  pending?: boolean; // optimistic local message
};

type Friend = {
  email: string;
  name: string;
  avatarUrl: string | null;
  level?: number;
  point?: number;
};

interface ChatInboxProps {
  isOpen: boolean;
  friend: Friend | null;
  onClose: () => void;
}

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "👏", "💪", "😊", "🙏"];
const POLL_INTERVAL_MS = 5000; // poll every 5s (efficient & smooth)

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

export default function ChatInbox({ isOpen, friend, onClose }: ChatInboxProps) {
  const { data: session } = useSession();
  const myEmail = session?.user?.email?.toLowerCase() || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // friend typing indicator

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageCountRef = useRef(0);
  const lastTimestampRef = useRef<number>(0); // track last known message ts for incremental polling
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // ── Fetch messages from API ─────────────────────────────────
  const fetchMessages = useCallback(
    async (silent = false, since?: number) => {
      if (!friend?.email || !myEmail) return;
      try {
        let url = `/api/messages?friendEmail=${encodeURIComponent(friend.email)}`;
        if (since && since > 0) {
          // Incremental poll — only fetch new messages
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
          pending: false,
        }));

        if (fetched.length > 0) {
          // Update last known timestamp
          const maxTs = Math.max(...fetched.map((m) => m.createdAt));
          lastTimestampRef.current = Math.max(lastTimestampRef.current, maxTs);
        }

        if (since && since > 0) {
          // Incremental: append only truly new messages
          if (fetched.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newOnes = fetched.filter((m) => !existingIds.has(m.id));
              if (newOnes.length === 0) return prev;
              // Remove pending optimistic messages that match
              const cleaned = prev.filter((m) => !m.pending);
              return [...cleaned, ...newOnes];
            });
          }
        } else {
          // Full load on first open
          setMessages(fetched);
          lastMessageCountRef.current = fetched.length;
        }

        setIsOffline(false);
        if (!silent) setIsInitialLoading(false);
      } catch {
        setIsOffline(true);
        if (!silent) setIsInitialLoading(false);
      }
    },
    [friend?.email, myEmail]
  );

  // ── Start / stop polling ────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !friend?.email || !myEmail) return;

    // Full initial load
    setIsInitialLoading(true);
    lastMessageCountRef.current = 0;
    lastTimestampRef.current = 0;
    setMessages([]);
    fetchMessages(false, 0); // full load, no since

    // Incremental poll every 5s — pause when tab is in background
    pollIntervalRef.current = setInterval(() => {
      if (isOpenRef.current && typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMessages(true, lastTimestampRef.current);
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isOpenRef.current) {
        fetchMessages(true, lastTimestampRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isOpen, friend?.email, myEmail, fetchMessages]);

  // ── Reset on close ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setInputText("");
      setShowEmojis(false);
      setMessages([]);
      setIsInitialLoading(true);
      setIsTyping(false);
      lastMessageCountRef.current = 0;
    } else {
      setTimeout(() => inputRef.current?.focus(), 450);
    }
  }, [isOpen]);

  // ── Scroll to bottom on new messages ───────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ── Send message ────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !friend?.email || isSending) return;

      // Optimistic update — add message locally immediately
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
          body: JSON.stringify({ friendEmail: friend.email, text: trimmed }),
        });
        // Immediately fetch since just before we sent, to confirm
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
    [friend?.email, isSending, myEmail, fetchMessages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  if (!friend) return null;

  const ac = colorFor(friend.name);
  let lastDateLabel = "";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Chat Sheet — slides up from bottom */}
          <motion.div
            key="chat-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "92dvh", maxWidth: "480px", margin: "0 auto" }}
          >
            {/* ── Chat Header ─────────────────────────────── */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-white border-b border-slate-100">
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-600 flex-shrink-0 cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <ArrowLeft width={18} height={18} />
                </button>

                <div className="relative flex-shrink-0">
                  <div
                    className={`h-10 w-10 rounded-full ${ac.bg} flex items-center justify-center overflow-hidden shadow-sm`}
                  >
                    {friend.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className={`${ac.text} font-extrabold text-base`}>
                        {friend.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 truncate leading-tight">
                    {friend.name}
                  </p>
                  {isOffline ? (
                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                      <WifiOff width={10} height={10} />
                      সংযোগ নেই
                    </p>
                  ) : isTyping ? (
                    <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      টাইপ করছে...
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold">অ্যাক্টিভ</p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-500 flex-shrink-0 cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X width={15} height={15} />
                </button>
              </div>
            </div>

            {/* ── Messages Area ────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 no-scrollbar bg-slate-50/40">
              {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                  <Loader2 width={28} height={28} className="animate-spin text-teal-500" />
                  <p className="text-xs text-slate-400 font-semibold">মেসেজ লোড হচ্ছে...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <MessageCircle width={30} height={30} className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      {friend.name}-এর সাথে কথোপকথন শুরু করুন!
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      প্রথম মেসেজ পাঠান 👋
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
                          <div className="flex items-center justify-center my-3">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-3 py-0.5 rounded-full">
                              {dateLabel}
                            </span>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.12, ease: "easeOut" }}
                          className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${
                            isSameAsPrev ? "mt-0.5" : "mt-2.5"
                          }`}
                        >
                          {/* Friend avatar */}
                          {!isMe && (
                            <div className="flex-shrink-0 w-7">
                              {!isSameAsNext ? (
                                <div
                                  className={`h-7 w-7 rounded-full ${ac.bg} flex items-center justify-center overflow-hidden shadow-xs`}
                                >
                                  {friend.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={friend.avatarUrl}
                                      alt={friend.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className={`${ac.text} font-extrabold text-[11px]`}>
                                      {friend.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`relative max-w-[75%] flex flex-col ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`px-3.5 py-2 text-sm leading-relaxed break-words transition-opacity ${
                                msg.pending ? "opacity-70" : "opacity-100"
                              } ${
                                isMe
                                  ? "bg-teal-600 text-white rounded-2xl rounded-br-sm shadow-sm"
                                  : "bg-white text-slate-900 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200/80"
                              }`}
                            >
                              {msg.text}
                            </div>

                            {/* Timestamp */}
                            {!isSameAsNext && (
                              <div
                                className={`flex items-center gap-1 mt-0.5 px-1 ${
                                  isMe ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <span className="text-[9px] text-slate-400 font-medium">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMe && (
                                  <CheckCheck
                                    width={12}
                                    height={12}
                                    className={msg.pending ? "text-slate-300" : "text-teal-500"}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}

                  {/* Offline indicator */}
                  {isOffline && (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-rose-400 font-semibold">
                      <WifiOff width={12} height={12} />
                      সংযোগ পুনরায় স্থাপন হচ্ছে...
                    </div>
                  )}

                  <div ref={bottomRef} className="h-2" />
                </>
              )}
            </div>

            {/* ── Emoji Quick Picker ───────────────────────── */}
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="flex-shrink-0 px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar"
                >
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSend(emoji)}
                      className="text-2xl active:scale-75 transition-transform hover:scale-125 cursor-pointer flex-shrink-0 select-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input Bar ───────────────────────────────── */}
            <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-slate-100 flex items-end gap-2">
              {/* Emoji toggle */}
              <button
                onClick={() => setShowEmojis((v) => !v)}
                className={`h-10 w-10 flex items-center justify-center rounded-2xl transition-all flex-shrink-0 cursor-pointer ${
                  showEmojis
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                aria-label="ইমোজি"
              >
                <Smile width={20} height={20} />
              </button>

              {/* Text input */}
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

              {/* Send button */}
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
            </div>

            {/* Safe area spacer */}
            <div
              className="flex-shrink-0 bg-white"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
