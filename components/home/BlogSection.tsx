"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { guestApi } from "@/lib/api";
import type { BlogSummary, BlogDetail } from "@/types";

const FALLBACK_BLOGS: BlogSummary[] = [
  {
    id: 1,
    title: "5 mẹo tạo dáng tự nhiên khi chụp ảnh Beauty",
    slug: "meo-tao-dang-tu-nhien",
    thumbnailUrl: "",
    status: "PUBLISHED",
    createdAt: "2025-06-01T08:00:00",
    updatedAt: "2025-06-01T08:00:00",
    relatedConceptTitle: "SWEET ANGEL",
    relatedConceptSlug: "sweet-angel",
  },
  {
    id: 2,
    title: "Nên mặc gì khi đi chụp ảnh cặp đôi?",
    slug: "mac-gi-khi-chup-anh-cap-doi",
    thumbnailUrl: "",
    status: "PUBLISHED",
    createdAt: "2025-05-28T10:00:00",
    updatedAt: "2025-05-28T10:00:00",
    relatedConceptTitle: "Dark Romance",
    relatedConceptSlug: "dark-romance",
  },
  {
    id: 3,
    title: "Trang điểm theo từng loại da: Bí quyết từ chuyên gia",
    slug: "trang-diem-theo-loai-da",
    thumbnailUrl: "",
    status: "PUBLISHED",
    createdAt: "2025-04-28T10:00:00",
    updatedAt: "2025-04-28T10:00:00",
  },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogSummary[]>(FALLBACK_BLOGS);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [blogDetail, setBlogDetail] = useState<BlogDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    guestApi
      .getBlogs()
      .then((d) => {
        if (d.length) setPosts(d);
      })
      .catch(() => {});
  }, []);

  // Fetch full blog details when a slug is selected for the modal
  useEffect(() => {
    if (!selectedBlogSlug) {
      setBlogDetail(null);
      return;
    }
    setModalLoading(true);
    guestApi
      .getBlogBySlug(selectedBlogSlug)
      .then(setBlogDetail)
      .catch(() => {
        // Fallback mock detail content if backend request fails
        const summary = posts.find((p) => p.slug === selectedBlogSlug);
        if (summary) {
          setBlogDetail({
            ...summary,
            content: `
              <h2>Bí quyết tạo dáng chuẩn thần thái</h2>
              <p>Để có được những bức ảnh đẹp tự nhiên, yếu tố quan trọng nhất là sự tự tin và thả lỏng cơ thể. Hãy tưởng tượng bạn đang trò chuyện cùng một người bạn thân thiết thay vì đứng trước ống kính máy quay.</p>
              <h3>1. Tập trung vào hơi thở</h3>
              <p>Hãy hít thở sâu, thả lỏng đôi vai và mở nhẹ bờ môi. Động tác này giúp cơ mặt của bạn trông tự nhiên, rạng rỡ và tránh được sự gượng gạo.</p>
              <h3>2. Tận dụng đôi tay</h3>
              <p>Tránh để tay buông thõng đơ cứng. Bạn có thể vuốt nhẹ mái tóc, chạm nhẹ vào cằm, hoặc cầm một phụ kiện nhỏ như cốc trà, cuốn sách để tạo cảm giác tự nhiên nhất.</p>
            `,
          });
        }
      })
      .finally(() => setModalLoading(false));
  }, [selectedBlogSlug, posts]);

  // Fade-up observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedBlogSlug) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBlogSlug]);

  const handleBookFromBlog = () => {
    setSelectedBlogSlug(null);
    const bookingEl = document.getElementById("booking");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="section-padding bg-background"
      aria-labelledby="blog-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="blog-heading"
            className="fade-up font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight"
          >
            Blog &amp; Cảm Hứng
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post) => (
            <article
              key={post.id}
              className="fade-up group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 flex flex-col cursor-pointer"
              onClick={() => setSelectedBlogSlug(post.slug)}
            >
              {/* Thumbnail */}
              <div className="relative h-52 overflow-hidden concept-placeholder bg-gray-50 flex items-center justify-center">
                {post.thumbnailUrl ? (
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 36 }}>
                      article
                    </span>
                    {post.relatedConceptTitle && (
                      <span className="font-hanken text-xs text-gray-400 uppercase tracking-wider">
                        {post.relatedConceptTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Concept tag + Date */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  {post.relatedConceptTitle && (
                    <span className="font-hanken text-label-sm text-secondary uppercase tracking-widest truncate">
                      {post.relatedConceptTitle}
                    </span>
                  )}
                  <span className="font-hanken text-xs text-on-surface-variant flex-shrink-0 ml-auto">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                <h3 className="font-playfair text-headline-md text-on-surface mb-5 group-hover:text-secondary transition-colors duration-300 line-clamp-2 flex-1 font-bold">
                  {post.title}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlogSlug(post.slug);
                  }}
                  className="flex items-center gap-1.5 font-hanken text-sm font-semibold text-secondary hover:text-gold-dark transition-colors mt-auto text-left"
                >
                  Đọc tiếp
                  <span
                    className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
                    style={{ fontSize: 16 }}
                  >
                    arrow_forward
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ─── Premium Blog Detail Modal Popup ─── */}
      {selectedBlogSlug && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={() => setSelectedBlogSlug(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-outline-variant/10 flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedBlogSlug(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-on-surface hover:text-secondary flex items-center justify-center transition-colors"
              aria-label="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {modalLoading ? (
              <div className="p-12 space-y-6">
                <div className="skeleton h-6 w-1/4 rounded" />
                <div className="skeleton h-10 w-full rounded" />
                <div className="skeleton h-64 w-full rounded-xl" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-5/6 rounded" />
                </div>
              </div>
            ) : blogDetail ? (
              <div>
                {/* Banner Image */}
                <div className="relative h-64 md:h-80 w-full bg-gray-50 flex items-center justify-center">
                  {blogDetail.thumbnailUrl ? (
                    <Image
                      src={blogDetail.thumbnailUrl}
                      alt={blogDetail.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 64 }}>
                      article
                    </span>
                  )}
                </div>

                {/* Main Content Side */}
                <div className="p-6 md:p-10 space-y-6">
                  {/* Category/Tag & Date */}
                  <div className="flex items-center gap-3">
                    {blogDetail.relatedConceptTitle && (
                      <span className="font-hanken text-[10px] font-bold text-secondary bg-secondary/10 uppercase tracking-widest px-3 py-1 rounded-full">
                        {blogDetail.relatedConceptTitle}
                      </span>
                    )}
                    <span className="font-hanken text-xs text-on-surface-variant font-semibold">
                      {formatDate(blogDetail.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-playfair text-display-md text-on-surface font-bold leading-tight">
                    {blogDetail.title}
                  </h3>

                  {/* HTML Content */}
                  <div
                    className="prose prose-luxury font-hanken text-body-md text-on-surface-variant leading-relaxed text-sm border-t border-outline-variant/10 pt-6"
                    dangerouslySetInnerHTML={{ __html: blogDetail.content }}
                  />

                  {/* Related Concept Promotion */}
                  {blogDetail.relatedConcept && (
                    <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex flex-col sm:flex-row gap-5 items-center mt-8">
                      <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden concept-placeholder bg-gray-50 flex-shrink-0">
                        {blogDetail.relatedConcept.thumbnailUrl ? (
                          <img
                            src={blogDetail.relatedConcept.thumbnailUrl}
                            alt={blogDetail.relatedConcept.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-gray-400 absolute inset-0 flex items-center justify-center" style={{ fontSize: 24 }}>
                            image
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="font-hanken text-[9px] font-bold text-secondary uppercase tracking-widest mb-0.5 block">
                          Concept liên quan
                        </span>
                        <h4 className="font-playfair text-headline-sm text-on-surface font-bold mb-1">
                          {blogDetail.relatedConcept.title}
                        </h4>
                        <p className="font-hanken text-xs text-on-surface-variant line-clamp-2 mb-3">
                          {blogDetail.relatedConcept.description}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <Link
                            href={`/concepts/${blogDetail.relatedConcept.slug}`}
                            className="bg-primary hover:bg-secondary text-on-primary font-hanken text-[10px] font-bold uppercase tracking-wider px-4 py-2 transition-colors"
                          >
                            Khám phá
                          </Link>
                          <button
                            onClick={handleBookFromBlog}
                            className="border border-outline hover:bg-surface-container-high text-on-surface font-hanken text-[10px] font-bold uppercase tracking-wider px-4 py-2 transition-colors"
                          >
                            Đặt lịch ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-on-surface-variant font-hanken">
                Không thể tải nội dung bài viết. Vui lòng thử lại sau.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
