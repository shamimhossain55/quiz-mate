import {
  Flame,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

import StatItem from "./StatItem";

const stats = [
  {
    title: "Day Streak",
    value: "7",
    icon: Flame,
    color: "text-orange-300",
  },
  {
    title: "XP Points",
    value: "1250",
    icon: Star,
    color: "text-yellow-300",
  },
  {
    title: "Daily Goal",
    value: "5/8",
    icon: Target,
    color: "text-green-300",
  },
  {
    title: "Accuracy",
    value: "92%",
    icon: TrendingUp,
    color: "text-cyan-300",
  },
];

export default function StatsGrid() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatItem
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconColor={stat.color}
        />
      ))}
    </div>
  );
}