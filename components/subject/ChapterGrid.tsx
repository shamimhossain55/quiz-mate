"use client";

import { useEffect, useState, useMemo } from "react";
import ChapterCard from "./ChapterCard";
import { getChapters } from "@/lib/firestore/chapters";
import { Chapter } from "@/types/firestore";
import { Loader2, BookOpen, Layers, Sparkles, Filter } from "lucide-react";

interface Props {
  subjectId: string;
}

const fallbackChapters: Chapter[] = [
  // গদ্য সেকশন
  { id: "ch1", subjectId: "bangla", name: "অধ্যায় ১: সততার পুরস্কার", author: "মুহম্মদ শহীদুল্লাহ", order: 1, sectionName: "গদ্য" },
  { id: "ch2", subjectId: "bangla", name: "অধ্যায় ২: মিনু", author: "বনফুল", order: 2, sectionName: "গদ্য" },
  { id: "ch3", subjectId: "bangla", name: "অধ্যায় ৩: নীল নদ আর পিরামিডের দেশ", author: "সৈয়দ মুজতবা আলী", order: 3, sectionName: "গদ্য" },
  { id: "ch4", subjectId: "bangla", name: "অধ্যায় ৪: তোলপাড়", author: "শওকত ওসমান", order: 4, sectionName: "গদ্য" },
  { id: "ch5", subjectId: "bangla", name: "অধ্যায় ৫: আকাশ", author: "আবদুল্লাহ আল-মুতী", order: 5, sectionName: "গদ্য" },
  // কবিতা সেকশন
  { id: "ch6", subjectId: "bangla", name: "অধ্যায় ৬: জন্মভূমি", author: "রবীন্দ্রনাথ ঠাকুর", order: 6, sectionName: "কবিতা" },
  { id: "ch7", subjectId: "bangla", name: "অধ্যায় ৭: সুখ", author: "কামিনী রায়", order: 7, sectionName: "কবিতা" },
  { id: "ch8", subjectId: "bangla", name: "অধ্যায় ৮: মানুষ জাতি", author: "সত্যেন্দ্রনাথ দত্ত", order: 8, sectionName: "কবিতা" },
  { id: "ch9", subjectId: "bangla", name: "অধ্যায় ৯: ঝিঙে ফুল", author: "কাজী নজরুল ইসলাম", order: 9, sectionName: "কবিতা" },
  { id: "ch10", subjectId: "bangla", name: "অধ্যায় ১০: আসমানি", author: "জসীমউদ্‌দীন", order: 10, sectionName: "কবিতা" },
];

export default function ChapterGrid({ subjectId }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await getChapters(subjectId);
        if (data.length > 0) {
          setChapters(data);
        } else {
          // If fallback for bangla subject
          setChapters(fallbackChapters);
        }
      } catch (err) {
        setChapters(fallbackChapters);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId]);

  // Extract unique sections from chapters
  const sections = useMemo(() => {
    const sectionMap = new Map<string, number>();
    chapters.forEach((ch) => {
      if (ch.sectionName && ch.sectionName.trim()) {
        const sName = ch.sectionName.trim();
        sectionMap.set(sName, (sectionMap.get(sName) || 0) + 1);
      }
    });
    return Array.from(sectionMap.entries()).map(([name, count]) => ({ name, count }));
  }, [chapters]);

  // Filter chapters based on active section
  const filteredChapters = useMemo(() => {
    if (activeSection === "all") return chapters;
    return chapters.filter((c) => c.sectionName?.trim() === activeSection);
  }, [chapters, activeSection]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-teal-600">
        <Loader2 width={24} height={24} className="animate-spin" />
        <p className="text-xs font-bold text-slate-500">অধ্যায়সমূহ লোড হচ্ছে...</p>
      </div>
    );
  }

  const hasSections = sections.length > 0;

  return (
    <div className="space-y-4">
      {/* SECTIONS SELECTION HEADER (If subject has sections like গদ্য / কবিতা) */}
      {hasSections && (
        <div className="space-y-2.5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-3xl text-white border border-slate-700/60 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Layers width={14} height={14} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wide">বিষয় সেকশনসমূহ</h3>
                <p className="text-[10px] text-teal-200/70 font-medium">নিচের সেকশনে ক্লিক করে অধ্যায়সমূহ দেখো</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-teal-500/20 border border-teal-400/30 text-teal-300 px-2.5 py-1 rounded-full">
              {sections.length}টি সেকশন
            </span>
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setActiveSection("all")}
              className={`px-3 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 ${
                activeSection === "all"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-900/40 scale-[1.02]"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/80"
              }`}
            >
              <Sparkles width={12} height={12} />
              সকল সেকশন ({chapters.length})
            </button>

            {sections.map(({ name, count }, index) => {
              const isActive = activeSection === name;
              const icons = ["📖", "🎭", "📚", "✍️", "📜"];
              const icon = icons[index % icons.length];

              return (
                <button
                  key={name}
                  onClick={() => setActiveSection(name)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-900/40 scale-[1.02]"
                      : "bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700/80"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-700 text-teal-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CHAPTER LIST HEADER */}
      {hasSections && activeSection !== "all" && (
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Filter width={13} height={13} className="text-teal-600" />
            <span className="text-xs font-black">
              সেকশন: <span className="text-teal-600 uppercase">{activeSection}</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {filteredChapters.length}টি অধ্যায়
          </span>
        </div>
      )}

      {/* CHAPTER CARDS GRID */}
      <div className="space-y-2.5">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))
        ) : (
          <div className="py-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
            <BookOpen width={24} height={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold">এই সেকশনে কোনো অধ্যায় পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}