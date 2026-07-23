"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Camera,
  User,
  Phone,
  Mail,
  Lock,
  Globe,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  Star,
  Sparkles,
  Crown,
  Flame,
  Zap,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

/**
 * Premium Settings (সেটিংস) Page
 * প্রিমিয়াম প্রোফাইল কার্ড, গ্রুপড সেটিংস সেকশন, অ্যাচিভমেন্ট ব্যাজ
 */

// এখানে পরে Firestore/Auth থেকে আসল ডেটা fetch করে বসাবেন
const user = {
  name: "শামীম হোসেন",
  phone: "01704***1",
  email: "abc@gmail.com",
  password: "********",
  language: "বাংলা",
  avatarUrl: null as string | null,
  level: 12,
  xp: 1250,
  streak: 7,
  quizCount: 42,
  joinDate: "মার্চ ২০২৬",
};

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* অ্যাম্বিয়েন্ট গ্লোয়িং ব্যাকগ্রাউন্ড */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-3s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* ট্রান্সপারেন্ট হেডার */}
        <div className="flex-shrink-0 px-5 pt-5 pb-2 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center border border-slate-300/60 shadow-2xs">
                <Settings width={20} height={20} />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                সেটিংস
              </h1>
            </div>
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল কন্টেন্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-6 space-y-4 no-scrollbar">

          {/* প্রিমিয়াম প্রোফাইল কার্ড */}
          <div
            className="rounded-2xl p-4 relative overflow-hidden shadow-[0_8px_20px_rgba(13,148,136,0.18)] border border-white/30"
            style={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 55%, #047857 100%)",
            }}
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-lg pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-emerald-300/20 blur-md pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3.5">
              {/* অ্যাভাটার */}
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-300 via-white/60 to-teal-200 shadow-md">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/20">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-teal-300 font-extrabold text-xl">
                        {user.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
                  className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-white flex items-center justify-center ring-2 ring-teal-600 active:scale-95 transition-transform shadow-sm"
                >
                  <Camera width={12} height={12} className="text-teal-700" />
                </button>
              </div>

              {/* নাম ও তথ্য */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-white truncate leading-tight">
                    {user.name}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-amber-200 text-[8px] font-extrabold border border-white/20 flex items-center gap-0.5">
                    <Crown width={9} height={9} /> Pro
                  </span>
                </div>
                <p className="text-[10px] text-teal-100/80 font-medium mt-0.5">
                  যোগদান: {user.joinDate}
                </p>

                {/* মিনি স্ট্যাটস রো */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    <Zap width={10} height={10} className="text-amber-300" />
                    <span className="text-[9px] font-extrabold text-white">{user.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    <Flame width={10} height={10} className="text-orange-300 fill-orange-300" />
                    <span className="text-[9px] font-extrabold text-white">{user.streak}d</span>
                  </div>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                    <Star width={10} height={10} className="text-amber-300 fill-amber-300" />
                    <span className="text-[9px] font-extrabold text-white">Lvl {user.level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* অ্যাকাউন্ট তথ্য সেকশন */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">অ্যাকাউন্ট তথ্য</p>
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden divide-y divide-slate-100">
              <FieldRow icon={User} label="নাম" value={user.name} iconColor="text-teal-700" iconBg="bg-teal-50" />
              <FieldRow icon={Phone} label="ফোন" value={user.phone} iconColor="text-indigo-700" iconBg="bg-indigo-50" />
              <FieldRow icon={Mail} label="ইমেইল" value={user.email} iconColor="text-amber-700" iconBg="bg-amber-50" />
              <FieldRow
                icon={Lock}
                label="পাসওয়ার্ড"
                value={showPassword ? "MyP@ssw0rd" : user.password}
                iconColor="text-rose-700"
                iconBg="bg-rose-50"
                trailing={
                  <button
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                    className="flex-shrink-0 text-slate-400 active:scale-95 transition-transform p-1"
                  >
                    {showPassword ? <EyeOff width={16} height={16} /> : <Eye width={16} height={16} />}
                  </button>
                }
              />
            </div>
          </div>

          {/* পছন্দসমূহ সেকশন */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">পছন্দসমূহ</p>
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden divide-y divide-slate-100">
              <FieldRow icon={Globe} label="ভাষা" value={user.language} iconColor="text-teal-700" iconBg="bg-teal-50" />
              <FieldRow icon={Bell} label="নোটিফিকেশন" value="চালু" iconColor="text-violet-700" iconBg="bg-violet-50" />
              <FieldRow icon={Palette} label="থিম" value="লাইট মোড" iconColor="text-pink-700" iconBg="bg-pink-50" />
            </div>
          </div>

          {/* সাহায্য ও সাপোর্ট সেকশন */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">সাহায্য ও সাপোর্ট</p>
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden divide-y divide-slate-100">
              <FieldRow icon={HelpCircle} label="সাহায্য কেন্দ্র" value="FAQ ও গাইড" iconColor="text-emerald-700" iconBg="bg-emerald-50" />
              <FieldRow icon={Shield} label="গোপনীয়তা নীতি" value="আপডেটেড" iconColor="text-sky-700" iconBg="bg-sky-50" />
              <FieldRow icon={Star} label="অ্যাপ রেটিং দিন" value="⭐⭐⭐⭐⭐" iconColor="text-amber-700" iconBg="bg-amber-50" />
            </div>
          </div>

          {/* অ্যাপ ভার্সন */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            <Sparkles width={12} height={12} className="text-slate-300" />
            <span className="text-[10px] font-bold text-slate-300">QuizMate v1.0.0 • তৈরি ❤️ দিয়ে</span>
          </div>

          {/* লগ আউট বাটন */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 transition-all active:scale-[0.98] bg-rose-50 border border-rose-200/80 hover:shadow-md shadow-[0_2px_8px_rgba(244,63,94,0.08)]"
          >
            <LogOut width={16} height={16} className="text-rose-600" />
            <span className="text-sm font-extrabold text-rose-600">লগ আউট</span>
          </button>

        </div>
      </div>

      <BottomNav activeTab="settings" />
    </div>
  );
}

/**
 * FieldRow
 * গ্রুপড সেটিংস ফিল্ড রো — কালার-কোডেড আইকন, লেবেল, ভ্যালু, ও চেভরন
 */
function FieldRow({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
  trailing,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer active:bg-slate-100">
      <div className={`h-8 w-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 border border-white/60 shadow-2xs`}>
        <Icon width={16} height={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400 font-medium leading-tight">{label}</p>
        <p className="text-xs font-extrabold text-slate-900 truncate leading-tight mt-0.5">
          {value}
        </p>
      </div>
      {trailing ?? <ChevronRight width={16} height={16} className="text-slate-300 flex-shrink-0" />}
    </div>
  );
}