interface ReviewHeaderProps {
  total: number;
  correct: number;
  wrong: number;
}

export default function ReviewHeader({
  total,
  correct,
  wrong,
}: ReviewHeaderProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl">
        📖
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900">
        Review Answers
      </h1>

      <p className="mt-3 text-slate-500">
        Check your answers and learn from your mistakes.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-blue-50 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <h3 className="text-2xl font-bold text-blue-600">{total}</h3>
        </div>

        <div className="rounded-2xl bg-green-50 p-4">
          <p className="text-sm text-slate-500">Correct</p>
          <h3 className="text-2xl font-bold text-green-600">{correct}</h3>
        </div>

        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-sm text-slate-500">Wrong</p>
          <h3 className="text-2xl font-bold text-red-600">{wrong}</h3>
        </div>
      </div>
    </div>
  );
}