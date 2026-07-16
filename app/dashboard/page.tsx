import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";

import WelcomeCard from "@/components/dashboard/cards/WelcomeCard";
import ContinueLearningCard from "@/components/dashboard/cards/ContinueLearningCard";
import DailyGoalCard from "@/components/dashboard/cards/DailyGoalCard";

import QuickActions from "@/components/dashboard/actions/QuickActions";
import SubjectSection from "@/components/dashboard/subjects/SubjectSection";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <WelcomeCard />

        {/* Continue Learning + Daily Goal */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ContinueLearningCard />
          <DailyGoalCard />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Subjects */}
        <SubjectSection />
      </div>
    </DashboardLayout>
  );
}