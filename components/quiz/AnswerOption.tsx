"use client";

import { CheckCircle2 } from "lucide-react";

interface AnswerOptionProps {
  text: string;
  selected: boolean;
  onClick: () => void;
}

export default function AnswerOption({
  text,
  selected,
  onClick,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center justify-between
        rounded-2xl border p-5 text-left
        transition-all duration-200
        ${
          selected
            ? "border-blue-600 bg-blue-50 shadow-md"
            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
        }
      `}
    >
      <span className="text-base font-medium text-slate-800">
        {text}
      </span>

      {selected && (
        <CheckCircle2
          width={22} height={22}
          className="text-blue-600"
        />
      )}
    </button>
  );
}