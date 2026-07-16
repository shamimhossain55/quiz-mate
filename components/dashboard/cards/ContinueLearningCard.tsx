"use client";

import { ArrowRight, BookOpen } from "lucide-react";

export default function ContinueLearningCard() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Continue Learning
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Continue your last unfinished chapter.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-100 p-3">
          <BookOpen className="text-blue-600" size={24} />
        </div>

      </div>

      <div className="mt-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Mathematics
            </p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Algebra
            </h3>

          </div>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
            Chapter 5
          </span>

        </div>

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm">

            <span className="text-slate-500">
              Progress
            </span>

            <span className="font-semibold text-slate-700">
              72%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">

            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>

          </div>

        </div>

        <button className="mt-8 flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">

          Continue Learning

          <ArrowRight size={18} />

        </button>

      </div>

    </section>
  );
}