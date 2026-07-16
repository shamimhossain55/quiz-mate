import {
  PlayCircle,
  BookOpen,
  Trophy,
  Users,
} from "lucide-react";

import ActionButton from "./ActionButton";

const actions = [
  {
    title: "Start Quiz",
    description: "Begin a new custom quiz.",
    icon: PlayCircle,
    color: "text-blue-600",
  },
  {
    title: "Continue Learning",
    description: "Resume your previous chapter.",
    icon: BookOpen,
    color: "text-emerald-600",
  },
  {
    title: "Leaderboard",
    description: "See this week's top students.",
    icon: Trophy,
    color: "text-amber-500",
  },
  {
    title: "Challenge Friend",
    description: "Invite a friend to a 1v1 quiz.",
    icon: Users,
    color: "text-purple-600",
  },
];

export default function QuickActions() {
  return (
    <section className="mt-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-slate-500">
          Jump directly to your most-used features.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <ActionButton
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            iconColor={action.color}
          />
        ))}
      </div>
    </section>
  );
}