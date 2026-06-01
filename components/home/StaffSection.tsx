"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { guestApi } from "@/lib/api";
import type { StaffMember } from "@/types";

const FALLBACK_STAFF: StaffMember[] = [
  {
    profileId: 1, userId: 2, fullName: "Trần Ngọc Linh", roleName: "MAKEUP",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213775/linh_l6etep.jpg",
    bio: "Makeup Beauty chuyên nghiệp", experienceDetail: "Trang điểm beauty, kỷ yếu, couple",
    yearsOfExperience: 5, facebookUrl: "https://facebook.com/linh", instagramUrl: "https://instagram.com/linh",
    tiktokUrl: "https://tiktok.com/@linh"
  },
  {
    profileId: 2, userId: 3, fullName: "Lê Thu Hương", roleName: "MAKEUP",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213775/huong_gvkewm.jpg",
    bio: "Makeup phong cách Hàn Quốc", experienceDetail: "Chuyên makeup cô dâu và beauty",
    yearsOfExperience: 6, facebookUrl: "https://facebook.com/huong", instagramUrl: "https://instagram.com/huong",
    tiktokUrl: "https://tiktok.com/@huong"
  },
  {
    profileId: 3, userId: 4, fullName: "Phạm Minh Thảo", roleName: "MAKEUP",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213776/thao_jskdsy.png",
    bio: "Makeup trẻ trung", experienceDetail: "Beauty concept hiện đại",
    yearsOfExperience: 4, facebookUrl: "https://facebook.com/thao", instagramUrl: "https://instagram.com/thao",
    tiktokUrl: "https://tiktok.com/@thao"
  },
  {
    profileId: 4, userId: 5, fullName: "Nguyễn Văn Hải", roleName: "PHOTOGRAPHER",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213774/hai_m8zhf6.webp",
    bio: "Photographer chính", experienceDetail: "Beauty và Outdoor",
    yearsOfExperience: 8, facebookUrl: "https://facebook.com/hai", instagramUrl: "https://instagram.com/hai"
  },
  {
    profileId: 5, userId: 6, fullName: "Trần Quốc Khoa", roleName: "PHOTOGRAPHER",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213774/khoa_qz1fb2.webp",
    bio: "Photographer", experienceDetail: "Chuyên Couple",
    yearsOfExperience: 5, facebookUrl: "https://facebook.com/khoa", instagramUrl: "https://instagram.com/khoa"
  },
  {
    profileId: 6, userId: 7, fullName: "Lê Anh Tuấn", roleName: "PHOTOGRAPHER",
    avatarUrl: "https://res.cloudinary.com/do8uakd0l/image/upload/v1780213775/tuan_au9z5m.jpg",
    bio: "Photographer", experienceDetail: "Beauty Studio",
    yearsOfExperience: 6, facebookUrl: "https://facebook.com/tuan", instagramUrl: "https://instagram.com/tuan"
  },
];

const TABS: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Photographer", value: "PHOTOGRAPHER" },
  { label: "Makeup Artist", value: "MAKEUP" },
];

export default function StaffSection() {
  const [staff, setStaff] = useState<StaffMember[]>(FALLBACK_STAFF);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    guestApi
      .getStaff()
      .then((data) => setStaff(data.length ? data : FALLBACK_STAFF))
      .catch(() => setStaff(FALLBACK_STAFF))
      .finally(() => setLoading(false));
  }, []);

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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading, activeTab]);

  const filtered =
    activeTab === ""
      ? staff
      : staff.filter((s) => s.roleName === activeTab);

  return (
    <section
      id="team"
      ref={sectionRef}
      className="section-padding bg-surface-container-low"
      aria-labelledby="team-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="team-heading"
            className="fade-up font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-3"
          >
            Gặp Gỡ Đội Ngũ Của Chúng Tôi
          </h2>
          <p className="fade-up font-hanken text-body-md text-on-surface-variant max-w-none mx-auto">
            Gặp gỡ những bàn tay nghệ thuật đứng sau các khung hình đẳng cấp tại LEON STUDIO
          </p>
        </div>

        {/* Tab Filter */}
        <div className="fade-up flex justify-center gap-2 mb-12">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`font-hanken text-xs font-semibold uppercase tracking-widest px-5 py-2.5 border transition-all duration-200 ${
                activeTab === tab.value
                  ? "bg-secondary border-secondary text-on-secondary"
                  : "border-outline/30 text-on-surface-variant hover:border-secondary hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((member) => (
              <article
                key={member.profileId}
                className="fade-up bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col group"
              >
                {/* Avatar Wrapper */}
                <div className="relative h-72 w-full overflow-hidden concept-placeholder">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                      <span className="material-symbols-outlined text-gray-400" style={{ fontSize: 48 }}>
                        face
                      </span>
                    </div>
                  )}
                  {/* Years of Experience Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white font-hanken text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {member.yearsOfExperience} năm kinh nghiệm
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <span className="font-hanken text-[11px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">
                    {member.roleName === "PHOTOGRAPHER" ? "Photographer" : "Makeup Artist"}
                  </span>
                  <h3 className="font-playfair text-headline-md text-on-surface mb-2 font-bold group-hover:text-secondary transition-colors">
                    {member.fullName}
                  </h3>
                  <p className="font-hanken text-body-sm text-on-surface-variant leading-relaxed flex-1 mb-5 italic text-sm">
                    "{member.bio}"
                  </p>
                  
                  <div className="border-t border-outline-variant/10 pt-4 flex items-center justify-between">
                    <span className="font-hanken text-xs text-on-surface-variant truncate max-w-[150px]">
                      {member.experienceDetail}
                    </span>
                    {/* Social links */}
                    <div className="flex gap-2">
                      {member.facebookUrl && (
                        <a
                          href={member.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                          aria-label="Facebook Profile"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>groups</span>
                        </a>
                      )}
                      {member.instagramUrl && (
                        <a
                          href={member.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                          aria-label="Instagram Profile"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_camera</span>
                        </a>
                      )}
                      {member.tiktokUrl && (
                        <a
                          href={member.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors"
                          aria-label="TikTok Profile"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>videocam</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
