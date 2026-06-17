"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { guestApi } from "@/lib/api";
import type { ConceptSummary, ConceptDetail } from "@/types";

const FALLBACK_CONCEPTS: ConceptSummary[] = [
  { id: 1, title: "SWEET ANGEL", slug: "sweet-angel", conceptType: "BEAUTY", thumbnailUrl: "", description: "Sự nhẹ nhàng, tinh khôi", status: "PUBLISHED", createdAt: "" },
  { id: 2, title: "Dark Romance", slug: "dark-romance", conceptType: "COUPLE", thumbnailUrl: "", description: "Tone tối, huyền bí, mạnh mẽ", status: "PUBLISHED", createdAt: "" },
  { id: 3, title: "Natural Light", slug: "natural-light", conceptType: "BEAUTY", thumbnailUrl: "", description: "Ánh sáng tự nhiên, trong trẻo", status: "PUBLISHED", createdAt: "" },
  { id: 4, title: "Editorial", slug: "editorial", conceptType: "EVENT", thumbnailUrl: "", description: "Phong cách tạp chí thời thượng", status: "PUBLISHED", createdAt: "" },
  { id: 5, title: "Dreamy Pastel", slug: "dreamy-pastel", conceptType: "BIRTHDAY", thumbnailUrl: "", description: "Gam màu pastel nhẹ nhàng", status: "PUBLISHED", createdAt: "" },
  { id: 6, title: "Urban Street", slug: "urban-street", conceptType: "OUTDOOR", thumbnailUrl: "", description: "Đô thị, cá tính, hiện đại", status: "PUBLISHED", createdAt: "" },
];

