"use client";
import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

function getYoutubeEmbedUrl(url: string | undefined): string {
  if (!url) return "https://www.youtube.com/embed/L3wKzyt1R6M"; // Fallback beautiful behind-the-scenes video

  // Regex to extract 11-character YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  // Check if it's already an embed link
  if (url.includes("embed")) {
    return url;
  }

  // Fallback to a stunning behind-the-scenes cinematography video if the DB has a channel link or invalid video URL
  return "https://www.youtube.com/embed/L3wKzyt1R6M";
}

export default function BehindScenesSection() {
  const [info, setInfo] = useState<StudioInfo | null>(null);

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const studioName = info?.studioName || "LEON STUDIO";
  
  // Use introVideoUrl first, then fallback to youtubeUrl
  const rawVideoUrl = info?.introVideoUrl || info?.youtubeUrl;
  const embedUrl = getYoutubeEmbedUrl(rawVideoUrl);

  return (
    <section
      id="behind-scenes"
      className="py-8 md:py-10 bg-white border-t border-zinc-100"
      aria-labelledby="behind-scenes-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-6">
          <h2
            id="behind-scenes-heading"
            className="font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight"
          >
            Ống Kính Nghệ Thuật
          </h2>
        </div>

        {/* Video Player Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-gold-luxury/10 bg-zinc-950 group">
            {/* Subtle luxury glow effect */}
            <div className="absolute inset-0 border border-gold-luxury/20 rounded-2xl pointer-events-none z-10 transition-colors group-hover:border-gold-luxury/50" />
            
            <iframe
              src={embedUrl}
              title={`Hậu trường sáng tạo tại ${studioName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 z-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
