import Card from "@/components/ui/Card";

import WelcomeHeader from "../welcome/WelcomeHeader";
import QuoteBox from "../welcome/QuoteBox";
import StatsGrid from "../welcome/StatsGrid";

interface WelcomeCardProps {
  userName?: string;
}

export default function WelcomeCard({
  userName = "Shamim",
}: WelcomeCardProps) {
  return (
    <Card
      className="
        overflow-hidden
        border-0
        bg-gradient-to-r
        from-blue-600
        via-indigo-600
        to-purple-600
        p-8
        text-white
        relative
      "
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative z-10">

        <WelcomeHeader />

        <QuoteBox />

        <StatsGrid />

      </div>
    </Card>
  );
}