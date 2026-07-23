interface ScoreCircleProps {
  percentage: number;
}

export default function ScoreCircle({
  percentage,
}: ScoreCircleProps) {
  return (
    <div className="flex justify-center">
      <div className="relative flex h-60 w-60 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-2xl">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
          <span className="text-6xl font-black text-slate-900">
            {percentage}%
          </span>

          <span className="mt-2 text-lg text-slate-500">
            Score
          </span>
        </div>
      </div>
    </div>
  );
}