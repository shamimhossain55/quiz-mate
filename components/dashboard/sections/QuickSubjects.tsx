"use client";

import {
  BookOpen,
  ChevronRight,
  Calculator,
  Globe,
  Atom,
  FlaskConical,
  Leaf,
} from "lucide-react";

const subjects = [
  {
    name: "বাংলা",
    progress: 82,
    color: "bg-blue-500",
    icon: BookOpen,
  },
  {
    name: "English",
    progress: 74,
    color: "bg-green-500",
    icon: Globe,
  },
  {
    name: "Mathematics",
    progress: 65,
    color: "bg-purple-500",
    icon: Calculator,
  },
  {
    name: "Physics",
    progress: 53,
    color: "bg-orange-500",
    icon: Atom,
  },
  {
    name: "Chemistry",
    progress: 47,
    color: "bg-pink-500",
    icon: FlaskConical,
  },
  {
    name: "Biology",
    progress: 91,
    color: "bg-emerald-500",
    icon: Leaf,
  },
];

export default function QuickSubjects() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Quick Subjects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pick a subject and continue learning.
          </p>
        </div>

      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {subjects.map((subject) => {
          const Icon = subject.icon;

          return (
            <button
              key={subject.name}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${subject.color}`}
                >
                  <Icon width={22} height={22} />
                </div>

                <ChevronRight
                  width={20} height={20}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                {subject.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {subject.progress}% Completed
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

                <div
                  className={`h-full rounded-full ${subject.color}`}
                  style={{
                    width: `${subject.progress}%`,
                  }}
                />

              </div>

            </button>
          );
        })}

      </div>

    </section>
  );
}