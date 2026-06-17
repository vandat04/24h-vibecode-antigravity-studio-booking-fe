"use client";

import { useEffect, useState, useRef } from "react";
import { guestApi } from "@/lib/api";
import type { CustomerStory } from "@/types";

const FALLBACK_STORIES: CustomerStory[] = [
  {
    id: 1,
    customerName: "Chị Ngô Hoàng Mỹ",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&h=800&auto=format&fit=crop",
    imageAfterUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=800&auto=format&fit=crop",
    storyContent: "Makeup siêu đẹp luôn á, ai ngại hay k biết tạo dáng thì đến nic.w để trải nghiệm liền. Team thân thiện và rất dễ thương luôn á",
    createdAt: "2025-05-15T14:00:00",
  },
  {
    id: 2,
    customerName: "Chị Hồ Thu Hà",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=800&auto=format&fit=crop",
    imageAfterUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=800&auto=format&fit=crop",
    storyContent: "Cảm ơn team đã rất chu đáo và tận tâm, rất ưng ý với kết quả! Photographer rất hiểu ý và biết cách tạo dáng tự nhiên.",
    createdAt: "2025-05-10T16:00:00",
  },
  {
    id: 3,
    customerName: "Chị Lê Thị Mai",
    avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&h=800&auto=format&fit=crop",
    imageAfterUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=800&auto=format&fit=crop",
    storyContent: "Concept dark & moody đúng như mình muốn. Đội ngũ lắng nghe ý kiến khách hàng rất tốt. Sẽ giới thiệu cho bạn bè!",
    createdAt: "2025-04-18T10:00:00",
  },
  {
    id: 4,
    customerName: "Chị Nguyễn Thị Lan",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&h=800&auto=format&fit=crop",
    imageAfterUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=600&h=800&auto=format&fit=crop",
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
    }, 8000);
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

  const nextStory = () => {
    setCurrent((prev) => (prev + 1) % stories.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prevStory = () => {
    setCurrent((prev) => (prev - 1 + stories.length) % stories.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const story = stories[current];
  const beforeImg = story.avatarUrl || FALLBACK_STORIES[current].avatarUrl;
  const afterImg = story.imageAfterUrl || FALLBACK_STORIES[current].imageAfterUrl;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="section-padding bg-surface-container-low"
      style={{ backgroundColor: "#FDF8F2" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="testimonials-heading"
            className="fade-up font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight"
          >
            Câu Chuyện Khách Hàng
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="fade-up relative max-w-5xl mx-auto flex items-center gap-4 md:gap-8">
          {/* Left Arrow Button */}
          <button
            onClick={prevStory}
            className="hidden md:flex w-10 h-10 rounded-lg border border-outline-variant/30 bg-white items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0"
            aria-label="Previous story"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
          </button>

          {/* Central Card */}
          <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-outline-variant/10 overflow-hidden min-h-[360px] flex items-center">
            <div className="grid grid-cols-12 gap-8 items-center w-full">
              {/* Left Column: Before/After Image Hover Container */}
              <div className="col-span-12 md:col-span-6">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-low group cursor-pointer shadow-sm">
                  {/* Before Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={beforeImg}
                    alt="Before"
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 text-white font-hanken text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded backdrop-blur-sm z-10 transition-opacity duration-300 group-hover:opacity-0">
                    Before
                  </span>

                  {/* After Image Overlay */}
                  {afterImg && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={afterImg}
                        alt="After"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                      />
                      <span className="absolute top-3 right-3 bg-secondary text-on-secondary font-hanken text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                        After
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Story Content & Bold Name */}
              <div className="col-span-12 md:col-span-6 flex flex-col justify-center text-left">
                <blockquote className="font-hanken text-body-lg text-on-surface mb-6 leading-relaxed text-on-surface-variant font-medium break-words text-justify">
                  &ldquo;{story.storyContent}&rdquo;
                </blockquote>
                <div className="font-hanken text-on-surface text-base">
                  &mdash; <span className="font-extrabold text-on-surface tracking-wide">{story.customerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={nextStory}
            className="hidden md:flex w-10 h-10 rounded-lg border border-outline-variant/30 bg-white items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0"
            aria-label="Next story"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>
        </div>

        {/* Numbers Page indicators */}
        <div className="flex justify-center items-center gap-3 mt-8" role="tablist" aria-label="Story page navigation">
          {stories.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={current === idx}
              aria-label={`Câu chuyện ${idx + 1}`}
              onClick={() => handleDotClick(idx)}
              className={`w-8 h-8 rounded font-hanken text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                current === idx
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant/60 hover:text-primary hover:bg-outline-variant/10"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
