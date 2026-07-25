"use client";

import { Zap, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-8 font-sans">
      <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 p-[1.5px]">
            <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center">
              <Zap width={12} height={12} className="text-teal-300 fill-teal-300" />
            </div>
          </div>
          <span className="text-sm font-black text-slate-900">QuizMate</span>
          <span className="text-xs text-slate-400 font-medium">© ২০২৬</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <a href="#features" className="hover:text-teal-700 transition-colors">ফিচারসমূহ</a>
          <a href="#subjects" className="hover:text-teal-700 transition-colors">বিষয়সমূহ</a>
          <a href="#stats" className="hover:text-teal-700 transition-colors">পরিসংখ্যান</a>
        </div>

        {/* Made with Love */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <span>তৈরি</span>
          <Heart width={12} height={12} className="text-rose-500 fill-rose-500" />
          <span>দিয়ে</span>
        </div>

      </div>
    </footer>
  );
}
