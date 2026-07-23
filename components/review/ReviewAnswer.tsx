interface ReviewAnswerProps {
  label: string;
  answer: string;
  isCorrect?: boolean;
}

export default function ReviewAnswer({
  label,
  answer,
  isCorrect,
}: ReviewAnswerProps) {
  return (
    <div className="rounded-2xl border p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <div
        className={`mt-3 rounded-xl p-4 font-semibold ${
          isCorrect === true
            ? "bg-green-50 text-green-700"
            : isCorrect === false
            ? "bg-red-50 text-red-700"
            : "bg-slate-50 text-slate-700"
        }`}
      >
        {answer}
      </div>
    </div>
  );
}