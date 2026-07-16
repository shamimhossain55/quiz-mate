"use client";

import { MessageCircle, Swords, Search, UserPlus } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Community Page
 * বন্ধুদের লিস্ট + অনলাইন/অফলাইন স্ট্যাটাস + DM + 1v1 কুইজ চ্যালেঞ্জ
 * এখন dummy data দিয়ে বানানো, পরে Firestore থেকে real friends/status ডেটা কানেক্ট করতে হবে
 */

type Friend = {
  uid: string;
  name: string;
  avatarUrl: string | null;
  className: string;
  isOnline: boolean;
  point: number;
};

// এখানে পরে Firestore থেকে real friends list + presence (online/offline) ডেটা fetch করে বসাতে হবে
const friends: Friend[] = [
  { uid: "u1", name: "আয়েশা রহমান", avatarUrl: null, className: "ক্লাস ৯", isOnline: true, point: 1240 },
  { uid: "u2", name: "তানভীর আহমেদ", avatarUrl: null, className: "ক্লাস ৯", isOnline: true, point: 1180 },
  { uid: "u3", name: "নুসরাত জাহান", avatarUrl: null, className: "ক্লাস ৮", isOnline: false, point: 1105 },
  { uid: "u4", name: "রাকিব হাসান", avatarUrl: null, className: "ক্লাস ৯", isOnline: false, point: 990 },
  { uid: "u6", name: "মিম আক্তার", avatarUrl: null, className: "ক্লাস ৮", isOnline: true, point: 812 },
  { uid: "u7", name: "ফাহিম শাহরিয়ার", avatarUrl: null, className: "ক্লাস ৯", isOnline: false, point: 760 },
];

export default function CommunityPage() {
  const onlineFriends = friends.filter((f) => f.isOnline);
  const offlineFriends = friends.filter((f) => !f.isOnline);

  function handleMessage(friend: Friend) {
    // পরে: /community/chat/[uid] তে নিয়ে যাবে বা DM মোডাল খুলবে
    console.log("মেসেজ পাঠাও:", friend.uid);
  }

  function handleChallenge(friend: Friend) {
    // পরে: 1v1 কুইজ চ্যালেঞ্জ তৈরি করে Firestore-এ লিখবে, প্রতিপক্ষকে নোটিফাই করবে
    console.log("চ্যালেঞ্জ পাঠাও:", friend.uid);
  }

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        {/* টপ সেকশন */}
        <div className="flex-shrink-0 px-5 pt-6 pb-4 relative z-10 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-900 text-lg font-medium">কমিউনিটি</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {onlineFriends.length} জন বন্ধু এখন অনলাইন
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="বন্ধু খুঁজুন"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 active:scale-95 transition-transform"
              >
                <Search size={17} className="text-slate-600" />
              </button>
              <button
                aria-label="বন্ধু যোগ করুন"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 active:scale-95 transition-transform"
              >
                <UserPlus size={17} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {onlineFriends.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400 mb-3">
                অনলাইন ({onlineFriends.length})
              </p>
              <div className="flex flex-col gap-3">
                {onlineFriends.map((friend) => (
                  <FriendRow
                    key={friend.uid}
                    friend={friend}
                    onMessage={() => handleMessage(friend)}
                    onChallenge={() => handleChallenge(friend)}
                  />
                ))}
              </div>
            </div>
          )}

          {offlineFriends.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-slate-400 mb-3">
                অফলাইন ({offlineFriends.length})
              </p>
              <div className="flex flex-col gap-3">
                {offlineFriends.map((friend) => (
                  <FriendRow
                    key={friend.uid}
                    friend={friend}
                    onMessage={() => handleMessage(friend)}
                    onChallenge={() => handleChallenge(friend)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="community" />
    </div>
  );
}

/**
 * FriendRow
 * একজন বন্ধুর অ্যাভাটার + নাম + অনলাইন স্ট্যাটাস ডট + মেসেজ/চ্যালেঞ্জ বাটন
 */
function FriendRow({
  friend,
  onMessage,
  onChallenge,
}: {
  friend: Friend;
  onMessage: () => void;
  onChallenge: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white"
      style={{
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
        border: "1px solid #F1F5F9",
      }}
    >
      <div className="relative flex-shrink-0">
        <div className="h-11 w-11 rounded-full ring-2 ring-teal-100 bg-teal-50 flex items-center justify-center overflow-hidden">
          {friend.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={friend.avatarUrl}
              alt={friend.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-teal-700 font-medium text-sm">
              {friend.name.slice(0, 1)}
            </span>
          )}
        </div>
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
            friend.isOnline ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{friend.name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {friend.className} • {friend.point} pt
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          aria-label="মেসেজ পাঠান"
          onClick={onMessage}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-teal-50 active:scale-95 transition-transform"
        >
          <MessageCircle size={16} className="text-teal-700" />
        </button>
        <button
          aria-label="১v১ চ্যালেঞ্জ পাঠান"
          onClick={onChallenge}
          className="h-9 w-9 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ background: "#FFF1EE" }}
        >
          <Swords size={16} className="text-rose-600" />
        </button>
      </div>
    </div>
  );
}