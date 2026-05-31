"use client";

import { useEffect, useState, useRef } from "react";
import { guestApi } from "@/lib/api";
import type { CustomerStory } from "@/types";

const FALLBACK_STORIES: CustomerStory[] = [
  {
    id: 1,
    customerName: "Chị Ngô Hoàng Mỹ",
    avatarUrl: "",
    imageAfterUrl: "",
    storyContent: "Makeup siêu đẹp luôn á, team thân thiện và rất dễ thương! Ảnh ra đẹp hơn mình kỳ vọng rất nhiều.",
    createdAt: "2025-05-15T14:00:00",
  },
  {
    id: 2,
    customerName: "Chị Hồ Thu Hà",
    avatarUrl: "",
    imageAfterUrl: "",
    storyContent: "Cảm ơn team đã rất chu đáo và tận tâm, rất ưng ý với kết quả! Photographer rất hiểu ý và biết cách tạo dáng tự nhiên.",
    createdAt: "2025-05-10T16:00:00",
  },
  {
    id: 3,
    customerName: "Chị Lê Thị Mai",
    avatarUrl: "",
    imageAfterUrl: "",
    storyContent: "Concept dark & moody đúng như mình muốn. Đội ngũ lắng nghe ý kiến khách hàng rất tốt. Sẽ giới thiệu cho bạn bè!",
    createdAt: "2025-04-18T10:00:00",
  },
  {
    id: 4,
    customerName: "Chị Nguyễn Thị Lan",
    avatarUrl: "",
    imageAfterUrl: "",
    storyContent: "Đặt lịch dễ dàng, nhân viên tư vấn nhiệt tình. Trang điểm nhẹ nhàng đúng style. Ảnh cực phẩm!",
    createdAt: "2025-04-05T09:00:00",
  },
];

export default function TestimonialsSection() {
  const [stories, setStories] = useState<CustomerStory[]>(FALLBACK_STORIES);
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  // ── API 9: GET /api/studio/stories ──────────────────────────────
  useEffect(() => {
    guestApi
      .getStories()
      .then((d) => { if (d.length) setStories(d); })
      .catch(() => {});
  }, []);

  // Auto-slide
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stories.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [stories.length]);

  // Fade-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDotClick = (idx: number) => {
    setCurrent(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const story = stories[current];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-padding bg-surface-container-low"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="fade-up font-hanken text-label-sm text-secondary uppercase tracking-widest mb-3">
            Cảm nhận
          </p>
          <h2
            id="testimonials-heading"
            className="fade-up font-playfair text-headline-lg md:text-display-lg text-on-surface"
          >
            Khách hàng nói gì
          </h2>
        </div>

        {/* Carousel */}
        <div className="fade-up max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            {/* Quote icon */}
            <span
              className="material-symbols-outlined absolute top-6 right-8 text-surface-container-highest"
              style={{ fontSize: 80, fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              format_quote
            </span>

            {/* Before / After images (nếu có) */}
            {(story.avatarUrl || story.imageAfterUrl) && (
              <div className="flex gap-3 mb-6">
                {story.avatarUrl && (
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg bg-surface-container-low overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={story.avatarUrl} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-on-surface-variant text-white font-hanken text-[9px] px-1 py-0.5 rounded">Before</span>
                  </div>
                )}
                {story.imageAfterUrl && (
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg bg-surface-container-low overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={story.imageAfterUrl} alt="After" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary font-hanken text-[9px] px-1 py-0.5 rounded">After</span>
                  </div>
                )}
              </div>
            )}

            {/* Story content */}
            <blockquote className="font-hanken text-body-lg text-on-surface mb-6 leading-relaxed relative z-10">
              &ldquo;{story.storyContent}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 24 }}>
                  person
                </span>
              </div>
              <div>
                <div className="font-hanken font-semibold text-on-surface">{story.customerName}</div>
                <div className="font-hanken text-xs text-on-surface-variant">
                  {new Date(story.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit", month: "long", year: "numeric"
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Story navigation">
            {stories.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={current === idx}
                aria-label={`Câu chuyện ${idx + 1}`}
                onClick={() => handleDotClick(idx)}
                className={`transition-all duration-300 rounded-full ${
                  current === idx
                    ? "w-8 h-2 bg-secondary"
                    : "w-2 h-2 bg-outline-variant hover:bg-secondary/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto text-center">
          {[
            { value: "500+", label: "Khách hàng hài lòng" },
            { value: "100%", label: "Cam kết chất lượng" },
            { value: "3+", label: "Năm kinh nghiệm" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-playfair text-3xl font-bold text-secondary mb-1">{stat.value}</div>
              <div className="font-hanken text-xs text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
