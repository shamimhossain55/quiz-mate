"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

import {
  RotateCcw,
  Home,
  BookOpen,
} from "lucide-react";

export default function ResultActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => router.back()}
        className="w-full"
      >
        <RotateCcw width={20} height={20} />
        Retry Quiz
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/quiz/review")}
        className="w-full"
      >
        <BookOpen width={20} height={20} />
        Review Answers
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/subjects")}
        className="w-full"
      >
        <BookOpen width={20} height={20} />
        Back To Subjects
      </Button>

      <Button
        variant="outline"
        onClick={() => router.push("/dashboard")}
        className="w-full"
      >
        <Home width={20} height={20} />
        Dashboard
      </Button>
    </div>
  );
}