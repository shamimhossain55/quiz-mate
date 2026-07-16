import Card from "@/components/ui/Card";
import { ChevronRight, LucideIcon } from "lucide-react";

interface ActionButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export default function ActionButton({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group"
    >
      <Card
        className="
          h-full
          p-5
          hover:border-blue-300
          hover:bg-blue-50/40
        "
      >
        <div className="flex items-start justify-between">

          <div
            className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl bg-slate-100
            "
          >
            <Icon className={iconColor} size={24} />
          </div>

          <ChevronRight
            size={20}
            className="
              text-slate-400
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:text-blue-600
            "
          />
        </div>

        <h3 className="mt-5 text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </Card>
    </button>
  );
}