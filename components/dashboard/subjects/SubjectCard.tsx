import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { ChevronRight } from "lucide-react";

import { FirestoreSubject } from "@/types/firestore";

type SubjectCardData = FirestoreSubject & {
  iconComponent: React.ElementType;
};

interface SubjectCardProps {
  subject: SubjectCardData;
  onClick?: () => void;
}

export default function SubjectCard({
  subject,
  onClick,
}: SubjectCardProps) {
  const Icon = subject.iconComponent;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left"
    >
      <Card
        className="
          h-full
          p-4 sm:p-6
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-blue-300
          hover:shadow-xl
        "
      >
        <div className="flex items-start justify-between">
          <div
            className="
              flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center
              rounded-2xl
              bg-slate-100
            "
          >
            <Icon
              width={28} height={28}
              className="text-blue-600"
            />
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

        <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-slate-900">
          {subject.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {subject.classId.toUpperCase()}
        </p>

        <div className="mt-4 sm:mt-6 flex items-center justify-between">
          <Badge variant="secondary">
            Subject
          </Badge>

          <span className="text-sm font-medium text-blue-600">
            Explore
          </span>
        </div>
      </Card>
    </button>
  );
}