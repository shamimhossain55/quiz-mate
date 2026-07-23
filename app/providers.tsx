"use client";

import { SessionProvider } from "next-auth/react";

import { QuizProvider } from "@/context/QuizContext";
import { QuizConfigProvider } from "@/context/QuizConfigContext";
import { QuizSessionProvider } from "@/context/QuizSessionContext";
import { QuizTimerProvider } from "@/context/QuizTimerContext";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <QuizConfigProvider>
        <QuizSessionProvider>
          <QuizProvider>
            <QuizTimerProvider>
              {children}
            </QuizTimerProvider>
          </QuizProvider>
        </QuizSessionProvider>
      </QuizConfigProvider>
    </SessionProvider>
  );
}