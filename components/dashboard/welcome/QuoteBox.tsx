import { Flame } from "lucide-react";

export default function QuoteBox() {
  return (
    <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">

      <div className="flex items-center gap-2">

        <Flame className="text-orange-300" size={20} />

        <span className="text-sm font-semibold uppercase tracking-wider text-orange-200">
          Today's Motivation
        </span>

      </div>

      <h3 className="mt-4 text-xl font-bold leading-8 text-white">
        "আজকের পরিশ্রমই আগামী দিনের সাফল্য তৈরি করে।"
      </h3>

      <p className="mt-3 text-white/70">
        প্রতিদিন অল্প অল্প করে এগিয়ে যাও। ধারাবাহিকতা একদিন তোমাকে
        সবার থেকে এগিয়ে নিয়ে যাবে।
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm text-white/80">

        <Flame size={18} className="text-orange-300" />

        <span>
          You're on a <strong>7 Day Streak</strong>. Keep it going! 🚀
        </span>

      </div>

    </div>
  );
}