import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Sparkles, Play } from "lucide-react";

export default function WelcomeHeader() {
  return (
    <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

      <div>

        <Badge className="mb-5 bg-white/15 text-white border-white/20">
          <Sparkles size={14} />
          Level 12
        </Badge>

        <p className="text-white/80 text-lg">
          👋 Welcome Back
        </p>

        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
          Shamim
        </h1>

        <p className="mt-5 max-w-xl text-white/80 leading-7">
          আজকের প্রতিটি ছোট পদক্ষেপ তোমাকে তোমার লক্ষ্যের আরও
          কাছে নিয়ে যাবে।
        </p>

      </div>

      <Button
        className="
          bg-white
          text-blue-700
          hover:bg-slate-100
          px-8
          py-4
          rounded-2xl
        "
      >
        <Play size={18} />
        Start Quiz
      </Button>

    </div>
  );
}