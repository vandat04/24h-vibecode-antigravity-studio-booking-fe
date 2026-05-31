"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { guestApi } from "@/lib/api";
import type { ConceptDetail } from "@/types";

export default function ConceptDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [concept, setConcept] = useState<ConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    guestApi
      .getConceptBySlug(slug)
      .then(setConcept)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-max px-page">
          {loading ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="skeleton h-6 w-20 mx-auto rounded" />
                <div className="skeleton h-12 w-64 mx-auto rounded" />
                <div className="skeleton h-4 w-96 mx-auto rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-96 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : error || !concept ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: 64 }}>
                error
              </span>
              <h1 className="font-playfair text-headline-lg text-on-surface mb-4">
                Concept không tồn tại
              </h1>
              <p className="font-hanken text-on-surface-variant mb-8">
                Có vẻ như concept đã bị gỡ bỏ hoặc liên kết không chính xác.
              </p>
              <Link
                href="/#concepts"
                className="bg-primary hover:bg-secondary text-on-primary font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-3.5 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div>
              {/* Back Link */}
              <div className="mb-6">
                <Link
                  href="/#concepts"
                  className="inline-flex items-center gap-1.5 font-hanken text-xs font-semibold text-secondary hover:text-gold-dark uppercase tracking-widest transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Tất cả Concept
                </Link>
              </div>

              {/* Header */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="inline-block font-hanken text-xs font-bold text-secondary bg-secondary/10 uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
                  {concept.conceptType}
                </span>
                <h1 className="font-playfair text-display-md md:text-display-lg text-on-surface mb-4 font-bold">
                  {concept.title}
                </h1>
                <p className="font-hanken text-body-lg text-on-surface-variant leading-relaxed">
                  {concept.description}
                </p>
              </div>

              {/* Photoset Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {concept.images && concept.images.length > 0 ? (
                  concept.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative overflow-hidden rounded-2xl group shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`${concept.title} - Ảnh ${img.sortOrder + 1}`}
                        className="w-full h-auto object-cover rounded-2xl group-hover:scale-101 transition-transform duration-500"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-on-surface-variant font-hanken text-sm italic">
                    Bộ sưu tập ảnh đang được tải lên.
                  </div>
                )}
              </div>

              {/* Credits & Action Footer */}
              <div className="max-w-4xl mx-auto bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
                <div>
                  <h3 className="font-playfair text-headline-md text-on-surface font-bold mb-4">
                    Ê-kíp Thực Hiện
                  </h3>
                  {concept.credits && concept.credits.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {concept.credits.map((credit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-outline-variant/5"
                        >
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                            {credit.role === "PHOTOGRAPHER" ? "photo_camera" : "face_retouching_natural"}
                          </span>
                          <span className="font-hanken text-sm font-semibold text-on-surface">
                            {credit.fullName}
                          </span>
                          <span className="font-hanken text-[10px] text-on-surface-variant uppercase tracking-wider font-medium ml-1">
                            ({credit.role === "PHOTOGRAPHER" ? "Photo" : "Makeup"})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-hanken text-sm text-on-surface-variant italic">
                      Đội ngũ sáng tạo LEON STUDIO.
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 text-center md:text-right">
                  <p className="font-hanken text-xs text-on-surface-variant mb-3">
                    Bạn yêu thích phong cách này?
                  </p>
                  <Link
                    href={`/#booking?concept=${concept.id}`}
                    className="inline-flex items-center gap-2 bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-3.5 shadow-md transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                    Đặt lịch ngay
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
