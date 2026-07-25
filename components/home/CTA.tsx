"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Trophy } from "lucide-react";

export default function CTA() {
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
    <section className="py-12 bg-slate-50 font-sans relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 relative z-10">
        <div
          className="rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[0_20px_50px_-10px_rgba(13,148,136,0.4)] border border-white/30 text-center"
          style={{ background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #4338CA 100%)" }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-300/20 blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] font-extrabold shadow-sm">
              <Trophy width={13} height={13} fill="#FCD34D" />
              <span>বিনামূল্যে অ্যাকাউন্ট খুলুন ও ১০০ XP পান</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              আজই তোমার লার্নিং জার্নি শুরু করো! 🚀
            </h2>

            <p className="text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
              সহজে পড়ালেখা করুন, বন্ধুদের চ্যালেঞ্জ জানান এবং নিজেকে দেশের শীর্ষে নিয়ে যান।
            </p>

            <div className="pt-2">
              <button
                onClick={handleAction}
                className="h-12 px-8 rounded-2xl bg-white text-teal-900 text-xs sm:text-sm font-black shadow-xl active:scale-95 hover:bg-amber-100 transition-all inline-flex items-center gap-2"
              >
                <span>{session ? "ড্যাশবোর্ডে যান" : "বিনামূল্যে সাইন-আপ করুন"}</span>
                <ArrowRight width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
