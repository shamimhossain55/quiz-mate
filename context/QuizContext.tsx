"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface QuizContextType {
  currentQuestion: number;
  setCurrentQuestion: React.Dispatch<
    React.SetStateAction<number>
  >;

  answers: Record<string, number>;
  setAnswers: React.Dispatch<
    React.SetStateAction<Record<string, number>>
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

  function resetQuiz() {
    setCurrentQuestion(1);
    setAnswers({});
  }

  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        setCurrentQuestion,
        answers,
        setAnswers,
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