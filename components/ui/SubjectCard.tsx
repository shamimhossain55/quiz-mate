import Link from "next/link";
import { LucideIcon } from "lucide-react";

type SubjectCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
};

export default function SubjectCard({
  title,
  description,
  icon: Icon,
  href,
}: SubjectCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
        <Icon width={28} height={28} />
      </div>

      <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 font-semibold text-blue-600">
        Explore →
      </div>
    </Link>
  );
}