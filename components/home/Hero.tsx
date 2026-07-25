"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Play,
  Trophy,
  Swords,
  Target,
  Flame,
  Star,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const { data: session } = useSession();

  function handleAction() {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-8 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto max-w-5xl px-5 relative z-10">

        {/* ── TOP BADGE ── */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-extrabold shadow-2xs">
            <Sparkles width={13} height={13} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span>🇧🇩 বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি</span>
          </div>
        </div>

        {/* ── MAIN HEADLINE & SUBTITLE ── */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            পড়ালেখা হবে খেলা, <br className="hidden sm:block" />
            সাফল্য আসবে <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 bg-clip-text text-transparent">মেলায় 🚀</span>
          </h1>

          <p className="mt-3 text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
            ষষ্ঠ থেকে দ্বাদশ শ্রেণীর শিক্ষার্থীদের জন্য অধ্যায়ভিত্তিক কুইজ, বন্ধুদের সাথে ১v১ ব্যাটেল ও সাপ্তাহিক লিডারবোর্ড।
          </p>

          {/* ── CTA BUTTONS ── */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handleAction}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white text-xs sm:text-sm font-black shadow-[0_12px_28px_rgba(13,148,136,0.35)] active:scale-95 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Play width={16} height={16} fill="white" />
              <span>{session ? "ড্যাশবোর্ডে প্রবেশ করুন" : "বিনামূল্যে কুইজ খেলুন"}</span>
            </button>

            <a
              href="#features"
              className="h-12 px-5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 text-xs sm:text-sm font-extrabold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>ফিচারগুলো দেখুন</span>
              <ChevronRight width={16} height={16} />
            </a>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              <Flame width={12} height={12} className="fill-orange-500 text-orange-500" />
              <span>১০,০০০+ শিক্ষার্থী</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ShieldCheck width={12} height={12} className="text-emerald-600" />
              <span>১০০% ফ্রি রেজিস্টার</span>
            </div>
          </div>
        </div>

        {/* ── HERO DISPLAY BANNER (3D App Preview Card) ── */}
        <div className="mt-8 mx-auto max-w-sm sm:max-w-md">
          <div
            onClick={handleAction}
            className="rounded-3xl p-5 relative overflow-hidden shadow-[0_20px_45px_-10px_rgba(13,148,136,0.4)] border border-white/30 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4338CA 100%)" }}
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md">
                  <Trophy width={22} height={22} className="text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-teal-100 uppercase tracking-widest block">
                    লাইভ ডেমো
                  </span>
                  <h3 className="text-sm font-black text-white leading-tight">
                    QuizMate লাইভ গেমিফাইড ক্লাস
                  </h3>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow-sm animate-pulse">
                LIVE
              </span>
            </div>

            {/* 3 Interactive Cards */}
            <div className="relative z-10 grid grid-cols-3 gap-2">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex flex-col items-center text-center">
                <Target width={16} height={16} className="text-teal-200 mb-1" />
                <span className="text-xs font-black text-white leading-none">৫০,০০০+</span>
                <span className="text-[8px] font-bold text-teal-100/90 mt-0.5">প্রশ্ন</span>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex flex-col items-center text-center">
                <Swords width={16} height={16} className="text-amber-300 mb-1" />
                <span className="text-xs font-black text-white leading-none">১v১</span>
                <span className="text-[8px] font-bold text-teal-100/90 mt-0.5">ব্যাটেল</span>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 flex flex-col items-center text-center">
                <Star width={16} height={16} className="text-amber-300 fill-amber-300 mb-1" />
                <span className="text-xs font-black text-white leading-none">র‍্যাঙ্কিং</span>
                <span className="text-[8px] font-bold text-teal-100/90 mt-0.5">লিডারবোর্ড</span>
              </div>
            </div>

            <div className="mt-3.5 relative z-10 bg-black/20 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 flex items-center justify-between text-xs text-white font-extrabold">
              <span className="flex items-center gap-1.5">
                <Sparkles width={13} height={13} className="text-amber-300" />
                আজকের সেরা শিক্ষার্থী:
              </span>
              <span className="text-amber-300 font-black">আয়েশা (১,২৪০ XP) 🏆</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}