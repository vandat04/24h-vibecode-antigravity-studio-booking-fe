"use client";

import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

export default function BrandStorySection() {
  const [info, setInfo] = useState<StudioInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"story" | "vision" | "mission">("story");

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const studioName = info?.studioName || "LEON STUDIO";
  const introduction =
    info?.introduction ||
    "Chúng tôi ghi lại những khoảnh khắc đẹp nhất của bạn qua ống kính nghệ thuật và đôi bàn tay trang điểm chuyên nghiệp.";
  const vision =
    info?.vision ||
    "Trở thành Studio chụp ảnh nghệ thuật hàng đầu, nơi kiến tạo nét đẹp cá nhân và tôn vinh những khoảnh khắc vô giá thông qua ngôn ngữ hình ảnh sang trọng, giàu cảm xúc.";
  const mission =
    info?.mission ||
    "Mang đến cho mỗi khách hàng trải nghiệm nhiếp ảnh độc bản và trọn vẹn nhất. Chúng tôi cam kết không ngừng đổi mới tư duy sáng tạo, nâng cao tay nghề và chăm sóc khách hàng bằng sự tận tâm chân thành.";

  return (
    <section
      id="brand-story"
      className="py-12 md:py-16 bg-[#FAF5EE] border-b border-gold-luxury/10"
      aria-labelledby="brand-story-heading"
    >
      <div className="container-max px-page">
        {/* Main Section Header */}
        <div className="text-center mb-8">
          <h2
            id="brand-story-heading"
            className="font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-6"
          >
            Về {studioName}
          </h2>

          {/* Interactive Luxury Tabs */}
          <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-white border border-[#E5DACE] shadow-sm gap-1 md:gap-2">
            <button
              onClick={() => setActiveTab("story")}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "story"
                  ? "bg-[#B89678] text-white shadow-md"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-stone-50"
              }`}
            >
              Câu Chuyện Thương Hiệu
            </button>

            <button
              onClick={() => setActiveTab("vision")}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "vision"
                  ? "bg-[#B89678] text-white shadow-md"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-stone-50"
              }`}
            >
              Tầm Nhìn
            </button>

            <button
              onClick={() => setActiveTab("mission")}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "mission"
                  ? "bg-[#B89678] text-white shadow-md"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-stone-50"
              }`}
            >
              Sứ Mệnh
            </button>
          </div>
        </div>

        {/* Dynamic Card Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gold-luxury/10 relative overflow-hidden transition-all duration-300">
          {/* Subtle gold decoration bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-luxury/30 via-gold-luxury to-gold-luxury/30" />

          {/* Tab 1: Story */}
          {activeTab === "story" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-playfair text-xl md:text-2xl text-zinc-950 mb-4 text-center font-bold">
                Câu Chuyện Thương Hiệu
              </h3>
              <div className="max-w-3xl mx-auto max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                <p className="font-hanken text-base md:text-lg text-zinc-700 leading-relaxed text-justify whitespace-pre-line font-light">
                  {introduction}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Vision */}
          {activeTab === "vision" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-playfair text-xl md:text-2xl text-zinc-950 mb-4 text-center font-bold">
                Tầm Nhìn
              </h3>
              <div className="max-w-3xl mx-auto max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                <p className="font-hanken text-base md:text-lg text-zinc-700 leading-relaxed text-justify whitespace-pre-line font-light">
                  {vision}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Mission */}
          {activeTab === "mission" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-playfair text-xl md:text-2xl text-zinc-950 mb-4 text-center font-bold">
                Sứ Mệnh
              </h3>
              <div className="max-w-3xl mx-auto max-h-[500px] overflow-y-auto px-2 custom-scrollbar">
                <p className="font-hanken text-base md:text-lg text-zinc-700 leading-relaxed text-justify whitespace-pre-line font-light">
                  {mission}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