export default function ConceptsSection() {
  const [concepts, setConcepts] = useState<ConceptSummary[]>(FALLBACK_CONCEPTS);
  const getCategoryLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case "BEAUTY": return "Beauty";
      case "COUPLE": return "Cặp đôi";
      case "BIRTHDAY": return "Sinh nhật";
      case "FAMILY": return "Gia đình";
      case "OUTDOOR": return "Ngoại cảnh";
      case "EVENT": return "Sự kiện";
      case "OTHER": return "Khác";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  };

  const uniqueTypes = Array.from(
    new Set(concepts.map((c) => c.conceptType?.trim().toUpperCase()).filter(Boolean))
  );

  const categories = [
    { label: "Tất cả", value: "" },
    ...uniqueTypes.map((type) => ({
      label: getCategoryLabel(type),
      value: type,
    })),
  ];
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const itemsPerPage = 15;

  // Modal states for detailed concept view
  const [selectedConcept, setSelectedConcept] = useState<ConceptDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    guestApi
      .getConcepts(undefined, 0, 1000)
      .then((data) => setConcepts(data.length ? data : FALLBACK_CONCEPTS))
      .catch(() => setConcepts(FALLBACK_CONCEPTS))
      .finally(() => setLoading(false));
  }, []);

  // Reset page on category change
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedConcept) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedConcept]);

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
  }, [loading, activeCategory, currentPage]);

  const handleOpenModal = async (concept: ConceptSummary) => {
    setModalLoading(true);
    // Initialize modal with basic summary details
    const tempDetail: ConceptDetail = {
      ...concept,
      images: [],
      credits: []
    };
    setSelectedConcept(tempDetail);

    try {
      const detail = await guestApi.getConceptBySlug(concept.slug);
      setSelectedConcept(detail);
    } catch (err) {
      console.warn("Failed to fetch concept details, falling back to summary information:", err);
      setSelectedConcept({
        ...concept,
        images: concept.thumbnailUrl ? [{ id: 1, imageUrl: concept.thumbnailUrl, sortOrder: 0 }] : [],
        credits: []
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleBookConcept = (conceptId: number) => {
    setSelectedConcept(null);
    window.dispatchEvent(
      new CustomEvent("select-booking-concept", {
        detail: { conceptId },
      })
    );
    const bookingEl = document.getElementById("booking");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filtered =
    activeCategory === ""
      ? concepts
      : concepts.filter((c) => c.conceptType === activeCategory);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedConcepts = filtered.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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
          <h2
            id="concepts-heading"
            className="fade-up font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-3"
          >
            Bộ Sưu Tập Tác Phẩm
          </h2>
          <p className="fade-up font-hanken text-body-md text-on-surface-variant max-w-none mx-auto">
            Khám phá đa dạng phong cách chụp ảnh để tìm concept phù hợp với cá tính của bạn
          </p>
        </div>

        {/* Category Filter */}
        <div className="fade-up flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-xl aspect-[4/5]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {displayedConcepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => handleOpenModal(concept)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12" role="navigation" aria-label="Concepts page navigation">
            {/* Left Chevron Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-lg border border-outline-variant/30 bg-white flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-10 h-10 rounded-lg font-hanken text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  currentPage === idx
                    ? "bg-primary text-on-primary shadow-md"
                    : "text-on-surface-variant/60 hover:text-primary hover:bg-outline-variant/10"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            {/* Right Chevron Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="w-10 h-10 rounded-lg border border-outline-variant/30 bg-white flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}

        {/* View more / CTA */}
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

      {/* ─── Concept Details Modal Popup ─── */}
      {selectedConcept && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={() => setSelectedConcept(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-4xl max-h-[85vh] bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-y-auto flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedConcept(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Modal Content */}
            <div className="p-6 md:p-8 flex flex-col space-y-6">
              {/* Concept Title & Description */}
              <div>
                <span className="font-hanken text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block font-mono">
                  Concept: {selectedConcept.conceptType}
                </span>
                <h3 className="font-playfair text-display-md text-zinc-900 font-bold mb-3 leading-tight text-xl md:text-2xl">
                  {selectedConcept.title}
                </h3>
                {selectedConcept.description && (
                  <p className="font-hanken text-zinc-600 text-sm leading-relaxed max-w-2xl">
                    {selectedConcept.description}
                  </p>
                )}
              </div>

              {/* Photos Gallery */}
              <div className="border-t border-zinc-100 pt-4 flex-1">
                <h4 className="font-playfair text-zinc-900 text-xs font-bold uppercase tracking-wider mb-3 font-mono">
                  Hình ảnh Concept
                </h4>
                {modalLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[200px]">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton rounded-xl aspect-[3/4]" />
                    ))}
                  </div>
                ) : selectedConcept.images && selectedConcept.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {selectedConcept.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 group"
                      >
                        <ConceptGalleryImage
                          src={img.imageUrl}
                          alt={`${selectedConcept.title} gallery`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-zinc-100/50 p-8 rounded-xl text-center text-zinc-400 italic text-xs font-hanken py-10">
                    Chưa có ảnh mô tả bổ sung cho concept này.
                  </div>
                )}
              </div>

              {/* CTA Booking Button */}
              <div className="border-t border-zinc-100 pt-5 flex justify-end">
                <button
                  onClick={() => handleBookConcept(selectedConcept.id)}
                  className="bg-gold-luxury hover:bg-amber-500 text-black font-hanken text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_month</span>
                  Đặt lịch với concept này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Resilient Card Component to prevent page crashes on invalid/broken image URLs
function ConceptCard({ concept, onClick }: { concept: ConceptSummary; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);
  const isValidUrl = concept.thumbnailUrl && 
    (concept.thumbnailUrl.startsWith("http://") || 
     concept.thumbnailUrl.startsWith("https://") || 
     concept.thumbnailUrl.startsWith("/"));

  return (
    <div
      onClick={onClick}
      className="fade-up group relative aspect-[4/5] w-full overflow-hidden cursor-pointer rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image or Placeholder */}
      {isValidUrl && !imgError ? (
        <img
          src={concept.thumbnailUrl}
          alt={concept.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="concept-placeholder w-full h-full bg-zinc-900/10 flex items-center justify-center border border-zinc-800/10">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-zinc-400" style={{ fontSize: 40 }}>
              broken_image
            </span>
            <span className="text-zinc-500 font-hanken text-xs text-center px-4 font-semibold">{concept.title}</span>
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
  );
}

// Resilient Image component for Modal Gallery
function ConceptGalleryImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  const isValidUrl = src && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));

  if (!isValidUrl || imgError) {
    return (
      <div className="w-full h-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
        <span className="material-symbols-outlined text-zinc-400" style={{ fontSize: 32 }}>
          broken_image
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      loading="lazy"
    />
  );
}
