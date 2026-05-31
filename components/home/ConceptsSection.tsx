"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { guestApi } from "@/lib/api";
import type { ConceptSummary } from "@/types";

const FALLBACK_CONCEPTS: ConceptSummary[] = [
  { id: 1, title: "SWEET ANGEL", slug: "sweet-angel", conceptType: "BEAUTY", thumbnailUrl: "", description: "Sự nhẹ nhàng, tinh khôi", status: "PUBLISHED", createdAt: "" },
  { id: 2, title: "Dark Romance", slug: "dark-romance", conceptType: "COUPLE", thumbnailUrl: "", description: "Tone tối, huyền bí, mạnh mẽ", status: "PUBLISHED", createdAt: "" },
  { id: 3, title: "Natural Light", slug: "natural-light", conceptType: "BEAUTY", thumbnailUrl: "", description: "Ánh sáng tự nhiên, trong trẻo", status: "PUBLISHED", createdAt: "" },
  { id: 4, title: "Editorial", slug: "editorial", conceptType: "EVENT", thumbnailUrl: "", description: "Phong cách tạp chí thời thượng", status: "PUBLISHED", createdAt: "" },
  { id: 5, title: "Dreamy Pastel", slug: "dreamy-pastel", conceptType: "BIRTHDAY", thumbnailUrl: "", description: "Gam màu pastel nhẹ nhàng", status: "PUBLISHED", createdAt: "" },
  { id: 6, title: "Urban Street", slug: "urban-street", conceptType: "OUTDOOR", thumbnailUrl: "", description: "Đô thị, cá tính, hiện đại", status: "PUBLISHED", createdAt: "" },
];

const CATEGORIES: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Beauty", value: "BEAUTY" },
  { label: "Cặp đôi", value: "COUPLE" },
  { label: "Sinh nhật", value: "BIRTHDAY" },
  { label: "Gia đình", value: "FAMILY" },
  { label: "Ngoại cảnh", value: "OUTDOOR" },
  { label: "Sự kiện", value: "EVENT" },
];

export default function ConceptsSection() {
  const [concepts, setConcepts] = useState<ConceptSummary[]>(FALLBACK_CONCEPTS);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    guestApi
      .getConcepts()
      .then((data) => setConcepts(data.length ? data : FALLBACK_CONCEPTS))
      .catch(() => setConcepts(FALLBACK_CONCEPTS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading, activeCategory]);

  const filtered =
    activeCategory === ""
      ? concepts
      : concepts.filter((c) => c.conceptType === activeCategory);

  return (
    <section
      id="concepts"
      ref={sectionRef}
      className="section-padding bg-background"
      aria-labelledby="concepts-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="fade-up font-hanken text-label-sm text-secondary uppercase tracking-widest mb-3">
            Portfolio
          </p>
          <h2
            id="concepts-heading"
            className="fade-up font-playfair text-headline-lg md:text-display-lg text-on-surface mb-4"
          >
            Concept & Phong cách
          </h2>
          <p className="fade-up font-hanken text-body-md text-on-surface-variant max-w-xl mx-auto">
            Khám phá đa dạng phong cách chụp ảnh để tìm concept phù hợp với cá tính của bạn
          </p>
        </div>

        {/* Category Filter */}
        <div className="fade-up flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`font-hanken text-xs font-medium uppercase tracking-widest px-5 py-2 border transition-all duration-200 ${
                activeCategory === cat.value
                  ? "bg-primary border-primary text-on-primary"
                  : "border-outline/30 text-on-surface-variant hover:border-primary hover:text-on-surface"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Equal Grid Gallery */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-xl aspect-[4/5]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filtered.map((concept) => (
              <div
                key={concept.id}
                className="fade-up group relative aspect-[4/5] w-full overflow-hidden cursor-pointer rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image or Placeholder */}
                {concept.thumbnailUrl ? (
                  <Image
                    src={concept.thumbnailUrl}
                    alt={concept.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                ) : (
                  <div className="concept-placeholder w-full h-full bg-gray-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 40 }}>
                        image
                      </span>
                      <span className="text-gray-400 font-hanken text-xs">{concept.title}</span>
                    </div>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="font-hanken text-label-sm text-gold-luxury uppercase tracking-widest mb-1 block">
                    {concept.conceptType}
                  </span>
                  <h3 className="font-playfair text-white text-headline-md font-bold">{concept.title}</h3>
                  {concept.description && (
                    <p className="font-hanken text-white/70 text-xs mt-1 line-clamp-2">{concept.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View more */}
        <div className="text-center mt-12">
          <a
            href="/#booking"
            className="inline-flex items-center gap-2 border border-primary text-on-surface hover:bg-primary hover:text-on-primary font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-3.5 transition-all duration-300"
          >
            Đặt lịch với concept yêu thích
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </a>
        </div>
      </div>
    </section>
  );
}
