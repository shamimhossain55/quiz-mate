"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Trophy,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
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
} from "lucide-react";

/**
 * Settings (সেটিংস) Page
 * কালার থিম: টিল + কোরাল (আগের পেজগুলোর সাথে মিলিয়ে)
 * ফিক্সড হেডার + প্রোফাইল অ্যাভাটার, স্ক্রলযোগ্য পিল-শেপ ফিল্ড লিস্ট + Log out, ফিক্সড বটম ন্যাভ
 */

const tabs = [
  { id: "home", label: "হোম", icon: Home, path: "/dashboard" },
  { id: "leaderboard", label: "র‍্যাঙ্ক", icon: Trophy, path: "/leaderboard" },
  { id: "progress", label: "উন্নতি", icon: TrendingUp, path: "/progress" },
  { id: "community", label: "সবাই", icon: Users, path: "/community" },
  { id: "settings", label: "সেটিংস", icon: SettingsIcon, path: "/settings" },
];

// এখানে পরে Firestore/Auth থেকে আসল ডেটা fetch করে বসাবেন
const user = {
  name: "শামীম হোসেন",
  phone: "01704***1",
  email: "abc@gmail.com",
  password: "********",
  language: "বাংলা",
  avatarUrl: null as string | null,
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => {
    // এখানে Firebase Auth signOut() কল করে redirect করবেন
    console.log("লগ আউট করা হচ্ছে...");
  };

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col">
      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0">
        {/* ফিক্সড টপ সেকশন: শিরোনাম + প্রোফাইল অ্যাভাটার */}
        <div className="flex-shrink-0 bg-slate-50 relative z-10 shadow-[0_4px_10px_-6px_rgba(15,23,42,0.12)]">
          <div className="px-5 pt-6 pb-2">
            <p className="text-base font-medium text-slate-900">সেটিংস</p>
            <p className="text-xs text-slate-400 mt-0.5">তোমার প্রোফাইল ও অ্যাকাউন্ট</p>
          </div>

          <div className="flex flex-col items-center py-6">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-teal-100 bg-teal-50 flex items-center justify-center">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-teal-700 font-medium text-2xl">
                    {user.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <button
                aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center ring-2 ring-slate-50 active:scale-95 transition-transform"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-900 mt-3">{user.name}</p>
          </div>
        </div>

        {/* স্ক্রলযোগ্য মিডল সেকশন: ফিল্ড লিস্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-2 pb-6">
          <p className="text-sm font-medium text-slate-500 mb-3">অ্যাকাউন্ট তথ্য</p>
          <div className="flex flex-col gap-2.5 mb-6">
            <FieldRow icon={User} label="নাম" value={user.name} />
            <FieldRow icon={Phone} label="ফোন" value={user.phone} />
            <FieldRow icon={Mail} label="ইমেইল" value={user.email} />
            <FieldRow
              icon={Lock}
              label="পাসওয়ার্ড"
              value={showPassword ? "MyP@ssw0rd" : user.password}
              trailing={
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                  className="flex-shrink-0 text-slate-400 active:scale-95 transition-transform"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <FieldRow icon={Globe} label="ভাষা" value={user.language} />
          </div>

          {/* লগ আউট বাটন */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(145deg, #FFF1EE 0%, #FFE1DB 100%)",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
            }}
          >
            <LogOut size={16} className="text-rose-600" />
            <span className="text-sm font-medium text-rose-600">Log out</span>
          </button>
        </div>
      </div>

      {/* ফিক্সড বটম ন্যাভিগেশন */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-sm flex items-center justify-between px-6 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.push(tab.path);
                }}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <Icon
                  size={20}
                  className={isActive ? "text-teal-700" : "text-slate-400"}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-teal-700" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-teal-700 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * FieldRow
 * প্রতিটা অ্যাকাউন্ট তথ্যের জন্য পিল-শেপ রো: আইকন + লেবেল/ভ্যালু + এডিট চেভরন
 */
function FieldRow({
  icon: Icon,
  label,
  value,
  trailing,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-full pl-2 pr-4 py-2 bg-white"
      style={{ boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)" }}
    >
      <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-teal-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 leading-tight">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate leading-tight mt-0.5">
          {value}
        </p>
      </div>
      {trailing ?? <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
    </div>
  );
}