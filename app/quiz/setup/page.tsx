import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import QuizSetupCard from "@/components/quiz/QuizSetupCard";

interface QuizSetupPageProps {
  searchParams: Promise<{
    chapter?: string;
  }>;
}

export default async function QuizSetupPage({
  searchParams,
}: QuizSetupPageProps) {
  const { chapter } = await searchParams;

  if (!chapter) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Chapter not found
          </h1>

          <p className="mt-3 text-slate-600">
            Please select a chapter first.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <QuizSetupCard chapterId={chapter} />
    </DashboardLayout>
  );
}