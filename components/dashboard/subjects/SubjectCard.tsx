import { ChevronRight, BookOpen, Zap } from "lucide-react";
import { FirestoreSubject } from "@/types/firestore";

type SubjectCardData = FirestoreSubject & {
  iconComponent: React.ElementType;
  chaptersCount?: number;
  completedChapters?: number;
};

interface SubjectCardProps {
  subject: SubjectCardData;
  onClick?: () => void;
}

export default function SubjectCard({
  subject,
  onClick,
}: SubjectCardProps) {
  const Icon = subject.iconComponent || BookOpen;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left focus:outline-none"
    >
      <div
        className="
          relative
          rounded-3xl
          p-5
          bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950
          border border-slate-700/60
          shadow-xl
          hover:shadow-2xl
          hover:border-teal-500/50
          transition-all
          duration-300
          hover:-translate-y-1.5
          overflow-hidden
        "
      >
        {/* Subject Cover Image if set by admin */}
        {subject.imageUrl ? (
          <div className="absolute inset-0 z-0">
            <img
              src={subject.imageUrl}
              alt={subject.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          </div>
        ) : null}

        {/* Ambient Glow Orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/25 transition-all z-10" />

        {/* Top bar: Icon & Arrow */}
        <div className="flex items-start justify-between relative z-10">
          <div
            className="
              flex h-12 w-12 items-center justify-center
              rounded-2xl
              bg-gradient-to-tr from-teal-500 to-emerald-400
              text-white
              shadow-lg shadow-teal-500/30
              group-hover:scale-110
              transition-transform
            "
          >
            <Icon width={24} height={24} />
          </div>

          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-400 transition-all">
            <ChevronRight
              width={18} height={18}
              className="
                text-slate-400
                group-hover:text-white
                group-hover:translate-x-0.5
                transition-all
              "
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-md border border-teal-800/50">
            {subject.classId?.toUpperCase() || "CLASS 6"}
          </span>

          <h3 className="mt-2 text-lg font-black text-white group-hover:text-teal-300 transition-colors">
            {subject.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400 font-medium line-clamp-1">
            অধ্যায় অনুশীলনী ও বিষয়ভিত্তিক প্রস্তুতি
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between relative z-10">
          {subject.chaptersCount !== undefined && subject.chaptersCount > 0 ? (
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
              <BookOpen width={12} height={12} />
              {subject.completedChapters || 0}/{subject.chaptersCount} অধ্যায়
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Zap width={12} height={12} className="text-amber-400 fill-amber-400" />
              অনুশীলন শুরু করো
            </span>
          )}

          <span className="text-xs font-extrabold text-teal-400 group-hover:underline">
            এক্সপ্লোর →
          </span>
        </div>
      </div>
    </button>
  );
}