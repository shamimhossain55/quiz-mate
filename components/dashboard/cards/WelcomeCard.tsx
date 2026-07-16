"use client";

import { Flame, Star, Target, TrendingUp } from "lucide-react";

export default function WelcomeCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">

      {/* Background Glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative z-10">

        <p className="text-sm text-blue-100">
          👋 Welcome Back
        </p>

        <h1 className="mt-2 text-3xl font-bold lg:text-4xl">
          Shamim
        </h1>

        <p className="mt-3 max-w-xl text-blue-100">
          আজকের লক্ষ্য পূরণ করো, নতুন XP অর্জন করো এবং
          Leaderboard-এ নিজের অবস্থান আরও উপরে নিয়ে যাও।
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Flame className="mb-2 text-orange-300" />
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-blue-100">
              Day Streak
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Star className="mb-2 text-yellow-300" />
            <p className="text-2xl font-bold">1250</p>
            <p className="text-sm text-blue-100">
              XP Points
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Target className="mb-2 text-green-300" />
            <p className="text-2xl font-bold">5/8</p>
            <p className="text-sm text-blue-100">
              Daily Goal
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <TrendingUp className="mb-2 text-cyan-300" />
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-blue-100">
              Accuracy
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}