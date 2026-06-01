"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [info, setInfo] = useState<StudioInfo | null>(null);

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = headlineRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      el.classList.add("visible");
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const studioName = info?.studioName || "LEON STUDIO";
  const introduction = info?.introduction || "Chúng tôi ghi lại những khoảnh khắc đẹp nhất của bạn qua ống kính nghệ thuật và đôi bàn tay trang điểm chuyên nghiệp.";

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 600 }}
      aria-label="Banner chính"
    >
      {/* Background Image from API */}
      <div className="absolute inset-0 z-0 bg-black" aria-hidden="true">
        {info?.bannerUrl ? (
          <Image
            src={info.bannerUrl}
            alt={studioName}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-85 transition-opacity duration-1000"
          />
        ) : (
          /* Background placeholder gradient */
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #D4AF37 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, #735c00 0%, transparent 50%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Dark Overlay (Ensures text remains readable over the image) */}
      <div className="hero-overlay absolute inset-0 z-10 bg-black/60" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-page">
        {/* Label */}
        <div className="fade-up visible mb-6">
          <span className="inline-block font-hanken text-label-sm text-gold-luxury uppercase tracking-widest border border-gold-luxury/40 px-4 py-1.5 backdrop-blur-sm bg-black/20">
            Photography & Makeup Studio
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="fade-up font-playfair text-2xl sm:text-4xl md:text-6xl lg:text-7xl text-white mb-6 max-w-none leading-tight font-extrabold uppercase tracking-tight"
          style={{ transition: "all 1s cubic-bezier(0.77, 0, 0.175, 1)" }}
        >
          Nâng tầm vẻ đẹp của bạn
        </h1>

        {/* CTA Buttons */}
        <div className="fade-up visible flex justify-center">
          <Link
            href="/#booking"
            id="hero-booking-cta"
            className="bg-gold-luxury hover:bg-gold-dark text-black font-hanken font-semibold text-sm uppercase tracking-widest px-12 py-4 transition-all duration-300 active:scale-95 hover:shadow-xl"
          >
            Tư vấn gói chụp
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-hanken text-xs text-white/40 uppercase tracking-widest">Scroll</span>
        <div className="animate-scroll-bounce">
          <span className="material-symbols-outlined text-white/40" style={{ fontSize: 20 }}>
            keyboard_arrow_down
          </span>
        </div>
      </div>
    </section>
  );
}
