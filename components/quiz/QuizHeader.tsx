import Card from "@/components/ui/Card";
import { Clock3, BookOpen } from "lucide-react";

interface QuizHeaderProps {
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: string;
}

export default function QuizHeader({
  subject,
  currentQuestion,
  totalQuestions,
  timeLeft,
}: QuizHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Left */}
        <div>
          <div className="flex items-center gap-2 text-blue-600">
            <BookOpen width={18} height={18} />

            <span className="font-semibold">
              {subject}
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Question {currentQuestion} of {totalQuestions}
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-3">
          <Clock3
            width={22} height={22}
            className="text-red-500"
          />

          <span className="text-lg font-bold text-red-600">
            {timeLeft}
          </span>
        </div>

      </div>
    </Card>
  );
}