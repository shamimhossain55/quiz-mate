"use client";

import { useEffect, useState } from "react";
import ChapterCard from "./ChapterCard";
import { getChapters } from "@/lib/firestore/chapters";
import { Chapter } from "@/types/firestore";
import { Loader2, BookOpen } from "lucide-react";

interface Props {
  subjectId: string;
}

const fallbackChapters: Chapter[] = [
  { id: "ch1", subjectId: "bangla", name: "অধ্যায় ১: ভাষা ও ব্যাকরণ", order: 1 },
  { id: "ch2", subjectId: "bangla", name: "অধ্যায় ২: ধ্বনি ও বর্ণ", order: 2 },
  { id: "ch3", subjectId: "bangla", name: "অধ্যায় ৩: শব্দ ও পদ", order: 3 },
  { id: "ch4", subjectId: "bangla", name: "অধ্যায় ৪: বাক্য প্রকরণ", order: 4 },
  { id: "ch5", subjectId: "bangla", name: "অধ্যায় ৫: সমাস ও সন্ধি", order: 5 },
];

export default function ChapterGrid({ subjectId }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getChapters(subjectId);
        setChapters(data.length > 0 ? data : fallbackChapters);
      } catch (err) {
        setChapters(fallbackChapters);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-teal-600">
        <Loader2 width={24} height={24} className="animate-spin" />
        <p className="text-xs font-bold text-slate-500">অধ্যায়সমূহ লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {chapters.map((chapter) => (
        <ChapterCard key={chapter.id} chapter={chapter} />
      ))}
    </div>
  );
}