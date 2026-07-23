import Card from "@/components/ui/Card";
import { CheckCircle2, XCircle, Trophy, BookOpen } from "lucide-react";

interface ResultStatsProps {
  score: number;
  correct: number;
  wrong: number;
  total: number;
}

export default function ResultStats({
  score,
  correct,
  wrong,
  total,
}: ResultStatsProps) {
  return (
    <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Score */}
        <div className="flex items-center gap-4">
          <Trophy
            className="text-yellow-500"
            width={38} height={38}
          />

          <div>
            <p className="text-sm font-medium text-slate-500">
              Score
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-slate-900">
              {score} / {total}
            </h3>
          </div>
        </div>

        {/* Correct */}
        <div className="flex items-center gap-4">
          <CheckCircle2
            className="text-green-500"
            width={38} height={38}
          />

          <div>
            <p className="text-sm font-medium text-slate-500">
              Correct
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-green-600">
              {correct}
            </h3>
          </div>
        </div>

        {/* Wrong */}
        <div className="flex items-center gap-4">
          <XCircle
            className="text-red-500"
            width={38} height={38}
          />

          <div>
            <p className="text-sm font-medium text-slate-500">
              Wrong
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-red-600">
              {wrong}
            </h3>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center gap-4">
          <BookOpen
            className="text-blue-500"
            width={38} height={38}
          />

          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Questions
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-blue-600">
              {total}
            </h3>
          </div>
        </div>
      </div>
    </Card>
  );
}