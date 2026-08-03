"use client";

import { SessionProvider } from "next-auth/react";

import { QuizProvider } from "@/context/QuizContext";
import { QuizConfigProvider } from "@/context/QuizConfigContext";
import { QuizSessionProvider } from "@/context/QuizSessionContext";
import { QuizTimerProvider } from "@/context/QuizTimerContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FriendNotifProvider } from "@/context/FriendNotifContext";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <FriendNotifProvider>
        <LanguageProvider>
          <QuizConfigProvider>
            <QuizSessionProvider>
              <QuizProvider>
                <QuizTimerProvider>
                  {children}
                </QuizTimerProvider>
              </QuizProvider>
            </QuizSessionProvider>
          </QuizConfigProvider>
        </LanguageProvider>
      </FriendNotifProvider>
    </SessionProvider>
  );
}