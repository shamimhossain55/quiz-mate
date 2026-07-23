"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizNavigation from "@/components/quiz/QuizNavigation";

import { useQuiz } from "@/context/QuizContext";
import { useQuizConfig } from "@/context/QuizConfigContext";
import { useQuizTimer } from "@/context/QuizTimerContext";

import { getQuestions } from "@/lib/firestore/questions";

import { Question } from "@/types/firestore";

import { useSession } from "next-auth/react";

import { saveResult } from "@/lib/quiz/saveResult";
import { updateStudentStats } from "@/lib/firestore/student";

export default function QuizPlayPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { config } = useQuizConfig();

  const {
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    resetQuiz,
  } = useQuiz();

  const {
    timeLeft,
    setTimeLeft,
    resetTimer,
  } = useQuizTimer();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      if (!config.chapterId) {
        router.replace("/dashboard");
        return;
      }

      const quizId = `${config.chapterId}_quiz`;

      const data = await getQuestions(quizId);

      setQuestions(data);

      resetTimer(config.timeLimit * 60);

      setLoading(false);
    }

    loadQuestions();
  }, [
    config.chapterId,
    config.timeLimit,
    router,
    resetTimer,
  ]);

  const totalQuestions = Math.min(
    config.questionCount,
    questions.length
  );

  const handleFinish = useCallback(async () => {
  let score = 0;

  questions
    .slice(0, totalQuestions)
    .forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score++;
      }
    });

  const correct = score;
  const wrong = totalQuestions - correct;

  if (session?.user?.email) {
    const percentage =
      totalQuestions === 0
        ? 0
        : Math.round((score / totalQuestions) * 100);

    await saveResult({
      userId: session.user.email,
      quizId: `${config.chapterId}_quiz`,
      chapterId: config.chapterId,
      score,
      correct,
      wrong,
      skipped: 0,
      percentage,
      negativeMarking: config.negativeMarking,
      timeTaken: config.timeLimit,
    });

    await updateStudentStats({
      studentId: session.user.email,
      point: score,
    });
  }

  resetQuiz();

  router.push(
    `/quiz/result?score=${score}&correct=${correct}&wrong=${wrong}&total=${totalQuestions}`
  );
}, [
  answers,
  questions,
  totalQuestions,
  session,
  config,
  resetQuiz,
  router,
]);

  useEffect(() => {
    if (loading) return;

    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    loading,
    timeLeft,
    handleFinish,
    setTimeLeft,
  ]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-xl font-semibold">
          Loading Questions...
        </div>
      </DashboardLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-xl font-semibold">
          No Questions Found
        </div>
      </DashboardLayout>
    );
  }

  const current =
    questions[currentQuestion - 1];

  function handleAnswerSelect(
    answerIndex: number
  ) {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: answerIndex,
    }));
  }

  const minutes = Math.floor(timeLeft / 60);

  const seconds = timeLeft % 60;

  const formattedTime = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        <QuizHeader
          subject="Practice Quiz"
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          timeLeft={formattedTime}
        />

        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />

        <QuestionCard
          question={current}
          selectedAnswer={answers[current.id]}
          onAnswerSelect={
            handleAnswerSelect
          }
        />

        <QuizNavigation
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          onPrevious={() =>
            setCurrentQuestion((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          onNext={() =>
            setCurrentQuestion((prev) =>
              Math.min(
                prev + 1,
                totalQuestions
              )
            )
          }
          onFinish={handleFinish}
        />

      </div>
    </DashboardLayout>
  );
}