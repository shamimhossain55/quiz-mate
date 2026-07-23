"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface QuizTimerContextType {
  timeLeft: number;

  setTimeLeft: React.Dispatch<
    React.SetStateAction<number>
  >;

  resetTimer: (seconds: number) => void;
}

const QuizTimerContext =
  createContext<QuizTimerContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function QuizTimerProvider({
  children,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(0);

  function resetTimer(seconds: number) {
    setTimeLeft(seconds);
  }

  return (
    <QuizTimerContext.Provider
      value={{
        timeLeft,
        setTimeLeft,
        resetTimer,
      }}
    >
      {children}
    </QuizTimerContext.Provider>
  );
}

export function useQuizTimer() {
  const context = useContext(QuizTimerContext);

  if (!context) {
    throw new Error(
      "useQuizTimer must be used inside QuizTimerProvider"
    );
  }

  return context;
}