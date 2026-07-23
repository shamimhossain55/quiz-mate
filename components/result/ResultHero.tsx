interface ResultHeroProps {
  percentage: number;
}

export default function ResultHero({
  percentage,
}: ResultHeroProps) {
  let message = "Keep Practicing 🚀";

  if (percentage >= 90) {
    message = "Outstanding Performance! 🎉";
  } else if (percentage >= 75) {
    message = "Excellent Work! 🔥";
  } else if (percentage >= 60) {
    message = "Great Job! 👏";
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-5xl shadow-xl">
        🎉
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
        Quiz Completed
      </h1>

      <p className="mt-4 text-lg text-slate-500">
        {message}
      </p>
    </div>
  );
}