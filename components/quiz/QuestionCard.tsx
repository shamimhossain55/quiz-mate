"use client";

import Card from "@/components/ui/Card";
import AnswerOption from "./AnswerOption";

import { Question } from "@/types/firestore";

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number;
  onAnswerSelect: (answerIndex: number) => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
}: QuestionCardProps) {
  return (
    <Card className="p-8">
      <div className="mb-8">
        <span className="text-sm font-semibold text-blue-600">
          Question
        </span>

        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          {question.question}
        </h2>
      </div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            selected={selectedAnswer === index}
            onClick={() => onAnswerSelect(index)}
          />
        ))}
      </div>
    </Card>
  );
}