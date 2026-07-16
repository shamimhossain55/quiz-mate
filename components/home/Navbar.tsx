"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="#subjects"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Subjects
          </Link>

          <Link
            href="#features"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Features
          </Link>

          <Link
            href="#community"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Community
          </Link>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Login
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            শুরু করুন
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden rounded-lg p-2 hover:bg-slate-100">
          ☰
        </button>
      </div>
    </header>
  );
}