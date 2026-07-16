"use client";

import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import { BookOpen, Clock, PlayCircle } from "lucide-react";

import { Chapter } from "./chapters";

interface ChapterCardProps {
  chapter: Chapter;
}

export default function ChapterCard({
  chapter,
}: ChapterCardProps) {
  const router = useRouter();

  return (
    <Card
      className="
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-300
        hover:shadow-xl
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-blue-600">
            {chapter.id.toUpperCase()}
          </span>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {chapter.title}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <BookOpen
            className="text-blue-600"
            size={24}
          />
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm leading-6 text-slate-500">
        {chapter.description}
      </p>

      {/* Info */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <BookOpen size={18} />
          <span>{chapter.questionCount} Questions</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock size={18} />
          <span>{chapter.estimatedTime}</span>
        </div>
      </div>

      {/* Button */}
      <div className="mt-8">
        <Button
          className="w-full"
          onClick={() =>
            router.push(`/quiz/setup?chapter=${chapter.id}`)
          }
        >
          <PlayCircle size={18} />
          Start Practice
        </Button>
      </div>
    </Card>
  );
}