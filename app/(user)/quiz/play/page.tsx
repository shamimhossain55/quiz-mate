"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getQuizById } from "@/lib/firestore/quizzes";
import { Question } from "@/types/firestore";
import { saveResult } from "@/lib/quiz/saveResult";
import { updateStudentStats } from "@/lib/firestore/student";
import { shuffleArray } from "@/lib/utils";

function QuizPlayContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuizId = searchParams.get("quizId");
  const isLiveMode = searchParams.get("mode") === "live";

  const { config, setConfig } = useQuizConfig();

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
  const [activeQuizId, setActiveQuizId] = useState<string>(urlQuizId || "");
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>("");

  useEffect(() => {
    async function loadQuizData() {
      setLoading(true);

      // 1. Check if quizId is provided via URL (e.g. Live Exam or Direct Quiz Link)
      if (urlQuizId) {
        try {
          const quizDoc = await getQuizById(urlQuizId);
          if (quizDoc) {
            setActiveQuizId(quizDoc.id);
            setActiveQuizTitle(quizDoc.title || quizDoc.name || "লাইভ কুইজ");

            let loadedQuestions: Question[] = [];

            // If quiz has embedded JSON questions
            if (quizDoc.questions && Array.isArray(quizDoc.questions) && quizDoc.questions.length > 0) {
              loadedQuestions = quizDoc.questions.map((q, idx) => ({
                id: q.id || `live_q_${idx + 1}`,
                chapterId: quizDoc.chapterId || quizDoc.id,
                quizId: quizDoc.id,
                classId: quizDoc.classId,
                subjectId: quizDoc.subjectId,
                question: q.questionText || q.question || `প্রশ্ন ${idx + 1}`,
                options: q.options || ["", "", "", ""],
                correctAnswer: q.correctAnswer ?? 0,
                explanation: q.explanation || "",
                order: idx + 1,
              }));
            } else {
              // Fallback to questions collection
              loadedQuestions = await getQuestions(quizDoc.chapterId || quizDoc.id, quizDoc.subjectId);
            }

            if (loadedQuestions.length === 0) {
              // No questions found
              alert("এই কুইজে এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।");
              router.replace("/dashboard");
              return;
            }

            // Calculate duration
            let timeInSeconds = (quizDoc.duration || 10) * 60;
            if (quizDoc.endTime) {
              const diffSec = Math.floor((new Date(quizDoc.endTime).getTime() - Date.now()) / 1000);
              if (diffSec > 0) {
                timeInSeconds = Math.min(timeInSeconds, diffSec);
              }
            }

            // Update config context
            setConfig({
              chapterId: quizDoc.chapterId || quizDoc.id,
              subjectId: quizDoc.subjectId || "",
              questionCount: loadedQuestions.length,
              timeLimit: Math.max(1, Math.ceil(timeInSeconds / 60)),
              negativeMarking: !!quizDoc.negativeMarking,
            });

            setQuestions(loadedQuestions);
            setPlayedQuestions(loadedQuestions);
            resetTimer(timeInSeconds);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error loading quiz by id:", e);
        }
      }

      // 2. Standard chapter-based quiz flow
      if (!config.chapterId) {
        router.replace("/dashboard");
        return;
      }

      const data = await getQuestions(config.chapterId, config.subjectId);
      const shuffled = shuffleArray(data);
      const selected = config.questionCount ? shuffled.slice(0, config.questionCount) : shuffled;

      if (selected.length === 0) {
        alert("এই অধ্যায়ে এখনো কোনো প্রশ্ন পাওয়া যায়নি।");
        router.replace("/dashboard");
        return;
      }

      setQuestions(selected);
      setPlayedQuestions(selected);
      resetTimer((config.timeLimit || 10) * 60);
      setLoading(false);
    }

    loadQuizData();
  }, [urlQuizId, config.chapterId, config.subjectId, config.timeLimit, config.questionCount, router, resetTimer, setPlayedQuestions, setConfig]);

  const totalQuestions = questions.length > 0
    ? questions.length
    : config.questionCount || 10;

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
      const finalQuizId = activeQuizId || `${config.chapterId}_quiz`;

      await saveResult({
        userId: session.user.email,
        quizId: finalQuizId,
        chapterId: config.chapterId || activeQuizId,
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

    router.push(
      `/quiz/result?score=${score}&correct=${correct}&wrong=${wrong}&total=${totalQuestions}`
    );
  }, [answers, questions, totalQuestions, session, config, router, activeQuizId]);

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
    } , 1000);

    return () => clearInterval(timer);
  }, [loading, setTimeLeft]);

  useEffect(() => {
    if (!loading && timeLeft <= 0) {
      handleFinish();
    }
  }, [loading, timeLeft, handleFinish]);

  const current = questions[currentQuestion - 1] || {
    id: `q_${currentQuestion}`,
    question: `প্রশ্ন ${currentQuestion}`,
    options: ["", "", "", ""],
    correctAnswer: 0,
  };

  const handleSelectAnswer = (index: number) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: index,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    resetQuiz();
    setShowExitModal(false);
    router.replace("/dashboard");
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600">কুইজের প্রশ্ন প্রস্তুত হচ্ছে...</p>
        {activeQuizTitle && <p className="text-[11px] text-teal-600 font-semibold mt-1">{activeQuizTitle}</p>}
      </div>
    );
  }

  return (
    <div className="h-screen font-sans flex flex-col bg-slate-50 select-none overflow-hidden">
      {/* 1. Header */}
      <QuizHeader
        subject={activeQuizTitle || config.subjectId || "কুইজ"}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        timeLeft={`${Math.floor(timeLeft / 60)
          .toString()
          .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`}
        onExit={handleExitClick}
      />

      {/* 2. Scrollable Body: Progress + Question */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-start">
        {isLiveMode && (
          <div className="mb-2 flex items-center justify-between bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-[11px] font-black text-rose-700">🔴 লাইভ এক্সাম চলছে</span>
            </div>
            {activeQuizTitle && (
              <span className="text-[10.5px] font-extrabold text-slate-700 truncate max-w-[180px]">
                {activeQuizTitle}
              </span>
            )}
          </div>
        )}

        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          answers={answers}
          questions={questions}
          onSelectQuestion={(idx) => setCurrentQuestion(idx + 1)}
        />

        <div className="mt-3">
          <QuestionCard
            question={current}
            selectedAnswer={answers[current.id]}
            onSelectAnswer={handleSelectAnswer}
            questionIndex={currentQuestion}
          />
        </div>
      </div>

      {/* 3. Footer Navigation */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 pb-6">
        <QuizNavigation
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          onPrev={handlePrev}
          onNext={handleNext}
          onFinish={handleFinish}
          hasSelectedAnswer={answers[current.id] !== undefined}
        />
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">
                কুইজ ছেড়ে যেতে চান?
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                এখন বের হয়ে গেলে বর্তমান অগ্রগতি মুছে যাবে এবং এই কুইজের কোনো পয়েন্ট যোগ হবে না।
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleCancelExit}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors"
              >
                থাকুন
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-500/25 transition-colors"
              >
                বের হন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      }
    >
      <QuizPlayContent />
    </Suspense>
  );
}