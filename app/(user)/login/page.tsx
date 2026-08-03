"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("ইমেইল এবং পাসওয়ার্ড দুটিই প্রয়োজন");
      return;
    }
    if (!email.includes("@")) {
      setError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (password.length < 4) {
      setError("পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      if (res?.error) {
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
        setLoading(false);
      } else {
        router.replace("/onboarding");
      }
    } catch (err) {
      console.error(err);
      setError("লগইন করতে সমস্যা হয়েছে, আবার চেষ্টা করুন");
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    signIn("google", { callbackUrl: "/onboarding" });
  }

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 justify-center px-5 relative z-10 py-6">

        {/* ── MAIN LOGIN CARD ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 text-center relative overflow-hidden">

          {/* App Logo */}
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-600 p-[2px] mx-auto mb-3 shadow-md">
            <div className="h-full w-full rounded-[14px] bg-slate-900 flex items-center justify-center">
              <Zap width={26} height={26} className="text-teal-300 fill-teal-300" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 text-[10px] font-extrabold mb-2">
            <Sparkles width={11} height={11} className="text-amber-500 fill-amber-500" />
            <span>QuizMate অ্যাকাউন্টে প্রবেশ করুন</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "স্বাগতম QuizMate-এ! 🚀"}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-1 mb-4 leading-relaxed">
            {isRegister
              ? "তোমার ইমেইল দিয়ে ফ্রী অ্যাকাউন্ট তৈরি করে শুরু করো।"
              : "কুইজ খেলা, ১v১ ব্যাটেল ও লিডারবোর্ডে অংশ নিতে প্রবেশ করো।"}
          </p>

          {/* ── LOGIN / REGISTER TAB SWITCHER ── */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl mb-4 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                !isRegister
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                isRegister
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              রেজিস্টার
            </button>
          </div>

          {/* ── GOOGLE LOGIN BUTTON ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 bg-white border-2 border-slate-200/90 text-slate-800 py-3 px-4 rounded-2xl font-extrabold text-xs hover:border-teal-500 hover:text-teal-700 active:scale-[0.98] transition-all duration-200 shadow-2xs mb-4"
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google Logo"
              width={18}
              height={18}
              className="w-4.5 h-4.5"
            />
            <span>Google দিয়ে সরাসরি প্রবেশ করুন</span>
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider relative z-10">
              অথবা ইমেইল দিয়ে
            </span>
          </div>

          {/* ── EMAIL & PASSWORD FORM ── */}
          <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
            {isRegister && (
              <div>
                <label className="text-[10px] font-extrabold text-slate-600 block mb-1">
                  তোমার নাম
                </label>
                <div className="relative">
                  <User width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="যেমন: শামীম হোসেন"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-extrabold text-slate-600 block mb-1">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-extrabold text-slate-600">
                  পাসওয়ার্ড
                </label>
                {!isRegister && (
                  <a href="#" className="text-[9px] font-bold text-teal-600 hover:underline">
                    ভুলে গেছেন?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff width={15} height={15} /> : <Eye width={15} height={15} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-2.5 flex items-center gap-2 text-rose-700 text-xs font-bold shadow-2xs">
                <AlertCircle width={15} height={15} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white text-xs font-extrabold shadow-md active:scale-[0.98] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 width={16} height={16} className="animate-spin" />
                  <span>প্রবেশ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? "সাইন-আপ করুন" : "প্রবেশ করুন"}</span>
                  <ArrowRight width={15} height={15} />
                </>
              )}
            </button>
          </form>

          {/* Features Highlight Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <Trophy width={14} height={14} className="text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-slate-800 leading-none">১০০+ XP বোনাস</p>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5">প্রথমবার প্রবেশে</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <ShieldCheck width={14} height={14} className="text-teal-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-slate-800 leading-none">নিরাপদ সিস্টেম</p>
                <p className="text-[8px] text-slate-400 font-medium mt-0.5">১০০% ভেরিফাইড</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
