"use client";

import { Users, CheckCircle2, Trophy, BookOpenCheck } from "lucide-react";

const stats = [
  { label: "শিক্ষার্থী", value: "১০,০০০+", icon: Users, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  { label: "সম্পন্ন কুইজ", value: "৫০,০০০+", icon: BookOpenCheck, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { label: "চ্যাম্পিয়নশিপ বিজয়ী", value: "১,২৫০+", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { label: "সন্তুষ্টির হার", value: "৯৮%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
];

export default function Stats() {
  return (
    <section id="stats" className="py-10 bg-white font-sans border-y border-slate-200/60">
      <div className="mx-auto max-w-5xl px-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-3xl p-3.5 bg-slate-50/80 border border-slate-200/80 flex flex-col items-center text-center shadow-2xs"
              >
                <div className={`h-10 w-10 rounded-2xl ${item.bg} flex items-center justify-center mb-2 border shadow-2xs`}>
                  <Icon width={20} height={20} className={item.color} />
                </div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {item.value}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
