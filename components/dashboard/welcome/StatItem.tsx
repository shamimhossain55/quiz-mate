import Card from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface StatItemProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatItem({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
}: StatItemProps) {
  return (
    <Card className="border-white/15 bg-white/10 p-5 backdrop-blur-md hover:bg-white/15">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <Icon className={iconColor} width={24} height={24} />
        </div>
      </div>
    </Card>
  );
}