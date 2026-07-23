"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface QuizConfig {
  chapterId: string;
  questionCount: number;
  timeLimit: number;
  negativeMarking: boolean;
}

interface QuizConfigContextType {
  config: QuizConfig;

  setConfig: React.Dispatch<
    React.SetStateAction<QuizConfig>
  >;

  resetConfig: () => void;
}

const defaultConfig: QuizConfig = {
  chapterId: "",
  questionCount: 20,
  timeLimit: 20,
  negativeMarking: false,
};

const QuizConfigContext =
  createContext<QuizConfigContextType | null>(null);

interface QuizConfigProviderProps {
  children: ReactNode;
}

export function QuizConfigProvider({
  children,
}: QuizConfigProviderProps) {
  const [config, setConfig] =
    useState<QuizConfig>(defaultConfig);

  function resetConfig() {
    setConfig(defaultConfig);
  }

  return (
    <QuizConfigContext.Provider
      value={{
        config,
        setConfig,
        resetConfig,
      }}
    >
      {children}
    </QuizConfigContext.Provider>
  );
}

export function useQuizConfig() {
  const context = useContext(QuizConfigContext);

  if (!context) {
    throw new Error(
      "useQuizConfig must be used inside QuizConfigProvider"
    );
  }

  return context;
}