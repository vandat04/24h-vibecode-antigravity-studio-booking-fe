"use client";

import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { CoreValue } from "@/types";

const DEFAULT_CORE_VALUES: CoreValue[] = [
  {
    id: 1,
    title: "Chất lượng và Chuyên nghiệp",
    description:
      "LEON Studio cam kết mang đến sản phẩm chất lượng cao với quy trình làm việc chuyên nghiệp, đúng tiến độ, minh bạch và luôn đảm bảo sự hài lòng của khách hàng.",
    iconName: "verified_user",
    sortOrder: 1,
    isDisplayed: true,
  },
  {
    id: 2,
    title: "Sáng tạo và Đổi mới",
    description:
      "Không ngừng đổi mới ý tưởng, cập nhật xu hướng và công nghệ để tạo ra những concept độc đáo, nâng cao chất lượng dịch vụ và giá trị thương hiệu.",
    iconName: "lightbulb",
    sortOrder: 2,
    isDisplayed: true,
  },
  {
    id: 3,
    title: "Khách hàng là trung tâm",
    description:
      "Luôn lắng nghe, thấu hiểu nhu cầu khách hàng để tư vấn phù hợp, mang đến trải nghiệm dịch vụ tốt và xây dựng mối quan hệ bền vững.",
    iconName: "favorite",
    sortOrder: 3,
    isDisplayed: true,
  },
];

export default function CoreValuesSection() {
  const [items, setItems] = useState<CoreValue[]>(DEFAULT_CORE_VALUES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    guestApi
      .getCoreValues()
      .then((data) => {
        if (data && data.length > 0) {
          setItems(data);
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  return (
    <section
      id="core-values"
      className="py-10 md:py-14 bg-[#FAF6F0] border-t border-b border-[#EDE4D8]"
      aria-labelledby="core-values-heading"
    >
      <div className="container-max px-page">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2
            id="core-values-heading"
            className="font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-4"
          >
            Giá Trị Cốt Lõi
          </h2>

          {/* Elegant decorative line with dot */}
          <div className="flex items-center justify-center gap-3 my-3">
            <span className="w-10 h-[1px] bg-[#CBB59F]" />
            <span className="w-2 h-2 rounded-full bg-[#A88B70]" />
            <span className="w-10 h-[1px] bg-[#CBB59F]" />
          </div>

          <p className="font-hanken text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-[#9A7B5F] mt-3">
            THIẾT KẾ TRONG MỖI GIÁ TRỊ MÀU
          </p>
        </div>

        {/* 3-Column Single Row Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 max-w-6xl mx-auto">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex flex-col items-center text-center px-6 md:px-8 lg:px-12 ${
                idx !== items.length - 1
                  ? "md:border-r md:border-[#E5DACE]"
                  : ""
              }`}
            >
              {/* Icon Container */}
              <div className="w-20 h-20 rounded-full border border-[#D5C2AF] bg-white/80 shadow-sm flex items-center justify-center mb-6 text-[#8C7156] transition-transform duration-300 hover:scale-105">
                <span
                  className="material-symbols-outlined text-zinc-800"
                  style={{ fontSize: 36 }}
                >
                  {item.iconName || "verified_user"}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-playfair text-base sm:text-lg md:text-lg lg:text-xl font-bold text-zinc-900 mb-4 leading-snug whitespace-nowrap">
                {item.title}
              </h3>

              {/* Content Description */}
              <p className="font-hanken text-sm md:text-base text-zinc-600 leading-relaxed font-light">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
