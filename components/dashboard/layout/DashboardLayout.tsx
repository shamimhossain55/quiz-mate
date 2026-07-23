import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "@/components/layout/BottomNav";

type DashboardLayoutProps = {
  children: ReactNode;
  activeTab?: string;
};

export default function DashboardLayout({
  children,
  activeTab = "home",
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="lg:ml-72">
        <Topbar />

        {/* pb-20 so content doesn't hide behind BottomNav on mobile */}
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation — hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav activeTab={activeTab} />
      </div>
    </div>
  );
}