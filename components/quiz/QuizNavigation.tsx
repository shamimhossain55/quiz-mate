"use client";

import Button from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function QuizNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onFinish,
}: QuizNavigationProps) {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="flex items-center justify-between">

      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        <ArrowLeft size={18} />

        Previous
      </Button>

      {isLastQuestion ? (
        <Button onClick={onFinish}>
          <Flag size={18} />

          Finish Quiz
        </Button>
      ) : (
        <Button onClick={onNext}>
          Next

          <ArrowRight size={18} />
        </Button>
      )}

    </div>
  );
}