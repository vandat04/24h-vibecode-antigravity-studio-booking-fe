"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { guestApi } from "@/lib/api";
import type {
  PackageSummary,
  ConceptSummary,
  BookingRequest,
  BookingHoldRequest,
} from "@/types";

// ─── Fallback data khi backend chưa chạy ─────────────────────────────
const FALLBACK_PACKAGES: PackageSummary[] = [
  {
    id: 1, packageName: "GÓI BASIC I", slug: "basic-i", price: 2699000,
    shortDescription: "Gói cơ bản dành cho cá nhân, làm đẹp nhẹ nhàng",
    layoutCount: 2, outfitCount: 2, editedPhotos: 10, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 2, packageName: "GÓI STANDARD", slug: "standard", price: 3500000,
    shortDescription: "Gói tiêu chuẩn, trang điểm + 2 layout",
    layoutCount: 2, outfitCount: 2, editedPhotos: 15, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 3, packageName: "GÓI LUXURY", slug: "luxury", price: 4499000,
    shortDescription: "Gói cao cấp kèm trang phục của Studio",
    layoutCount: 2, outfitCount: 2, editedPhotos: 12, makeupPersonCount: 1,
    thumbnailUrl: "", isActive: true,
  },
  {
    id: 4, packageName: "GÓI COUPLE", slug: "couple", price: 5000000,
    shortDescription: "Chụp cặp đôi lãng mạn, trang điểm cho hai người",
    layoutCount: 3, outfitCount: 2, editedPhotos: 20, makeupPersonCount: 2,
    thumbnailUrl: "", isActive: true,
  },
];

// Khung giờ cố định của Studio
const STUDIO_SLOTS = ["07:30", "09:00", "10:30", "13:00", "14:30", "16:00"];

// Địa điểm mặc định
const DEFAULT_LOCATION = "Studio - 123 Nguyễn Văn Linh, Đà Nẵng";

