"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Play,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Swords,
  Award,
} from "lucide-react";
import { BannerSlide } from "@/lib/firestore/banners";

interface BannerCarouselProps {
  slides?: BannerSlide[];
}

export default function BannerCarousel({ slides = [] }: BannerCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const bannerList = slides;

  // Auto slide every 4.5 seconds
  useEffect(() => {
    if (isPaused || bannerList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, bannerList.length]);

  if (!bannerList || bannerList.length === 0) {
    return null;
  }


  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const currentBanner = bannerList[currentIndex] || bannerList[0];

  return (
    <div
      className="relative group rounded-2xl overflow-hidden shadow-[0_8px_24px_-6px_rgba(13,148,136,0.30)] border border-white/25 transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: currentBanner.bgGradient || "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0369A1 100%)",
      }}
    >
      {/* Background Cover Image if provided */}
      {currentBanner.imageUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-35 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/30 to-transparent" />
        </div>
      )}

      {/* Decorative Orbs */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-teal-300/20 blur-lg pointer-events-none" />

      {/* Slide Navigation Arrows (visible on hover or desktop) */}
      {bannerList.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/60 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/60 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight width={16} height={16} />
          </button>
        </>
      )}

      {/* Slide Main Content */}
      <div className="relative z-10 px-4 py-3 flex flex-col gap-2">
        {/* Top badge row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-black text-white">
            <Sparkles width={9} height={9} className="text-amber-300 fill-amber-300 animate-pulse" />
            <span>{currentBanner.badge || "PROMO"}</span>
          </div>
          <span className="text-[9px] font-extrabold text-teal-100/90 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
            {currentIndex + 1} / {bannerList.length}
          </span>
        </div>

        {/* Title and Subtitle */}
        <div>
          <h3 className="text-base font-black text-white leading-tight tracking-tight drop-shadow-sm">
            {currentBanner.title}
          </h3>
          <p className="text-[10px] text-teal-100/90 font-medium mt-0.5 leading-snug line-clamp-1">
            {currentBanner.subtitle}
          </p>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={() => router.push(currentBanner.linkUrl || "/quiz/setup")}
            className="h-8 px-3 rounded-lg bg-white text-slate-900 font-extrabold text-[11px] shadow-md hover:bg-amber-300 active:scale-95 transition-all duration-200 flex items-center gap-1 group/btn"
          >
            <span>{currentBanner.ctaText || "এক্সপ্লোর করুন 🚀"}</span>
            <Play width={11} height={11} fill="currentColor" className="text-slate-900 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          {/* XP Bonus */}
          <div className="flex items-center gap-1 text-[9px] text-teal-100 font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15">
            <Zap width={10} height={10} className="text-amber-300 fill-amber-300" />
            <span>+১২৫ XP বোনাস</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators (Dots) */}
      {bannerList.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
          {bannerList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "w-5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
