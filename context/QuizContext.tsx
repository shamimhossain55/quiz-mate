"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Question } from "@/types/firestore";

interface QuizContextType {
  currentQuestion: number;
  setCurrentQuestion: React.Dispatch<
    React.SetStateAction<number>
  >;

  answers: Record<string, number>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;

  // Quiz-এ যে প্রশ্নগুলো ছিল সেগুলো store করো
  // যাতে review page-এ আর Firestore থেকে re-fetch না করতে হয়
  playedQuestions: Question[];
  setPlayedQuestions: React.Dispatch<
    React.SetStateAction<Question[]>
  >;

  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | null>(
  null
);

interface QuizProviderProps {
  children: ReactNode;
}

export function QuizProvider({
  children,
}: QuizProviderProps) {
  const [currentQuestion, setCurrentQuestion] =
    useState(1);

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [playedQuestions, setPlayedQuestions] = useState<
    Question[]
  >([]);

  function resetQuiz() {
    setCurrentQuestion(1);
    setAnswers({});
    setPlayedQuestions([]);
  }

  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        setCurrentQuestion,
        answers,
        setAnswers,
        playedQuestions,
        setPlayedQuestions,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error(
      "useQuiz must be used inside QuizProvider"
    );
  }

  return context;
}