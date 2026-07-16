import Card from "@/components/ui/Card";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-slate-700">
          Progress
        </span>

        <span className="text-sm font-semibold text-slate-600">
          {currentQuestion} / {totalQuestions}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}