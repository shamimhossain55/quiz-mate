"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import QuestionCountSelector from "./QuestionCountSelector";
import TimeSelector from "./TimeSelector";
import NegativeMarkingSwitch from "./NegativeMarkingSwitch";

import { PlayCircle } from "lucide-react";

import { useQuizConfig } from "@/context/QuizConfigContext";
import { useQuizSession } from "@/context/QuizSessionContext";

import { startQuiz } from "@/lib/quiz/startQuiz";

interface QuizSetupCardProps {
  chapterId: string;
}

export default function QuizSetupCard({
  chapterId,
}: QuizSetupCardProps) {
  const router = useRouter();

  const { setConfig } = useQuizConfig();

  const { setSession } = useQuizSession();

  const [questionCount, setQuestionCount] =
    useState(20);

  const [timeLimit, setTimeLimit] =
    useState(20);

  const [negativeMarking, setNegativeMarking] =
    useState(false);

  function handleStartQuiz() {
    // Save setup config
    setConfig({
      chapterId,
      questionCount,
      timeLimit,
      negativeMarking,
    });

    // Create quiz session
    const session = startQuiz(
      chapterId,
      questionCount,
      timeLimit,
      negativeMarking
    );

    // Save running session
    setSession(session);

    // Go to play page
    router.push("/quiz/play");
  }

  return (
    <Card className="mx-auto max-w-4xl p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Quiz Setup
        </h1>

        <p className="mt-2 text-slate-500">
          Configure your quiz before starting.
        </p>
      </div>

      <div className="space-y-10">
        <QuestionCountSelector
          value={questionCount}
          onChange={setQuestionCount}
        />

        <TimeSelector
          value={timeLimit}
          onChange={setTimeLimit}
        />

        <NegativeMarkingSwitch
          value={negativeMarking}
          onChange={setNegativeMarking}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Quiz Summary
        </h2>

        <div className="mt-5 space-y-3 text-slate-700">

          <div className="flex justify-between">
            <span>Questions</span>

            <span className="font-semibold">
              {questionCount}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Time Limit</span>

            <span className="font-semibold">
              {timeLimit} min
            </span>
          </div>

          <div className="flex justify-between">
            <span>Negative Marking</span>

            <span className="font-semibold">
              {negativeMarking
                ? "Enabled"
                : "Disabled"}
            </span>
          </div>

        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleStartQuiz}
          className="w-full"
        >
          <PlayCircle width={20} height={20} />
          Start Quiz
        </Button>
      </div>
    </Card>
  );
}