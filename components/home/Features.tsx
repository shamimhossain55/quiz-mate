"use client";

import {
  BookOpen,
  Swords,
  Trophy,
  BarChart3,
  Flame,
  Award,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    id: "chapter-quiz",
    title: "অধ্যায়ভিত্তিক কুইজ",
    subtitle: "বইভিত্তিক প্রশ্নাবলী",
    description: "ষষ্ঠ থেকে দ্বাদশ শ্রেণীর বোর্ডের বই অনুসারে সাজানো প্রতিটি অধ্যায়ের টাইমারযুক্ত কুইজ।",
    icon: BookOpen,
    color: "text-teal-600",
    gradient: "from-teal-500/10 to-emerald-500/10 border-teal-200/80",
    badge: "পড়ালেখা",
  },
  {
    id: "battle",
    title: "১v১ ফ্রেন্ড ব্যাটেল",
    subtitle: "লাইভ অনলাইন লড়াই",
    description: "যেকোনো বন্ধুর সাথে রিয়েল-টাইমে বিষয় নির্বাচন করে কুইজ যুদ্ধ করো এবং XP পয়েন্ট জিতে নাও।",
    icon: Swords,
    color: "text-amber-600",
    gradient: "from-amber-500/10 to-orange-500/10 border-amber-200/80",
    badge: "লাইভ",
  },
  {
    id: "leaderboard",
    title: "জাতীয় লিডারবোর্ড",
    subtitle: "সাপ্তাহিক র‍্যাঙ্কিং",
    description: "সারা দেশের সেরা শিক্ষার্থীদের সাথে প্রতিযোগিতা করে ৩D পোডিয়াম স্টেজ ও গোল্ডেন ব্যাজ জয় করো।",
    icon: Trophy,
    color: "text-indigo-600",
    gradient: "from-indigo-500/10 to-purple-500/10 border-indigo-200/80",
    badge: "র‍্যাঙ্ক",
  },
  {
    id: "analytics",
    title: "পারফরম্যান্স অ্যানালিটিক্স",
    subtitle: "দুর্বল জায়গা ট্র্যাকিং",
    description: "নিজের সঠিকতার হার, গড় স্কোর এবং দুর্বল বিষয়সমূহ চিহ্নিত করে দক্ষতা বাড়াও।",
    icon: BarChart3,
    color: "text-rose-600",
    gradient: "from-rose-500/10 to-pink-500/10 border-rose-200/80",
    badge: "রিপোর্ট",
  },
  {
    id: "streak",
    title: "ডেইলি স্ট্রিক ফায়ার",
    subtitle: "নিয়মিত অনুশীলনের অভ্যাস",
    description: "প্রতিদিন কুইজ খেলে স্ট্রিক ধরে রাখো এবং স্পেশাল বোনাস XP পয়েন্ট অর্জন করো।",
    icon: Flame,
    color: "text-orange-600",
    gradient: "from-orange-500/10 to-amber-500/10 border-orange-200/80",
    badge: "স্ট্রিক",
  },
  {
    id: "level-badges",
    title: "লেভেল আপ ও ব্যাজ",
    subtitle: "অর্জন ও সম্মাননা",
    description: "পয়েন্ট অর্জনের সাথে সাথে লেভেল বাড়াও এবং প্রোফাইলে স্পেশাল চ্যাম্পিয়ন ব্যাজ আনলক করো।",
    icon: Award,
    color: "text-emerald-600",
    gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-200/80",
    badge: "ব্যাজ",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 bg-white font-sans relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-[10px] font-extrabold shadow-2xs mb-2">
            <Zap width={12} height={12} className="text-amber-500 fill-amber-500" />
            <span>QuizMate কি কি অফার করে?</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            স্মার্ট শেখার সব ফিচার এক জায়গায় 🚀
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            শিক্ষার্থীদের পড়াশোনাকে সহজ, আনন্দদায়ক ও প্রতিযোগিতামূলক করতে তৈরি বিশেষ ফিচারসমূহ।
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`rounded-3xl p-4 bg-gradient-to-br ${item.gradient} border shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:shadow-md transition-all duration-200 group relative overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                    <Icon width={22} height={22} className={item.color} />
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[10px] font-bold text-teal-700 mt-0.5">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
