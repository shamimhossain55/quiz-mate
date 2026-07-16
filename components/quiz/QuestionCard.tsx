"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import AnswerOption from "./AnswerOption";

import { Question } from "./questions";

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({
  question,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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
            onClick={() => setSelectedAnswer(index)}
          />

        ))}

      </div>

    </Card>
  );
}