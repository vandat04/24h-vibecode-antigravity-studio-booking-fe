"use client";

import { useEffect, useState } from "react";
import { guestApi } from "@/lib/api";
import type { ProcessPhase, ProcessStep } from "@/types";

const DEFAULT_WORK_PROCESS: ProcessPhase[] = [
  {
    id: 1,
    phaseCode: "GIAI ĐOẠN 1",
    name: "TRƯỚC BUỔI CHỤP",
    sortOrder: 1,
    isDisplayed: true,
    steps: [
      {
        id: 101,
        phaseId: 1,
        stepNumber: "01",
        title: "Tư vấn",
        description: "Tư vấn, lắng nghe nhu cầu khách hàng.",
        iconName: "groups",
        sortOrder: 1,
        isDisplayed: true,
      },
    ],
  },
  {
    id: 2,
    phaseCode: "GIAI ĐOẠN 2",
    name: "TRONG BUỔI CHỤP",
    sortOrder: 2,
    isDisplayed: true,
    steps: [
      {
        id: 102,
        phaseId: 2,
        stepNumber: "02",
        title: "Chụp ảnh",
        description: "Thực hiện buổi chụp chuyên nghiệp.",
        iconName: "photo_camera",
        sortOrder: 2,
        isDisplayed: true,
      },
      {
        id: 103,
        phaseId: 2,
        stepNumber: "03",
        title: "Hậu kỳ",
        description: "Chỉnh sửa hình ảnh, hoàn thiện sản phẩm.",
        iconName: "face_retouching_natural",
        sortOrder: 3,
        isDisplayed: true,
      },
    ],
  },
  {
    id: 3,
    phaseCode: "GIAI ĐOẠN 3",
    name: "SAU BUỔI CHỤP",
    sortOrder: 3,
    isDisplayed: true,
    steps: [
      {
        id: 104,
        phaseId: 3,
        stepNumber: "04",
        title: "Bàn giao",
        description: "Gửi sản phẩm cho khách hàng.",
        iconName: "desktop_windows",
        sortOrder: 4,
        isDisplayed: true,
      },
      {
        id: 105,
        phaseId: 3,
        stepNumber: "05",
        title: "Chăm sóc",
        description: "Hỗ trợ, giải đáp sau dịch vụ.",
        iconName: "headset_mic",
        sortOrder: 5,
        isDisplayed: true,
      },
      {
        id: 106,
        phaseId: 3,
        stepNumber: "06",
        title: "Kết nối",
        description: "Tri ân, giữ liên hệ và giới thiệu.",
        iconName: "favorite",
        sortOrder: 6,
        isDisplayed: true,
      },
    ],
  },
];

export default function WorkProcessSection() {
  const [phases, setPhases] = useState<ProcessPhase[]>(DEFAULT_WORK_PROCESS);

  useEffect(() => {
    guestApi
      .getWorkProcess()
      .then((data) => {
        if (data && data.length > 0) {
          setPhases(data);
        }
      })
      .catch(() => {});
  }, []);

  // Flatten all displayed steps from all displayed phases
  const allSteps: { step: ProcessStep; phase: ProcessPhase; globalIdx: number }[] = [];
  let globalCount = 1;

  phases.forEach((phase) => {
    if (phase.steps && phase.steps.length > 0) {
      phase.steps.forEach((step) => {
        allSteps.push({
          step,
          phase,
          globalIdx: globalCount++,
        });
      });
    }
  });

  return (
    <section
      id="work-process"
      className="py-10 md:py-14 bg-[#FAF6F0] border-t border-b border-[#EDE4D8]"
      aria-labelledby="work-process-heading"
    >
      <div className="container-max px-page">
        {/* Main Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2
            id="work-process-heading"
            className="font-playfair text-2xl md:text-3xl lg:text-4xl text-zinc-900 font-extrabold uppercase tracking-tight mb-4"
          >
            Quy Trình Làm Việc
          </h2>
        </div>

        {/* Desktop Single Row Steps & Bottom Phase Timeline Bar */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Dotted Connector Line & Steps */}
          <div className="relative">
            {/* Horizontal Dotted Connector Line behind the number badges */}
            <div className="hidden md:block absolute top-[22px] left-[40px] right-[40px] h-[1px] border-b-2 border-dotted border-[#CBB59F] z-0" />

            {/* Flex container auto-expanding items evenly across the row */}
            <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4 relative z-10 w-full">
              {allSteps.map(({ step, globalIdx }) => {
                const numberFormatted =
                  step.stepNumber || (globalIdx < 10 ? `0${globalIdx}` : `${globalIdx}`);

                return (
                  <div
                    key={step.id || globalIdx}
                    className="flex-1 min-w-[120px] flex flex-col items-center text-center group px-1"
                  >
                    {/* Top Number Badge Circle */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-transform duration-300 group-hover:scale-110 mb-4 bg-[#FAF6F0] text-zinc-800 border-2 border-[#CBB59F]">
                      {numberFormatted}
                    </div>

                    {/* Icon Circle Container */}
                    <div className="w-16 h-16 rounded-full border border-[#D8C7B5] bg-white/90 shadow-sm flex items-center justify-center text-[#8C7156] mb-4 transition-all duration-300 group-hover:border-[#B89678]">
                      <span
                        className="material-symbols-outlined text-zinc-800"
                        style={{ fontSize: 30 }}
                      >
                        {step.iconName || "groups"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-playfair text-lg md:text-xl font-bold text-zinc-900 mb-2 leading-snug">
                      {step.title}
                    </h3>

                    {/* Content Description */}
                    <p className="font-hanken text-xs md:text-sm text-zinc-600 leading-relaxed max-w-[170px] mx-auto font-light">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Phase Timeline Grouping Bar */}
          <div className="pt-4">
            {/* Top Horizontal Solid Line with dots */}
            <div className="relative border-t border-[#D5C2AF] mb-6">
              <div className="hidden lg:flex justify-between absolute -top-1.5 left-0 right-0 px-[4%]">
                {phases.map((phase, pIdx) => (
                  <span
                    key={phase.id || pIdx}
                    className="w-3 h-3 rounded-full bg-[#B89678] border-2 border-[#FAF6F0]"
                  />
                ))}
              </div>
            </div>

            {/* Phase Pills and Names Container */}
            <div className="flex flex-col lg:flex-row items-center justify-around gap-6 lg:gap-4 text-center">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  {/* Phase Pill Badge */}
                  <span className="px-5 py-1.5 rounded-full bg-[#B89678] text-white text-[11px] md:text-xs font-semibold uppercase tracking-wider shadow-sm">
                    {phase.phaseCode}
                  </span>

                  {/* Phase Name / Subtitle */}
                  <span className="font-hanken text-xs md:text-sm font-bold tracking-widest text-zinc-900 uppercase">
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
