"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { guestApi } from "@/lib/api";
import type { PackageSummary, ServiceType } from "@/types";

const FALLBACK_PACKAGES: PackageSummary[] = [
  {
    id: 1, packageName: "GÓI BASIC I", slug: "basic-i", price: 2699000,
    shortDescription: "2 Layout chụp, 2 trang phục, 10 ảnh chỉnh sửa.",
    layoutCount: 2, outfitCount: 2, editedPhotos: 10, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 2, packageName: "GÓI STANDARD", slug: "standard", price: 3500000,
    shortDescription: "2 Layout chụp, trang điểm + posing hướng dẫn, 15 ảnh.",
    layoutCount: 2, outfitCount: 2, editedPhotos: 15, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 3, packageName: "GÓI LUXURY", slug: "luxury", price: 4499000,
    shortDescription: "Gói cao cấp kèm trang phục của Studio, 12 ảnh chỉnh sửa.",
    layoutCount: 2, outfitCount: 2, editedPhotos: 12, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 4, packageName: "GÓI COUPLE", slug: "couple", price: 5000000,
    shortDescription: "Chụp cặp đôi lãng mạn, trang điểm cho 2 người, 20 ảnh.",
    layoutCount: 3, outfitCount: 2, editedPhotos: 20, makeupPersonCount: 2,
    thumbnailUrl: "", isActive: true,
  },
];

const TYPE_ORDER: Record<string, number> = {
  "STANDARD": 1,
  "PREMIUM": 2,
  "VIP": 3
};

