import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import SubjectHeader from "@/components/subject/SubjectHeader";
import ContinueLearningBanner from "@/components/subject/ContinueLearningBanner";
import ChapterGrid from "@/components/subject/ChapterGrid";

interface SubjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { slug } = await params;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SubjectHeader
          subjectName={slug}
          totalChapters={0}
          totalQuestions={0}
          progress={0}
        />

        <ContinueLearningBanner
          chapterTitle="Continue your learning"
          progress={0}
          estimatedTime="0 min"
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

          {/* এটা পরে Subject ID দিয়ে Connect করব */}
          <ChapterGrid subjectId={`class6_${slug}`} />
        </section>
      </div>
    </DashboardLayout>
  );
}