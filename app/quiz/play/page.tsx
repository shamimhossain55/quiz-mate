"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldAlert } from "lucide-react";

import QuizHeader from "@/components/quiz/QuizHeader";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizNavigation from "@/components/quiz/QuizNavigation";

import { useQuiz } from "@/context/QuizContext";
import { useQuizConfig } from "@/context/QuizConfigContext";
import { useQuizTimer } from "@/context/QuizTimerContext";
import { getQuestions } from "@/lib/firestore/questions";
import { Question } from "@/types/firestore";
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
    setPlayedQuestions,
    resetQuiz,
  } = useQuiz();

  const { timeLeft, setTimeLeft, resetTimer } = useQuizTimer();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      if (!config.chapterId) {
        router.replace("/dashboard");
        return;
      }
      const quizId = `${config.chapterId}_quiz`;
      const data = await getQuestions(quizId);
      setQuestions(data);
      // questions গুলো context-এ persist করো যাতে review page re-fetch না করে
      setPlayedQuestions(data);
      resetTimer((config.timeLimit || 10) * 60);
      setLoading(false);
    }
    loadQuestions();
  }, [config.chapterId, config.timeLimit, router, resetTimer, setPlayedQuestions]);

  const totalQuestions = Math.min(
    config.questionCount || 10,
    questions.length > 0 ? questions.length : config.questionCount || 10
  );

  const handleFinish = useCallback(async () => {
    let score = 0;
    questions.slice(0, totalQuestions).forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    const correct = score;
    const wrong = Math.max(0, totalQuestions - correct);

    if (session?.user?.email) {
      const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);
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
        point: score * 10,
      });
    }

    resetQuiz();
    router.push(
      `/quiz/result?score=${score}&correct=${correct}&wrong=${wrong}&total=${totalQuestions}`
    );
  }, [answers, questions, totalQuestions, session, config, resetQuiz, router]);

  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, setTimeLeft]);

  useEffect(() => {
    if (!loading && timeLeft <= 0) {
      handleFinish();
    }
  }, [loading, timeLeft, handleFinish]);

  const current = questions[currentQuestion - 1] || {
    id: `q_${currentQuestion}`,
    question: `প্রশ্ন ${currentQuestion}: বাংলাদেশের জাতীয় ফলের নাম কি?`,
    options: ["আম", "কাঠাল", "লিচু", "কলা"],
    correctAnswer: 1,
  };

  function handleAnswerSelect(answerIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: answerIndex,
    }));
  }

  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.max(0, timeLeft) % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="h-screen font-sans flex flex-col relative overflow-hidden bg-slate-50 selection:bg-teal-500 selection:text-white">
      {/* AMBIENT GLOW BACKGROUND */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-ambient-float" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-4s" }} />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl pointer-events-none animate-ambient-float" style={{ animationDelay: "-2s" }} />

      <div className="mx-auto w-full max-w-sm flex flex-col flex-1 min-h-0 relative z-10">

        {/* TOP HEADER */}
        <QuizHeader
          subject={config.chapterId ? `অধ্যায়: ${config.chapterId}` : "অনুশীলনী কুইজ"}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          timeLeft={formattedTime}
          onExit={() => setShowExitModal(true)}
        />

        {/* PROGRESS BAR */}
        <QuizProgress currentQuestion={currentQuestion} totalQuestions={totalQuestions} />

        {/* MAIN QUESTION & CONTROLS */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-teal-600">
            <Loader2 width={28} height={28} className="animate-spin" />
            <p className="text-xs font-bold text-slate-600">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-4 no-scrollbar flex flex-col justify-between">
            <QuestionCard
              question={current}
              selectedAnswer={answers[current.id]}
              onAnswerSelect={handleAnswerSelect}
            />

            <QuizNavigation
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              onPrevious={() => setCurrentQuestion((prev) => Math.max(prev - 1, 1))}
              onNext={() => setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions))}
              onFinish={handleFinish}
            />
          </div>
        )}
      </div>

      {/* EXIT CONFIRMATION MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4 shadow-2xl text-center border border-slate-200">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert width={24} height={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">কুইজ থেকে বের হতে চাও?</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                এখন বের হলে তোমার অর্জিত অগ্রগতি মুছে যাবে!
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200"
              >
                পড়া চালিয়ে যাও
              </button>
              <button
                onClick={() => {
                  resetQuiz();
                  router.push("/dashboard");
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-md hover:bg-rose-500"
              >
                হ্যাঁ, বের হও
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}