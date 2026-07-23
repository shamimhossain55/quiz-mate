"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { QuizSession } from "@/types/quiz";

interface QuizSessionContextType {
  session: QuizSession | null;

  setSession: (
    session: QuizSession
  ) => void;

  clearSession: () => void;
}

const QuizSessionContext =
  createContext<QuizSessionContextType | null>(
    null
  );

export function QuizSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSessionState] =
    useState<QuizSession | null>(null);

  function setSession(
    data: QuizSession
  ) {
    setSessionState(data);
  }

  function clearSession() {
    setSessionState(null);
  }

  return (
    <QuizSessionContext.Provider
      value={{
        session,
        setSession,
        clearSession,
      }}
    >
      {children}
    </QuizSessionContext.Provider>
  );
}

export function useQuizSession() {
  const context = useContext(
    QuizSessionContext
  );

  if (!context) {
    throw new Error(
      "useQuizSession must be used inside QuizSessionProvider"
    );
  }

  return context;
}