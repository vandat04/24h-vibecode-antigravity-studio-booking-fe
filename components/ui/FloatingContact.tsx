"use client";

import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

export default function FloatingContact() {
  const [info, setInfo] = useState<StudioInfo | null>(null);

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const phone = info?.phone || "0905123456";
  const zaloUrl = info?.zaloUrl || "https://zalo.me/nicstudio";
  const facebookUrl = info?.facebookUrl || "https://www.facebook.com/leonstudio.concept/";
  const instagramUrl = info?.instagramUrl || "https://www.instagram.com/leonstudio.concept/";
  const tiktokUrl = info?.tiktokUrl || "https://www.tiktok.com/@leonstudio.concept";
  const googleMapUrl = info?.googleMapUrl || "https://maps.app.goo.gl/V3r96TqNmzWtAJqF8";

  return (
    <div
      className="fixed right-6 bottom-8 z-50 flex flex-col gap-4"
      aria-label="Liên hệ nhanh"
    >
      {/* 1. Phone Button (Red with ripple pulse animation) */}
      <a
        href={`tel:${phone}`}
        className="group relative w-13 h-13 rounded-full bg-[#f44336] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Gọi điện thoại liên hệ"
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-[#f44336] opacity-35 animate-ping z-0" />
        
        {/* Icon */}
        <span className="material-symbols-outlined relative z-10 select-none" style={{ fontSize: 24 }}>
          call
        </span>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          Gọi ngay: {phone}
        </span>
      </a>

      {/* 2. Zalo Button (Official Zalo Bubble Design) */}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-13 h-13 rounded-full bg-white text-[#0068FF] border border-gray-100 flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Chat Zalo hỗ trợ"
      >
        {/* Zalo Speech Bubble shape */}
        <div
          className="w-10 h-10 bg-[#0068FF] text-white flex items-center justify-center font-hanken text-[10px] font-black tracking-tight uppercase leading-none"
          style={{ borderRadius: "50% 50% 50% 8%" }}
        >
          Zalo
        </div>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          Chat Zalo
        </span>
      </a>

      {/* 3. Facebook Button (Official Facebook Blue with White 'f') */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-13 h-13 rounded-full bg-[#1877f2] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Truy cập Facebook Page"
      >
        {/* White Facebook 'f' SVG */}
        <svg className="w-6 h-6 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          Facebook Fanpage
        </span>
      </a>

      {/* 4. Instagram Button (Premium Instagram Gradient & Icon) */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-13 h-13 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Truy cập Instagram"
      >
        <svg className="w-6 h-6 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          Instagram
        </span>
      </a>

      {/* 5. TikTok Button (High Contrast Black with Glowing Accent) */}
      <a
        href={tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-13 h-13 rounded-full bg-[#09090b] text-white border border-[#27272a] flex items-center justify-center shadow-lg hover:shadow-2xl hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Truy cập TikTok"
      >
        <svg className="w-5.5 h-5.5 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.17.96 1.14 2.3 1.91 3.77 2.18v3.83c-1.85-.01-3.67-.6-5.18-1.72-.18-.13-.34-.28-.5-.43v6.79c0 3.28-1.86 6.27-4.83 7.57-2.97 1.3-6.43.76-8.86-1.39-2.42-2.14-3.43-5.5-2.52-8.59.91-3.08 3.65-5.26 6.84-5.46v3.93c-1.68.18-3.09 1.34-3.51 2.99-.42 1.65.13 3.42 1.38 4.45 1.25 1.03 3.03 1.18 4.44.38 1.41-.8 2.25-2.31 2.22-3.92V0h.04z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          TikTok
        </span>
      </a>

      {/* 6. Google Maps Button (Green with white Location Pin icon) */}
      <a
        href={googleMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-13 h-13 rounded-full bg-[#2ecc71] text-white flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Xem bản đồ chỉ đường"
      >
        <span className="material-symbols-outlined relative z-10 select-none" style={{ fontSize: 24 }}>
          location_on
        </span>

        {/* Tooltip */}
        <span className="absolute right-16 bg-black/85 backdrop-blur-sm text-white font-hanken text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mr-1 select-none">
          Chỉ đường (Google Maps)
        </span>
      </a>
    </div>
  );
}
