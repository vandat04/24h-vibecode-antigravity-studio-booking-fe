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

      {/* 4. Google Maps Button (Green with white Location Pin icon) */}
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