type FormState = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebook: string;
  packageId: number;
  conceptId: number;
  shootDate: string;
  shootTimeSlot: string;  // "HH:mm" → sẽ convert sang "HH:mm:ss" khi gửi
  shootLocation: string;
  customerNotes: string;
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function BookingSection() {
  const [packages, setPackages] = useState<PackageSummary[]>(FALLBACK_PACKAGES);
  const [concepts, setConcepts] = useState<ConceptSummary[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  // States for Shoot Location selection
  const [studioAddress, setStudioAddress] = useState("Trần Cao Vân, Thanh Khê, Đà Nẵng");
  const [locationType, setLocationType] = useState<"studio" | "custom">("studio");

  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerFacebook: "",
    packageId: 0,
    conceptId: 0,
    shootDate: "",
    shootTimeSlot: "",
    shootLocation: "Tại Studio: Trần Cao Vân, Thanh Khê, Đà Nẵng",
    customerNotes: "",
  });

  // ─── Load packages & concepts khi mount ──────────────────────────
  useEffect(() => {
    guestApi.getPackages()
      .then((d) => { if (d.length) setPackages(d); })
      .catch(() => {});

    guestApi.getConcepts()
      .then(setConcepts)
      .catch(() => {});

    guestApi.getStudioInfo()
      .then((info) => {
        if (info && info.address) {
          setStudioAddress(info.address);
          setForm((prev) => ({ ...prev, shootLocation: "Tại Studio: " + info.address }));
        }
      })
      .catch(() => {});

    const handleSelectPackage = (e: Event) => {
      const customEvent = e as CustomEvent<{ packageId: number }>;
      if (customEvent.detail?.packageId) {
        setForm((prev) => ({ ...prev, packageId: customEvent.detail.packageId }));
      }
    };
    window.addEventListener("select-booking-package", handleSelectPackage);
    return () => window.removeEventListener("select-booking-package", handleSelectPackage);
  }, []);

  // ─── Load time slots khi date hoặc package/concept thay đổi ──────
  const loadSlots = useCallback(() => {
    if (!form.shootDate) return;
    setSlotsLoading(true);
    setAvailableSlots([]);
    setBookedSlots([]);
    setHoldToken(null);

    guestApi
      .getSchedule(
        form.shootDate,
        form.packageId || undefined,
        form.conceptId || undefined,
      )
      .then((res) => {
        setAvailableSlots(res.availableSlots);
        setBookedSlots(res.bookedSlots);
      })
      .catch(() => {
        // Fallback mock khi backend chưa chạy
        setAvailableSlots(["07:30", "09:00", "10:30", "13:00", "16:00"]);
        setBookedSlots(["14:30"]);
      })
      .finally(() => setSlotsLoading(false));
  }, [form.shootDate, form.packageId, form.conceptId]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // ─── Fade-up observer ────────────────────────────────────────────
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
  }, []);

  // ─── Handle form change ──────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "packageId" || name === "conceptId" ? Number(value) : value,
    }));
    // Reset time slot nếu ngày thay đổi
    if (name === "shootDate") setForm((prev) => ({ ...prev, shootDate: value, shootTimeSlot: "" }));
  };

  // ─── Chọn time slot + gọi Hold API ──────────────────────────────
  const handleSelectSlot = async (slot: string) => {
    setForm((prev) => ({ ...prev, shootTimeSlot: slot }));

    if (!form.packageId || !form.conceptId || !form.shootDate) return;

    // Gọi API Hold Slot
    const holdReq: BookingHoldRequest = {
      shootDate: form.shootDate,
      shootTimeSlot: `${slot}:00`, // "09:00" → "09:00:00"
      conceptId: form.conceptId,
      packageId: form.packageId,
    };

    try {
      const holdRes = await guestApi.holdSlot(holdReq);
      setHoldToken(holdRes.holdToken);
    } catch {
      // Hold thất bại không block, vẫn cho điền form
      setHoldToken(null);
    }
  };

  // ─── Submit form ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.customerName) return setErrorMsg("Vui lòng nhập họ và tên.");
    if (!form.customerPhone) return setErrorMsg("Vui lòng nhập số điện thoại.");
    if (!form.customerEmail) return setErrorMsg("Vui lòng nhập email nhận xác nhận.");
    if (!form.packageId) return setErrorMsg("Vui lòng chọn gói dịch vụ.");
    if (!form.conceptId) return setErrorMsg("Vui lòng chọn concept.");
    if (!form.shootDate) return setErrorMsg("Vui lòng chọn ngày chụp.");
    if (!form.shootTimeSlot) return setErrorMsg("Vui lòng chọn giờ chụp.");
    if (!form.shootLocation) return setErrorMsg("Vui lòng nhập địa điểm chụp.");

    setSubmitStatus("loading");
    setErrorMsg("");

    const payload: BookingRequest = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      customerFacebook: form.customerFacebook || undefined,
      shootDate: form.shootDate,
      shootTimeSlot: `${form.shootTimeSlot}:00`, // "09:00" → "09:00:00"
      shootLocation: form.shootLocation,
      packageId: form.packageId,
      conceptId: form.conceptId,
      customerNotes: form.customerNotes || undefined,
      holdToken: holdToken || undefined,
    };

    try {
      await guestApi.createBooking(payload);
      setSubmitStatus("success");
      setForm({
        customerName: "", customerPhone: "", customerEmail: "",
        customerFacebook: "", packageId: 0, conceptId: 0,
        shootDate: "", shootTimeSlot: "", shootLocation: DEFAULT_LOCATION,
        customerNotes: "",
      });
      setHoldToken(null);
    } catch (err: unknown) {
      setSubmitStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Đặt lịch thất bại. Vui lòng thử lại.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="section-padding bg-primary"
      aria-labelledby="booking-heading"
    >
      <div className="container-max px-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* ─── Left: Info ──────────────────────────────────────── */}
          <div>
            <p className="fade-up font-hanken text-label-sm text-gold-luxury uppercase tracking-widest mb-4">
              Đặt lịch
            </p>
            <h2
              id="booking-heading"
              className="fade-up font-playfair text-headline-lg md:text-display-lg text-on-primary mb-6"
            >
              Bắt đầu hành trình
              <br />
              <span className="italic text-gold-luxury">tỏa sáng</span>
            </h2>
            <p className="fade-up font-hanken text-body-lg text-on-primary/60 mb-10 leading-relaxed">
              Điền thông tin để đặt lịch chụp hình và trang điểm với đội ngũ chuyên nghiệp.
              Chúng tôi sẽ gửi xác nhận qua email trong vòng 2 giờ.
            </p>

            {/* Steps */}
            <div className="space-y-6 fade-up">
              {[
                { icon: "edit_note", label: "Điền thông tin", desc: "Chọn gói dịch vụ, concept và thời gian" },
                { icon: "notifications_active", label: "Nhận email xác nhận", desc: "Chúng tôi liên hệ trong 2 giờ" },
                { icon: "photo_camera", label: "Đến chụp hình", desc: "Tận hưởng trải nghiệm đẳng cấp" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border border-gold-luxury/40 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>
                      {step.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-hanken text-on-primary font-medium">{step.label}</div>
                    <div className="font-hanken text-on-primary/50 text-sm">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lookup link */}
            <div className="mt-10 fade-up">
              <a
                href="/lookup"
                className="inline-flex items-center gap-2 font-hanken text-sm text-on-primary/40 hover:text-gold-luxury transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
                Tra cứu lịch đặt đã có
              </a>
            </div>
          </div>

          {/* ─── Right: Form ─────────────────────────────────────── */}
          <div className="fade-up bg-white p-8 md:p-10 rounded-2xl shadow-2xl">
            {submitStatus === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-600" style={{ fontSize: 32 }}>
                    check_circle
                  </span>
                </div>
                <h3 className="font-playfair text-headline-md text-on-surface mb-2">
                  Đặt lịch thành công!
                </h3>
                <p className="font-hanken text-on-surface-variant text-sm">
                  Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.
                </p>
                <button
                  className="mt-6 bg-primary text-on-primary font-hanken text-sm font-semibold uppercase tracking-wider px-8 py-3 transition-colors hover:bg-secondary"
                  onClick={() => setSubmitStatus("idle")}
                >
                  Đặt lịch khác
                </button>
              </div>
            ) : (
              <form id="booking-form" onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customerName" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerName" name="customerName" type="text" required
                      value={form.customerName} onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customerPhone" name="customerPhone" type="tel" required
                      value={form.customerPhone} onChange={handleChange}
                      placeholder="0123456789"
                      className="input-luxury"
                    />
                  </div>
                </div>

                {/* Email — BẮT BUỘC (backend gửi email xác nhận) */}
                <div>
                  <label htmlFor="customerEmail" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Email <span className="text-red-500">*</span>
                    <span className="text-on-surface-variant/50 normal-case ml-1">(nhận xác nhận)</span>
                  </label>
                  <input
                    id="customerEmail" name="customerEmail" type="email" required
                    value={form.customerEmail} onChange={handleChange}
                    placeholder="email@example.com"
                    className="input-luxury"
                  />
                </div>

                {/* Package — BẮT BUỘC */}
                <div>
                  <label htmlFor="packageId" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Gói dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="packageId" name="packageId" required
                    value={form.packageId} onChange={handleChange}
                    className="input-luxury bg-transparent"
                  >
                    <option value={0}>-- Chọn gói dịch vụ --</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.packageName} —{" "}
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Concept — BẮT BUỘC */}
                <div>
                  <label htmlFor="conceptId" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Concept mong muốn <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="conceptId" name="conceptId" required
                    value={form.conceptId} onChange={handleChange}
                    className="input-luxury bg-transparent"
                  >
                    <option value={0}>-- Chọn concept --</option>
                    {concepts.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                    {concepts.length === 0 && (
                      <option disabled value={-1}>Đang tải concept...</option>
                    )}
                  </select>
                </div>

                {/* Shoot Location */}
                <div>
                  <label className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Địa điểm chụp <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Selector Options */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType("studio");
                        setForm((prev) => ({ ...prev, shootLocation: "Tại Studio: " + studioAddress }));
                      }}
                      className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-200 cursor-pointer ${
                        locationType === "studio"
                          ? "border-secondary bg-secondary/5 text-secondary"
                          : "border-outline/20 text-on-surface-variant hover:border-outline/50"
                      }`}
                    >
                      <span className="material-symbols-outlined mb-1" style={{ fontSize: 20 }}>location_on</span>
                      <span className="font-hanken text-xs font-bold uppercase tracking-wider">Tại Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationType("custom");
                        setForm((prev) => ({ ...prev, shootLocation: "" }));
                      }}
                      className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all duration-200 cursor-pointer ${
                        locationType === "custom"
                          ? "border-secondary bg-secondary/5 text-secondary"
                          : "border-outline/20 text-on-surface-variant hover:border-outline/50"
                      }`}
                    >
                      <span className="material-symbols-outlined mb-1" style={{ fontSize: 20 }}>edit_location_alt</span>
                      <span className="font-hanken text-xs font-bold uppercase tracking-wider">Khác (Tự nhập)</span>
                    </button>
                  </div>

                  {/* Dynamic Render based on Location Type */}
                  {locationType === "studio" ? (
                    <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10 font-hanken text-xs text-on-surface-variant">
                      <span className="font-bold text-on-surface block mb-1">LEON Studio</span>
                      Địa chỉ: {studioAddress}
                    </div>
                  ) : (
                    <input
                      id="shootLocation"
                      name="shootLocation"
                      type="text"
                      required
                      value={form.shootLocation.startsWith("Tại Studio: ") ? "" : form.shootLocation}
                      onChange={(e) => setForm((prev) => ({ ...prev, shootLocation: e.target.value }))}
                      placeholder="Ví dụ: Phim trường Santorini, Biển Mỹ Khê, Hội An..."
                      className="input-luxury"
                    />
                  )}
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="shootDate" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Ngày chụp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shootDate" name="shootDate" type="date" required
                    min={today}
                    value={form.shootDate} onChange={handleChange}
                    className="input-luxury"
                  />
                </div>

                {/* Time Slots */}
                {form.shootDate && (
                  <div>
                    <label className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
                      Khung giờ <span className="text-red-500">*</span>
                      {holdToken && (
                        <span className="ml-2 text-green-600 normal-case font-normal">
                          ✓ Đã giữ chỗ tạm thời
                        </span>
                      )}
                    </label>
                    {slotsLoading ? (
                      <div className="flex gap-2 flex-wrap">
                        {STUDIO_SLOTS.map((_, i) => (
                          <div key={i} className="skeleton h-10 w-20 rounded" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {STUDIO_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isAvailable = availableSlots.includes(slot);
                          const isSelected = form.shootTimeSlot === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => handleSelectSlot(slot)}
                              className={`font-hanken text-sm px-4 py-2 border transition-all duration-200 ${
                                isSelected
                                  ? "bg-secondary border-secondary text-on-secondary"
                                  : isBooked
                                  ? "border-surface-container-highest text-on-surface-variant/30 cursor-not-allowed line-through"
                                  : isAvailable
                                  ? "border-outline/30 text-on-surface hover:border-secondary hover:text-secondary"
                                  : "border-outline/20 text-on-surface-variant/50"
                              }`}
                            >
                              {slot}
                              {isBooked && <span className="ml-1 text-xs">(hết)</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label htmlFor="customerNotes" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Ghi chú
                  </label>
                  <textarea
                    id="customerNotes" name="customerNotes" rows={3}
                    value={form.customerNotes} onChange={handleChange}
                    placeholder="Yêu cầu đặc biệt, góc chụp, tông màu mong muốn..."
                    className="input-luxury resize-none"
                  />
                </div>

                {/* Error */}
                {(submitStatus === "error" || errorMsg) && (
                  <div className="bg-error/10 border border-error/30 text-error font-hanken text-sm px-4 py-3 rounded flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  id="booking-submit-btn"
                  type="submit"
                  disabled={submitStatus === "loading"}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest py-4 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {submitStatus === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                        progress_activity
                      </span>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Xác nhận đặt lịch"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
