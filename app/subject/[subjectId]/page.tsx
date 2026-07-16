import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import SubjectHeader from "@/components/subject/SubjectHeader";
import ContinueLearningBanner from "@/components/subject/ContinueLearningBanner";
import ChapterGrid from "@/components/subject/ChapterGrid";

interface SubjectPageProps {
  params: Promise<{
    subjectId: string;
  }>;
}

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { subjectId } = await params;

  // Dummy Data (Later this will come from Firebase)
  const subject = {
    id: subjectId,
    name:
      subjectId.charAt(0).toUpperCase() +
      subjectId.slice(1),
    totalChapters: 22,
    totalQuestions: 450,
    progress: 42,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        <SubjectHeader
          subjectName={subject.name}
          totalChapters={subject.totalChapters}
          totalQuestions={subject.totalQuestions}
          progress={subject.progress}
        />

        <ContinueLearningBanner
          chapterTitle="Chapter 5 • Quadratic Equation"
          progress={65}
          estimatedTime="12 min"
        />

        <section>

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-slate-900">
              All Chapters
            </h2>

            <p className="mt-2 text-slate-500">
              Select any chapter to start or continue practicing.
            </p>

          </div>

          <ChapterGrid />

        </section>

      </div>
    </DashboardLayout>
  );
}