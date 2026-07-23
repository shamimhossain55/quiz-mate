import Card from "@/components/ui/Card";
import { BookOpen } from "lucide-react";

interface SubjectHeaderProps {
  subjectName: string;
  totalChapters: number;
  totalQuestions: number;
  progress: number;
}

export default function SubjectHeader({
  subjectName,
  totalChapters,
  totalQuestions,
  progress,
}: SubjectHeaderProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div>

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <BookOpen width={30} height={30} />
            </div>

            <div>

              <p className="text-sm text-blue-100">
                Subject
              </p>

              <h1 className="text-4xl font-bold">
                {subjectName}
              </h1>

            </div>

          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-blue-100">

            <span>
              📚 {totalChapters} Chapters
            </span>

            <span>
              📝 {totalQuestions} Questions
            </span>

          </div>

        </div>

        <div className="w-full max-w-xs">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-sm">
              Overall Progress
            </span>

            <span className="font-semibold">
              {progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/20">

            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

          </div>

        </div>

      </div>

    </Card>
  );
}