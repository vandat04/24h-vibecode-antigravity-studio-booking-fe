"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { guestApi } from "@/lib/api";
import type { StudioInfo } from "@/types";

const FOOTER_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/#services" },
  { label: "Concept", href: "/#concepts" },
  { label: "Đội ngũ", href: "/#team" },
  { label: "Đặt lịch", href: "/#booking" },
  { label: "Blog", href: "/#blog" },
];

export default function Footer() {
  const [info, setInfo] = useState<StudioInfo | null>(null);

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const studioName = info?.studioName || "LEON STUDIO";
  const address = info?.address || "Trần Cao Vân, Thanh Khê, Đà Nẵng";
  const phone = info?.phone || "0905123456";
  const email = info?.email || "leon.studio.396@gmail.com";
  const facebookUrl = info?.facebookUrl || "https://www.facebook.com/leonstudio.concept/";
  const zaloUrl = info?.zaloUrl || "https://zalo.me/nicstudio";
  const youtubeUrl = info?.youtubeUrl || "https://youtube.com/nicstudio";

  const splitName = studioName.split(" ");
  const firstWord = splitName[0] || "LEON";
  const restOfName = splitName.slice(1).join(" ") || "STUDIO";

  return (
    <footer className="bg-primary text-on-primary">
      {/* Top Section */}
      <div className="container-max px-page pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-playfair font-bold text-2xl tracking-widest uppercase text-white block">
                {firstWord}
              </span>
              <span className="font-hanken font-light text-xs tracking-[0.4em] uppercase text-gold-luxury block">
                {restOfName}
              </span>
            </div>
            <p className="text-white/60 font-hanken text-sm leading-relaxed max-w-xs">
              {info?.introduction ||
                "Chúng tôi tin rằng mỗi khoảnh khắc đều xứng đáng được ghi lại bằng nghệ thuật. LEON STUDIO - Nơi vẻ đẹp được nâng tầm."}
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-gold-luxury hover:text-gold-luxury transition-all duration-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    groups
                  </span>
                </a>
              )}
              {zaloUrl && (
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-gold-luxury hover:text-gold-luxury transition-all duration-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    chat
                  </span>
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-gold-luxury hover:text-gold-luxury transition-all duration-300"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    videocam
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-hanken text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Khám phá
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-gold-luxury font-hanken text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-hanken text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 font-hanken text-sm">
                <span className="material-symbols-outlined mt-0.5 text-gold-luxury" style={{ fontSize: 16 }}>
                  location_on
                </span>
                <span>
                  {address}
                  {info?.googleMapUrl && (
                    <a
                      href={info.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-luxury hover:underline text-xs block mt-1"
                    >
                      Xem trên bản đồ &rarr;
                    </a>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/60 font-hanken text-sm">
                <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 16 }}>
                  phone
                </span>
                <a href={`tel:${phone}`} className="hover:text-gold-luxury transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/60 font-hanken text-sm">
                <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 16 }}>
                  mail
                </span>
                <a href={`mailto:${email}`} className="hover:text-gold-luxury transition-colors truncate block max-w-[200px]">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/60 font-hanken text-sm">
                <span className="material-symbols-outlined mt-0.5 text-gold-luxury" style={{ fontSize: 16 }}>
                  schedule
                </span>
                <div>
                  <span>T2 - CN: 08:00 - 20:00</span>
                  {info?.workingProcess && (
                    <p className="text-[11px] text-white/40 mt-1 leading-snug">
                      Quy trình: {info.workingProcess}
                    </p>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Bottom */}
      <div className="container-max px-page py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-white/40 font-hanken text-xs">
          © {new Date().getFullYear()} {studioName.toUpperCase()}. Tất cả quyền được bảo lưu.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/login?role=admin"
            className="text-white/30 hover:text-white/60 font-hanken text-xs transition-colors"
          >
            Admin
          </Link>
          <Link
            href="/login?role=staff"
            className="text-white/30 hover:text-white/60 font-hanken text-xs transition-colors"
          >
            Nhân viên
          </Link>
        </div>
      </div>
    </footer>
  );
}
