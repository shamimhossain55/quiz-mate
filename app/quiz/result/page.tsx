import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

import ResultHero from "@/components/result/ResultHero";
import ScoreCircle from "@/components/result/ScoreCircle";
import ResultStats from "@/components/result/ResultStats";
import PerformanceBadge from "@/components/result/PerformanceBadge";
import ResultActions from "@/components/result/ResultActions";

interface ResultPageProps {
  searchParams: Promise<{
    score?: string;
    correct?: string;
    wrong?: string;
    total?: string;
  }>;
}

export default async function ResultPage({
  searchParams,
}: ResultPageProps) {
  const params = await searchParams;

  const score = Number(params.score ?? 0);
  const correct = Number(params.correct ?? 0);
  const wrong = Number(params.wrong ?? 0);
  const total = Number(params.total ?? 0);

  const percentage =
    total === 0
      ? 0
      : Math.round((score / total) * 100);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div
          className="
            rounded-[32px]
            border
            border-slate-200
            bg-gradient-to-br
            from-white
            via-slate-50
            to-blue-50
            p-8
            shadow-2xl
            md:p-12
          "
        >
          <div className="space-y-12">

            <ResultHero percentage={percentage} />

            <ScoreCircle percentage={percentage} />

            <PerformanceBadge percentage={percentage} />

            <ResultStats
              score={score}
              correct={correct}
              wrong={wrong}
              total={total}
            />

            <ResultActions />

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}