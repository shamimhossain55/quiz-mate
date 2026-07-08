// app/page.tsx
"use client"; // যেহেতু আমরা বাটন ক্লিক হ্যান্ডেল করছি, তাই এটি ক্লায়েন্ট কম্পোনেন্ট হতে হবে

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100 text-center">
        
        {/* অ্যাপের লোগো বা আইকন */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">Q</span>
        </div>

        {/* টেক্সট অংশ */}
        <h1 className="text-2xl font-bold text-slate-800 mb-2">স্বাগতম!</h1>
        <p className="text-slate-500 mb-8">আপনার কুইজ যাত্রা শুরু করতে গুগল দিয়ে লগইন করুন</p>

        {/* গুগল লগইন বাটন */}
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm"
        >
          <img 
            src="https://www.svgrepo.com/show/355037/google.svg" 
            alt="Google" 
            className="w-5 h-5" 
          />
          Google দিয়ে লগইন করুন
        </button>

        {/* ফুটার টেক্সট */}
        <p className="mt-8 text-xs text-slate-400">
          লগইন করার মাধ্যমে আপনি আমাদের <br /> 
          <a href="#" className="underline hover:text-blue-600">নিয়মাবলী ও গোপনীয়তা নীতি</a> মেনে নিচ্ছেন।
        </p>
      </div>
    </div>
  );
}