"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface AnswerOptionProps {
  index: number;
  text: string;
  selected: boolean;
  onClick: () => void;
}

const optionLetters = ["A", "B", "C", "D", "E", "F"];

export default function AnswerOption({
  index,
  text,
  selected,
  onClick,
}: AnswerOptionProps) {
  const letter = optionLetters[index] || `${index + 1}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full relative flex items-center justify-between p-3.5 rounded-2xl text-left
        transition-all duration-300 border group active:scale-[0.99]
        ${
          selected
            ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500/80 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/20"
            : "bg-white border-slate-200/80 hover:border-teal-300 hover:bg-slate-50/80 shadow-2xs"
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Letter Badge (A, B, C, D) */}
        <div
          className={`
            h-8 w-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${
              selected
                ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30 scale-105"
                : "bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700"
            }
          `}
        >
          {letter}
        </div>

        <span className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
          selected ? "text-teal-900 font-extrabold" : "text-slate-700 group-hover:text-slate-900"
        }`}>
          {text}
        </span>
      </div>

      {/* Select indicator */}
      <div className="ml-2 flex-shrink-0">
        {selected ? (
          <CheckCircle2 width={18} height={18} className="text-teal-600 fill-teal-600 text-white" />
        ) : (
          <Circle width={18} height={18} className="text-slate-300 group-hover:text-slate-400" />
        )}
      </div>
    </button>
  );
}