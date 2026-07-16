"use client";

interface TimeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const timeOptions = [10, 20, 30, 45, 60];

export default function TimeSelector({
  value,
  onChange,
}: TimeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Time Limit
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Select the maximum time for this quiz.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {timeOptions.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => onChange(time)}
            className={`rounded-2xl border p-4 text-center font-semibold transition-all duration-200 ${
              value === time
                ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            {time} min
          </button>
        ))}
      </div>
    </div>
  );
}