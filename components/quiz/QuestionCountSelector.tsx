"use client";

interface QuestionCountSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const questionCounts = [10, 20, 30, 50];

export default function QuestionCountSelector({
  value,
  onChange,
}: QuestionCountSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Number of Questions
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Choose how many questions you want in this quiz.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {questionCounts.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={`rounded-2xl border p-4 text-center font-semibold transition-all duration-200 ${
              value === count
                ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}