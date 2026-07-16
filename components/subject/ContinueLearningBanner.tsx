import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

interface ContinueLearningBannerProps {
  chapterTitle: string;
  progress: number;
  estimatedTime: string;
  onContinue?: () => void;
}

export default function ContinueLearningBanner({
  chapterTitle,
  progress,
  estimatedTime,
  onContinue,
}: ContinueLearningBannerProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="mb-3 inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            🔥 Continue Learning
          </div>

          <h2 className="text-3xl font-bold">
            {chapterTitle}
          </h2>

          <p className="mt-2 text-emerald-100">
            Continue from where you left off.
          </p>

          <div className="mt-6 flex flex-wrap gap-6 text-sm">

            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              <span>{progress}% Completed</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{estimatedTime} remaining</span>
            </div>

          </div>

        </div>

        <div className="w-full max-w-sm">

          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/20">

            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-white text-emerald-600 hover:bg-slate-100"
          >
            Continue Learning

            <ArrowRight size={18} />
          </Button>

        </div>

      </div>

    </Card>
  );
}