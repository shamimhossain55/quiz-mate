"use client";

import { useState } from "react";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizNavigation from "@/components/quiz/QuizNavigation";

import { questions } from "@/components/quiz/questions";

export default function QuizPlayPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const totalQuestions = questions.length;
  const current = questions[currentQuestion - 1];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        <QuizHeader
          subject="Mathematics"
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          timeLeft="20:00"
        />

        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />

        <QuestionCard question={current} />

        <QuizNavigation
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          onPrevious={() =>
            setCurrentQuestion((prev) => Math.max(prev - 1, 1))
          }
          onNext={() =>
            setCurrentQuestion((prev) =>
              Math.min(prev + 1, totalQuestions)
            )
          }
          onFinish={() => {
            alert("Quiz Finished!");
          }}
        />

      </div>
    </DashboardLayout>
  );
}