const getServiceTypeWeight = (name: string): number => {
  const normalized = (name || "").trim().toUpperCase();
  if (normalized.includes("STANDARD")) return TYPE_ORDER.STANDARD;
  if (normalized.includes("PREMIUM")) return TYPE_ORDER.PREMIUM;
  if (normalized.includes("VIP")) return TYPE_ORDER.VIP;
  return 99;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function ServicesSection() {
  const [packages, setPackages] = useState<PackageSummary[]>(FALLBACK_PACKAGES);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Pagination state for displaying only 4 packages at a time
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(packages.length / itemsPerPage);

  const displayedPackages = packages.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Load service types on mount
  useEffect(() => {
    guestApi
      .getServiceTypes()
      .then((types) => {
        const sortedTypes = [...types].sort((a, b) => {
          const weightA = getServiceTypeWeight(a.serviceName);
          const weightB = getServiceTypeWeight(b.serviceName);
          return weightA - weightB;
        });
        setServiceTypes(sortedTypes);
      })
      .catch((err) => console.warn("Failed to load service types:", err));
  }, []);

  // Load packages whenever activeTypeId changes
  useEffect(() => {
    setLoading(true);
    guestApi
      .getPackages(activeTypeId ?? undefined)
      .then((data) => {
        setPackages(data.length ? data : (activeTypeId ? [] : FALLBACK_PACKAGES));
        setCurrentPage(0); // Reset page on category change
      })
      .catch(() => {
        setPackages(activeTypeId ? [] : FALLBACK_PACKAGES);
        setCurrentPage(0);
      })
      .finally(() => setLoading(false));
  }, [activeTypeId]);

  // Intersection observer for fade-up (trình tự animate khi loading chuyển sang false)
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
  }, [loading, currentPage]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPackage]);

  const handleBookPackage = (pkg: PackageSummary) => {
    setSelectedPackage(null);
    // Dispatch custom event to select this package dynamically in the decoupled BookingSection
    window.dispatchEvent(
      new CustomEvent("select-booking-package", {
        detail: { packageId: pkg.id },
      })
    );
    // Scroll smoothly to booking section
    const bookingEl = document.getElementById("booking");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section-padding bg-surface-container-low"
      aria-labelledby="services-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            id="services-heading"
            className="fade-up font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-3"
          >
            Dịch vụ & Gói chụp
          </h2>
          <p className="fade-up font-hanken text-body-md text-on-surface-variant max-w-xl mx-auto">
            Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn
          </p>
        </div>

        {/* Category Filter */}
        {serviceTypes.length > 0 && (
          <div className="fade-up flex flex-wrap gap-2 justify-center mb-12">
            <button
              onClick={() => setActiveTypeId(null)}
              className={`font-hanken text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 border transition-all duration-200 cursor-pointer ${
                activeTypeId === null
                  ? "bg-primary border-primary text-on-primary"
                  : "border-outline/30 text-on-surface-variant hover:border-primary hover:text-on-surface"
              }`}
            >
              Tất cả
            </button>
            {serviceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTypeId(type.id)}
                className={`font-hanken text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 border transition-all duration-200 cursor-pointer ${
                  activeTypeId === type.id
                    ? "bg-primary border-primary text-on-primary"
                    : "border-outline/30 text-on-surface-variant hover:border-primary hover:text-on-surface"
                }`}
              >
                {type.serviceName}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-xl h-[420px]" />
            ))}
          </div>
        ) : (
          <>
            {/* Grid of 4 Cards */}
            <div className="fade-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedPackages.map((pkg, idx) => (
                <article
                  key={pkg.id}
                  className="fade-up group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col"
                >
                  {/* Dynamic Image from Cloudinary/API */}
                  <div
                    className="concept-placeholder h-48 relative overflow-hidden bg-gray-50 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {pkg.thumbnailUrl ? (
                      <Image
                        src={pkg.thumbnailUrl}
                        alt={pkg.packageName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 48 }}>
                          photo_camera
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-playfair text-headline-md text-on-surface mb-2 font-bold truncate">
                      {pkg.packageName}
                    </h3>
                    <p className="font-hanken text-body-sm text-on-surface-variant mb-4 flex-1 leading-relaxed line-clamp-3 text-sm">
                      {pkg.shortDescription}
                    </p>

                    {/* Details: layout, outfit, photos, makeup */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      <span className="flex items-center gap-1 font-hanken text-[11px] font-semibold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>grid_view</span>
                        {pkg.layoutCount} layout
                      </span>
                      <span className="flex items-center gap-1 font-hanken text-[11px] font-semibold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_library</span>
                        {pkg.editedPhotos} ảnh
                      </span>
                      {pkg.makeupPersonCount > 0 && (
                        <span className="flex items-center gap-1 font-hanken text-[11px] font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>face_retouching_natural</span>
                          Makeup
                        </span>
                      )}
                    </div>

                    {/* Price & Modal CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                      <span className="font-playfair text-headline-sm text-secondary font-bold">
                        {formatPrice(pkg.price)}
                      </span>
                      <button
                        onClick={() => setSelectedPackage(pkg)}
                        className="bg-primary hover:bg-secondary text-on-primary font-hanken text-xs font-semibold uppercase tracking-wider px-4 py-2.5 transition-colors duration-300 active:scale-95 shadow-sm"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls centered below the grid on the same line */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12" role="tablist" aria-label="Services page navigation">
                {/* Left Arrow Button */}
                <button
                  onClick={prevPage}
                  className="w-8 h-8 rounded border border-outline-variant/30 bg-white flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={currentPage === idx}
                    aria-label={`Trang ${idx + 1}`}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-8 h-8 rounded font-hanken text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      currentPage === idx
                        ? "bg-primary text-on-primary shadow-md"
                        : "text-on-surface-variant/60 hover:text-primary hover:bg-outline-variant/10"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                {/* Right Arrow Button */}
                <button
                  onClick={nextPage}
                  className="w-8 h-8 rounded border border-outline-variant/30 bg-white flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Premium Package Details Modal Popup ─── */}
      {selectedPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={() => setSelectedPackage(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-outline-variant/10 flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-on-surface hover:text-secondary flex items-center justify-center transition-colors"
              aria-label="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 flex-1">
              {/* Modal Left Thumbnail side */}
              <div className="md:col-span-2 relative h-48 md:h-full min-h-[220px] bg-gray-50 flex items-center justify-center">
                {selectedPackage.thumbnailUrl ? (
                  <Image
                    src={selectedPackage.thumbnailUrl}
                    alt={selectedPackage.packageName}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 64 }}>
                    photo_camera
                  </span>
                )}
                {/* Floating price badge */}
                <div className="absolute bottom-4 left-4 bg-secondary/95 backdrop-blur-sm text-on-secondary font-playfair font-bold text-headline-sm px-4 py-2 shadow-lg">
                  {formatPrice(selectedPackage.price)}
                </div>
              </div>

              {/* Modal Right Content side */}
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <span className="font-hanken text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">
                    Chi tiết gói dịch vụ
                  </span>
                  <h3 className="font-playfair text-display-md text-on-surface font-bold mb-3 leading-tight">
                    {selectedPackage.packageName}
                  </h3>
                  <p className="font-hanken text-body-md text-on-surface-variant mb-6 leading-relaxed text-sm">
                    {selectedPackage.shortDescription}
                  </p>

                  {/* Highlights Specs grid */}
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 space-y-3 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>grid_view</span>
                        <div className="font-hanken text-xs text-on-surface">
                          <span className="font-bold">{selectedPackage.layoutCount}</span> layout chụp
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>checkroom</span>
                        <div className="font-hanken text-xs text-on-surface">
                          <span className="font-bold">{selectedPackage.outfitCount}</span> bộ trang phục
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>photo_library</span>
                        <div className="font-hanken text-xs text-on-surface">
                          <span className="font-bold">{selectedPackage.editedPhotos}</span> ảnh photoshop
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>face_retouching_natural</span>
                        <div className="font-hanken text-xs text-on-surface">
                          <span className="font-bold">{selectedPackage.makeupPersonCount > 0 ? "Makeup & Tóc" : "Tự trang điểm"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail contents */}
                  <div className="border-t border-outline-variant/10 pt-5 mb-8">
                    <h4 className="font-playfair text-headline-sm font-bold text-on-surface mb-2">
                      Gói chụp bao gồm
                    </h4>
                    {/* Render HTML description safely */}
                    <div
                      className="prose prose-luxury font-hanken text-body-sm text-on-surface-variant leading-relaxed text-xs max-h-48 overflow-y-auto pr-2"
                      dangerouslySetInnerHTML={{
                        __html: selectedPackage.detailContent || "<ul><li>Hỗ trợ trang điểm nhẹ nhàng</li><li>Stylist hướng dẫn tạo dáng</li><li>Bàn giao toàn bộ file ảnh gốc</li></ul>",
                      }}
                    />
                  </div>
                </div>

                {/* Direct Action Booking Button */}
                <button
                  onClick={() => handleBookPackage(selectedPackage)}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest py-3.5 transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                  Đặt lịch với gói này ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
