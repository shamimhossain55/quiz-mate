"use client";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

import { useQuiz } from "@/context/QuizContext";
import { questions } from "@/components/quiz/questions";
import type { Question } from "@/components/quiz/questions";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const router = useRouter();

  const { answers } = useQuiz();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-slate-900">
            Review Answers
          </h1>

          <p className="mt-3 text-lg text-slate-500">
            Review every question and compare your answer
            with the correct one.
          </p>
        </div>

        {/* Questions */}
        {questions.map((question: Question, index: number) => {
          const userAnswer = answers[question.id];

          const isCorrect =
            userAnswer === question.correctAnswer;

          return (
            <Card
              key={question.id}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold text-blue-600">
                    Question {index + 1}
                  </span>

                  <h2 className="mt-3 text-2xl font-bold text-slate-900">
                    {question.question}
                  </h2>
                </div>

                {isCorrect ? (
                  <CheckCircle2
                    className="text-green-500"
                    width={34}
                    height={34}
                  />
                ) : (
                  <XCircle
                    className="text-red-500"
                    width={34}
                    height={34}
                  />
                )}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {/* Your Answer */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Your Answer
                  </p>

                  <h3
                    className={`mt-2 text-xl font-bold ${
                      isCorrect
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {userAnswer !== undefined
                      ? question.options[userAnswer]
                      : "Not Answered"}
                  </h3>
                </div>

                {/* Correct Answer */}
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <p className="text-sm font-medium text-green-700">
                    Correct Answer
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-green-700">
                    {
                      question.options[
                        question.correctAnswer
                      ]
                    }
                  </h3>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Footer */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft width={20} height={20} />
            Back
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}