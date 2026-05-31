"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { guestApi } from "@/lib/api";
import type { BlogDetail } from "@/types";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    guestApi
      .getBlogBySlug(slug)
      .then(setBlog)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-max px-page">
          {loading ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="skeleton h-8 w-1/3 rounded" />
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-96 w-full rounded-2xl" />
              <div className="space-y-3">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          ) : error || !blog ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-gray-300 mb-4" style={{ fontSize: 64 }}>
                error
              </span>
              <h1 className="font-playfair text-headline-lg text-on-surface mb-4">
                Bài viết không tồn tại
              </h1>
              <p className="font-hanken text-on-surface-variant mb-8">
                Có vẻ như bài viết đã bị gỡ bỏ hoặc liên kết không chính xác.
              </p>
              <Link
                href="/#blog"
                className="bg-primary hover:bg-secondary text-on-primary font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-3.5 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <article className="max-w-3xl mx-auto">
              {/* Back to Blog */}
              <div className="mb-6">
                <Link
                  href="/#blog"
                  className="inline-flex items-center gap-1.5 font-hanken text-xs font-semibold text-secondary hover:text-gold-dark uppercase tracking-widest transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Quay lại Blog
                </Link>
              </div>

              {/* Title & Metadata */}
              <header className="mb-10">
                <h1 className="font-playfair text-display-md md:text-display-lg text-on-surface mb-4 leading-tight">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-4 text-xs font-hanken text-on-surface-variant font-medium">
                  <span>LEON STUDIO TEAM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/60" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </header>

              {/* Banner Image */}
              {blog.thumbnailUrl && (
                <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden concept-placeholder shadow-md">
                  <img
                    src={blog.thumbnailUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Dynamic HTML Content */}
              <div
                className="prose prose-luxury font-hanken text-body-lg text-on-surface-variant mb-16 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Related Concept Promotion */}
              {blog.relatedConcept && (
                <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/10 mt-12 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden concept-placeholder bg-gray-100 flex-shrink-0">
                    {blog.relatedConcept.thumbnailUrl ? (
                      <img
                        src={blog.relatedConcept.thumbnailUrl}
                        alt={blog.relatedConcept.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 32 }}>
                          image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="font-hanken text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 block">
                      Concept gợi ý
                    </span>
                    <h3 className="font-playfair text-headline-md text-on-surface font-bold mb-2">
                      {blog.relatedConcept.title}
                    </h3>
                    <p className="font-hanken text-body-sm text-on-surface-variant mb-4 max-w-md line-clamp-2">
                      {blog.relatedConcept.description}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Link
                        href={`/concepts/${blog.relatedConcept.slug}`}
                        className="bg-primary hover:bg-secondary text-on-primary font-hanken text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors"
                      >
                        Khám phá concept
                      </Link>
                      <Link
                        href="/#booking"
                        className="border border-outline hover:bg-surface-container-high text-on-surface font-hanken text-xs font-semibold uppercase tracking-wider px-5 py-2.5 transition-colors"
                      >
                        Đặt lịch chụp ngay
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
