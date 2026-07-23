"use client";

import { useEffect, useState } from "react";

import ChapterCard from "./ChapterCard";

import { getChapters } from "@/lib/firestore/chapters";
import { Chapter } from "@/types/firestore";

interface Props {
  subjectId: string;
}

export default function ChapterGrid({
  subjectId,
}: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getChapters(subjectId);
        setChapters(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        Loading chapters...
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
        <h3 className="text-xl font-semibold">
          No Chapters Found
        </h3>

        <p className="mt-2 text-slate-500">
          This subject doesn&apos;t have any chapters yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
        />
      ))}
    </div>
  );
}