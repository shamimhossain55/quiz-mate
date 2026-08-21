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
};

interface ChatInboxProps {
  isOpen: boolean;
  friend: Friend | null;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_LIST = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "👏", "💪", "😊", "🙏"];
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

export default function ChatInbox({ isOpen, friend, onClose }: ChatInboxProps) {
  const { data: session } = useSession();
  const myEmail = session?.user?.email?.toLowerCase() || "";
  const friendEmail = friend?.email?.toLowerCase() || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // ── 1. Real-time messages via RTDB onValue() ──────────────────────────────
  useEffect(() => {
    if (!isOpen || !myEmail || !friendEmail) return;

    setIsInitialLoading(true);
    setMessages([]);

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

    // Offline fallback
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
  }, [isOpen, myEmail, friendEmail]);

  // ── 2. Listen to friend's typing indicator ─────────────────────────────────
  useEffect(() => {
    if (!isOpen || !myEmail || !friendEmail) return;

    const unsubscribe = listenToTyping(myEmail, friendEmail, (typing) => {
      setIsFriendTyping(typing);
    });

    return unsubscribe;
  }, [isOpen, myEmail, friendEmail]);

  // ── 3. Reset on close ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setInputText("");
      setShowEmojis(false);
      setMessages([]);
      setIsInitialLoading(true);
      setIsFriendTyping(false);
      // Clear typing indicator when closing
      if (isTypingRef.current && myEmail && friendEmail) {
        isTypingRef.current = false;
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    } else {
      setTimeout(() => inputRef.current?.focus(), 450);
    }
  }, [isOpen, myEmail, friendEmail]);

  // ── 4. Scroll to bottom on new messages ──────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // ── 5. Cleanup typing on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (myEmail && friendEmail && isTypingRef.current) {
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [myEmail, friendEmail]);

  // ── 6. Handle input + typing indicator ───────────────────────────────────
  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);
      if (!myEmail || !friendEmail) return;

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

      // Clear typing immediately
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        setTypingIndicator(myEmail, friendEmail, false).catch(() => {});
      }

      // Optimistic message
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
        await sendMessage(myEmail, friendEmail, trimmed);
        // onValue() listener নতুন message automatically দেখাবে, তাই pending remove করি
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
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
    [friendEmail, myEmail, isSending]
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

  // ─── Render ───────────────────────────────────────────────────────────────

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
            {/* ── Chat Header ────────────────────────────────── */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-white border-b border-slate-100">
              {/* Drag handle */}
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
                  ) : isFriendTyping ? (
                    <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                      <span className="flex gap-0.5 items-center">
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      টাইপ করছে...
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      অ্যাক্টিভ
                    </p>
                  )}
                </div>

                {/* Live badge */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 border border-teal-200/60 flex-shrink-0">
                  <Zap width={9} height={9} className="text-teal-600" />
                  <span className="text-[9px] font-extrabold text-teal-700">Live</span>
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

            {/* ── Messages Area ─────────────────────────────── */}
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

                            {!isSameAsNext && (
                              <div
                                className={`flex items-center gap-1 mt-0.5 px-1 ${
                                  isMe ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <span className="text-[9px] text-slate-400 font-medium">
                                  {formatTime(msg.timestamp)}
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

                  {/* Friend typing bubble */}
                  <AnimatePresence>
                    {isFriendTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-end gap-2 mt-2"
                      >
                        <div className={`h-7 w-7 rounded-full ${ac.bg} flex items-center justify-center shadow-xs flex-shrink-0`}>
                          <span className={`${ac.text} font-extrabold text-[11px]`}>
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm border border-slate-200/80 px-4 py-3 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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

            {/* ── Emoji Quick Picker ────────────────────────── */}
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

            {/* ── Input Bar ──────────────────────────────────── */}
            <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-slate-100 flex items-end gap-2">
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

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
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
