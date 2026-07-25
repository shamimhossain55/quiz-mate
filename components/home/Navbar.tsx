"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Zap, LogIn, ArrowRight } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-indigo-600 p-[2px] shadow-md group-hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-[14px] bg-slate-900 flex items-center justify-center">
              <Zap width={18} height={18} className="text-teal-300 fill-teal-300" />
            </div>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 block leading-none">
              QuizMate
            </span>
            <span className="text-[9px] font-bold text-teal-700 leading-none block mt-0.5">
              Learn & Battle
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-xs font-extrabold text-slate-600 hover:text-teal-700 transition-colors">
            ফিচারসমূহ
          </a>
          <a href="#subjects" className="text-xs font-extrabold text-slate-600 hover:text-teal-700 transition-colors">
            বিষয়সমূহ
          </a>
          <a href="#stats" className="text-xs font-extrabold text-slate-600 hover:text-teal-700 transition-colors">
            পরিসংখ্যান
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          {session ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="h-10 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-extrabold shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>ড্যাশবোর্ড</span>
              <ArrowRight width={14} height={14} />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="h-10 px-3.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <LogIn width={14} height={14} />
                <span>লগইন</span>
              </Link>
              <Link
                href="/login"
                className="h-10 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-extrabold shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>শুরু করি</span>
                <ArrowRight width={14} height={14} />
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}