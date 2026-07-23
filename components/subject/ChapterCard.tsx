"use client";

import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import {
  BookOpen,
  PlayCircle,
  User,
} from "lucide-react";

import { Chapter } from "@/types/firestore";

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
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-blue-600">
            Chapter {chapter.order}
          </span>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {chapter.name}
          </h3>

          {chapter.author && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <User width={16} height={16} />
              <span>{chapter.author}</span>
            </div>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
          <BookOpen
            width={24} height={24}
            className="text-blue-600"
          />
        </div>
      </div>

      <div className="mt-8">
        <Button
          className="w-full"
          onClick={() =>
            router.push(
              `/quiz/setup?chapter=${chapter.id}`
            )
          }
        >
          <PlayCircle width={18} height={18} />
          Start Practice
        </Button>
      </div>
    </Card>
  );
}