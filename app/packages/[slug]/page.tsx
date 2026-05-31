"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { guestApi } from "@/lib/api";
import type { PackageDetail } from "@/types";

export default function PackageDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    guestApi
      .getPackageBySlug(slug)
      .then(setPkg)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-max px-page">
          {loading ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="skeleton h-[400px] rounded-2xl" />
                <div className="space-y-6">
                  <div className="skeleton h-10 w-2/3 rounded" />
                  <div className="skeleton h-8 w-1/3 rounded" />
                  <div className="skeleton h-24 w-full rounded" />
                  <div className="skeleton h-12 w-full rounded" />
                </div>
              </div>
            </div>
          ) : error || !pkg ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: 64 }}>
                error
              </span>
              <h1 className="font-playfair text-headline-lg text-on-surface mb-4">
                Gói dịch vụ không tồn tại
              </h1>
              <p className="font-hanken text-on-surface-variant mb-8">
                Có vẻ như gói dịch vụ đã bị gỡ bỏ hoặc liên kết không chính xác.
              </p>
              <Link
                href="/#services"
                className="bg-primary hover:bg-secondary text-on-primary font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-3.5 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Back Link */}
              <div className="mb-6">
                <Link
                  href="/#services"
                  className="inline-flex items-center gap-1.5 font-hanken text-xs font-semibold text-secondary hover:text-gold-dark uppercase tracking-widest transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Tất cả Gói dịch vụ
                </Link>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left: Thumbnail & Summary specifications */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative w-full h-[380px] rounded-2xl overflow-hidden concept-placeholder shadow-md bg-gray-50 flex items-center justify-center">
                    {pkg.thumbnailUrl ? (
                      <img
                        src={pkg.thumbnailUrl}
                        alt={pkg.packageName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 80 }}>
                        photo_camera
                      </span>
                    )}
                  </div>

                  {/* Highlights Spec Card */}
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 shadow-sm space-y-4">
                    <h3 className="font-playfair text-headline-sm font-bold text-on-surface">
                      Chi tiết gói chụp
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between text-sm font-hanken text-on-surface-variant">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>grid_view</span>
                          Bối cảnh &amp; Layout:
                        </span>
                        <span className="font-semibold text-on-surface">{pkg.layoutCount} layout</span>
                      </li>
                      <li className="flex items-center justify-between text-sm font-hanken text-on-surface-variant">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>checkroom</span>
                          Trang phục (Outfits):
                        </span>
                        <span className="font-semibold text-on-surface">{pkg.outfitCount} bộ</span>
                      </li>
                      <li className="flex items-center justify-between text-sm font-hanken text-on-surface-variant">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>photo_library</span>
                          Ảnh photoshop chỉnh sửa:
                        </span>
                        <span className="font-semibold text-on-surface">{pkg.editedPhotos} ảnh</span>
                      </li>
                      <li className="flex items-center justify-between text-sm font-hanken text-on-surface-variant">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>face_retouching_natural</span>
                          Chuyên viên trang điểm:
                        </span>
                        <span className="font-semibold text-on-surface">
                          {pkg.makeupPersonCount > 0 ? `${pkg.makeupPersonCount} makeup artist` : "Không có"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right: Pricing, Description & Detail list */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="inline-block font-hanken text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">
                      Gói dịch vụ cao cấp
                    </span>
                    <h1 className="font-playfair text-display-md md:text-display-lg text-on-surface mb-2 font-bold">
                      {pkg.packageName}
                    </h1>
                    <div className="font-playfair text-display-sm text-secondary font-bold mb-4">
                      {formatPrice(pkg.price)}
                    </div>
                    <p className="font-hanken text-body-lg text-on-surface-variant leading-relaxed">
                      {pkg.shortDescription}
                    </p>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-6">
                    <h3 className="font-playfair text-headline-sm font-bold text-on-surface mb-4">
                      Nội dung chi tiết dịch vụ
                    </h3>
                    {/* Dynamic HTML Content */}
                    <div
                      className="prose prose-luxury font-hanken text-body-md text-on-surface-variant leading-relaxed mb-8"
                      dangerouslySetInnerHTML={{ __html: pkg.detailContent }}
                    />
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/#booking?package=${pkg.id}`}
                      className="inline-flex w-full md:w-auto items-center justify-center gap-2 bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest px-10 py-4 shadow-md transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                      Đặt lịch ngay với gói này
                    </Link>
                  </div>
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
