"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Calculator,
  Languages,
  FlaskConical,
  Globe2,
  BarChart3,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const subjectsList = [
  { id: "bangla", name: "বাংলা", icon: BookOpen, color: "#0D9488", gradient: "linear-gradient(145deg, #0D9488 0%, #047857 100%)", chapters: 18, desc: "১ম ও ২য় পত্রের ব্যাকরণ" },
  { id: "english", name: "English", icon: Languages, color: "#F87171", gradient: "linear-gradient(145deg, #F87171 0%, #E11D48 100%)", chapters: 12, desc: "Grammar & Vocabulary" },
  { id: "math", name: "গণিত", icon: Calculator, color: "#6366F1", gradient: "linear-gradient(145deg, #6366F1 0%, #4338CA 100%)", chapters: 15, desc: "পাটিগণিত, বীজগণিত ও জ্যামিতি" },
  { id: "science", name: "বিজ্ঞান", icon: FlaskConical, color: "#F59E0B", gradient: "linear-gradient(145deg, #F59E0B 0%, #D97706 100%)", chapters: 14, desc: "পদার্থ, রসায়ন ও জীববিজ্ঞান" },
  { id: "socialScience", name: "সমাজবিজ্ঞান", icon: Globe2, color: "#14B8A6", gradient: "linear-gradient(145deg, #14B8A6 0%, #0F766E 100%)", chapters: 10, desc: "বাংলাদেশ ও বিশ্বপরিচয়" },
  { id: "ict", name: "আইসিটি", icon: BarChart3, color: "#EC4899", gradient: "linear-gradient(145deg, #EC4899 0%, #BE185D 100%)", chapters: 8, desc: "তথ্য ও যোগাযোগ প্রযুক্তি" },
];

export default function Subjects() {
  const router = useRouter();
  const { data: session } = useSession();

  function handleSubjectClick(slug: string) {
    if (session) {
      router.push(`/subject/${slug}`);
    } else {
      router.push("/login");
    }
  }

  return (
    <section id="subjects" className="py-12 bg-slate-50 font-sans relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 relative z-10">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles width={14} height={14} className="text-amber-500" />
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                পাঠ্যবই ও বিষয়সমূহ
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
              পছন্দের বিষয় নির্বাচন করো 📚
            </h2>
          </div>

          <button
            onClick={() => handleSubjectClick("bangla")}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-0.5 flex-shrink-0"
          >
            <span>সব দেখুন</span>
            <ChevronRight width={14} height={14} />
          </button>
        </div>

        {/* Subject Book Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {subjectsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSubjectClick(item.id)}
                className="rounded-3xl p-3 flex flex-col justify-between relative cursor-pointer active:scale-95 hover:-translate-y-1 transition-all duration-300 overflow-hidden group min-h-[140px]"
                style={{
                  background: item.gradient,
                  boxShadow: `0 8px 24px ${item.color}30`,
                }}
              >
                {/* Book Spine Overlay */}
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/15 rounded-full blur-md pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="h-8 w-8 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                    <Icon width={16} height={16} className="text-white" />
                  </div>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
                    {item.chapters} অধ্যায়
                  </span>
                </div>

                <div className="relative z-10 mt-auto pt-2">
                  <h4 className="text-xs font-black text-white leading-snug truncate group-hover:text-amber-200 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[8px] text-white/75 font-semibold line-clamp-1 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}