"use client";
import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

export default function BrandStorySection() {
  const [info, setInfo] = useState<StudioInfo | null>(null);

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const studioName = info?.studioName || "LEON STUDIO";
  const introduction = info?.introduction || "Chúng tôi ghi lại những khoảnh khắc đẹp nhất của bạn qua ống kính nghệ thuật và đôi bàn tay trang điểm chuyên nghiệp.";

  return (
    <section
      id="brand-story"
      className="py-8 md:py-10 bg-[#FAF5EE] border-b border-gold-luxury/10"
      aria-labelledby="brand-story-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-6">
          <h2
            id="brand-story-heading"
            className="font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight"
          >
            Về {studioName}
          </h2>
        </div>

        {/* Content Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gold-luxury/10 relative overflow-hidden">
          {/* Subtle gold decoration lines */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-luxury/40 via-gold-luxury to-gold-luxury/40" />

          <h3 className="font-playfair text-xl md:text-2xl text-zinc-950 mb-6 text-center font-bold">
            Câu chuyện thương hiệu
          </h3>

          <p className="font-hanken text-body-lg text-zinc-700 leading-relaxed text-center max-w-3xl mx-auto">
            {introduction}
          </p>
        </div>
      </div>
    </section>
  );
}
