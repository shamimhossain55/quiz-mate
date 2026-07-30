"use client";

import { useState } from "react";
import { X, Search, UserPlus, Check, Loader2, Crown, Sparkles } from "lucide-react";

interface SearchUser {
  email: string;
  name: string;
  customUid: string;
  avatarUrl: string | null;
  level: number;
  point: number;
}

interface FriendSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFriends?: () => void;
}

export default function FriendSearchModal({ isOpen, onClose, onRefreshFriends }: FriendSearchModalProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [sentSet, setSentSet] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/profile/search?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (user: SearchUser) => {
    setSendingEmail(user.email);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: user.customUid || user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentSet((prev) => new Set(prev).add(user.email));
        setToast("ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে! 🎉");
        setTimeout(() => setToast(null), 3000);
        if (onRefreshFriends) onRefreshFriends();
      } else {
        setToast(data.error || "রিকোয়েস্ট পাঠানো যায়নি");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setToast("একটি সমস্যা হয়েছে");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col relative max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <UserPlus width={18} height={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">বন্ধু খুঁজুন</h2>
              <p className="text-[10px] font-medium text-slate-400">UID (যেমন 872914) দিয়ে সহজে খুঁজুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 active:scale-95 transition-transform"
          >
            <X width={16} height={16} />
          </button>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearch} className="mt-3 flex gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="UID লিখুন (e.g. 872914 বা নাম)..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <Search width={15} height={15} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1"
          >
            {isSearching ? <Loader2 width={14} height={14} className="animate-spin" /> : "খুঁজুন"}
          </button>
        </form>

        {/* Toast Notification */}
        {toast && (
          <div className="mt-2 p-2 rounded-xl bg-teal-600 text-white text-[11px] font-extrabold text-center shadow-md animate-pulse flex-shrink-0">
            {toast}
          </div>
        )}

        {/* Results List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
          {isSearching ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : users.length > 0 ? (
            users.map((u) => {
              const isSent = sentSet.has(u.email);
              const isSendingThis = sendingEmail === u.email;
              return (
                <div
                  key={u.email}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-slate-900 text-teal-300 font-extrabold flex items-center justify-center border border-white shadow-xs overflow-hidden flex-shrink-0">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{u.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{u.name}</p>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-md">
                          Lvl {u.level}
                        </span>
                      </div>
                      <p className="text-[10px] font-extrabold text-teal-700 tracking-wider">
                        {u.customUid}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(u)}
                    disabled={isSent || isSendingThis}
                    className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer ${
                      isSent
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95 shadow-2xs"
                    }`}
                  >
                    {isSendingThis ? (
                      <Loader2 width={12} height={12} className="animate-spin" />
                    ) : isSent ? (
                      <>
                        <Check width={12} height={12} />
                        <span>পাঠানো হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <UserPlus width={12} height={12} />
                        <span>যুক্ত করুন</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : query && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles width={28} height={28} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">কাউকে পাওয়া যায়নি</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                সঠিক UID (যেমন 872914) লিখে আবার চেষ্টা করুন
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                <UserPlus width={24} height={24} />
              </div>
              <p className="text-xs font-bold text-slate-700">বন্ধুর UID টাইপ করে খুঁজুন</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                আপনার বন্ধুদের Quiz Mate এ যুক্ত করে একসাথে প্রতিযোগিতা করুন!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
