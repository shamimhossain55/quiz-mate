"use client";

import AnswerOption from "./AnswerOption";
import { Question } from "@/types/firestore";
import { HelpCircle } from "lucide-react";

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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Subtle top decoration glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Question Text */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-1.5">
          <HelpCircle width={14} height={14} className="text-teal-600" />
          <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 uppercase tracking-wide">
            প্রশ্নপত্র
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
          {question.question}
        </h2>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 relative z-10 pt-1">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            index={index}
            text={option}
            selected={selectedAnswer === index}
            onClick={() => onAnswerSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}