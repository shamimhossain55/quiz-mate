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
          p-4 sm:p-5
          hover:border-blue-300
          hover:bg-blue-50/40
        "
      >
        <div className="flex items-start justify-between">

          <div
            className="
              flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center
              rounded-2xl bg-slate-100
            "
          >
            <Icon className={iconColor} width={24} height={24} />
          </div>

          <ChevronRight
            width={20} height={20}
            className="
              text-slate-400
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:text-blue-600
            "
          />
        </div>

        <h3 className="mt-3 sm:mt-5 text-base sm:text-lg font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </Card>
    </button>
  );
}