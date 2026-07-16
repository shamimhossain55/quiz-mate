"use client";

import { CheckCircle2, Target } from "lucide-react";

export default function DailyGoalCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Daily Goal
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete today's learning target.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
          <Target className="text-green-600" size={28} />
        </div>

      </div>

      <div className="mt-8">

        <div className="flex items-center justify-between">

          <span className="text-slate-600">
            Quiz Completed
          </span>

          <span className="font-bold text-slate-900">
            5 / 8
          </span>

        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-green-50 p-4">

        <div className="flex items-center gap-3">

          <CheckCircle2
            className="text-green-600"
            size={24}
          />

          <div>

            <p className="font-semibold text-slate-800">
              Great Progress!
            </p>

            <p className="text-sm text-slate-500">
              Only 3 quizzes left to reach today's goal.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}