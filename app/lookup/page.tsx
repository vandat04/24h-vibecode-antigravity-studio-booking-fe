"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { guestApi } from "@/lib/api";
import type { BookingLookupResponse } from "@/types";

type LookupStatus = "idle" | "loading" | "success" | "error";

export default function LookupPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [booking, setBooking] = useState<BookingLookupResponse | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setErrorMsg("Vui lòng nhập số điện thoại.");
    if (!code) return setErrorMsg("Vui lòng nhập mã đặt lịch.");

    setStatus("loading");
    setErrorMsg("");
    setBooking(null);

    try {
      const data = await guestApi.lookupBooking(phone.trim(), code.trim());
      setBooking(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Không tìm thấy thông tin đặt lịch.");
    }
  };

  const getStatusBadgeClass = (statusStr: string) => {
    switch (statusStr) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ASSIGNED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (statusStr: string) => {
    switch (statusStr) {
      case "PENDING": return "Chờ xác nhận";
      case "CONFIRMED": return "Đã xác nhận";
      case "ASSIGNED": return "Đã phân công ê-kíp";
      case "COMPLETED": return "Đã hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return statusStr;
    }
  };

  const getPaymentBadgeClass = (payStr: string) => {
    switch (payStr) {
      case "UNPAID":
        return "bg-red-100 text-red-800 border-red-200";
      case "DEPOSITED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentLabel = (payStr: string) => {
    switch (payStr) {
      case "UNPAID": return "Chưa thanh toán";
      case "DEPOSITED": return "Đã cọc giữ chỗ";
      case "PAID": return "Đã hoàn tất thanh toán";
      default: return payStr;
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low pt-28 pb-16">
        <div className="container-max px-page">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-playfair text-headline-lg md:text-display-md text-on-surface mb-3">
              Tra cứu tiến độ đặt lịch
            </h1>
            <p className="font-hanken text-body-md text-on-surface-variant max-w-md mx-auto">
              Nhập số điện thoại và mã đặt lịch (gửi kèm trong email) để theo dõi trạng thái ca chụp của bạn.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Search Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md mb-8">
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0901234567"
                      className="input-luxury w-full"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="code" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Mã đặt lịch <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ví dụ: STB-20260820-A3FBX"
                      className="input-luxury w-full uppercase"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-error/10 border border-error/20 text-error font-hanken text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest py-3.5 transition-all duration-200 active:scale-98 disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                        progress_activity
                      </span>
                      Đang tra cứu...
                    </span>
                  ) : (
                    "Tra cứu ngay"
                  )}
                </button>
              </form>
            </div>

            {/* Results Details */}
            {status === "success" && booking && (
              <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden fade-up visible">
                {/* Header card */}
                <div className="bg-primary p-6 md:p-8 text-on-primary">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-2">
                    <span className="font-hanken text-xs text-gold-luxury uppercase tracking-widest font-semibold">
                      Mã đơn đặt lịch
                    </span>
                    <span className={`px-3 py-1 border text-xs font-semibold uppercase rounded-full ${getStatusBadgeClass(booking.bookingStatus)}`}>
                      {getStatusLabel(booking.bookingStatus)}
                    </span>
                  </div>
                  <h2 className="font-playfair text-headline-lg font-bold text-white mb-2">
                    {booking.bookingCode}
                  </h2>
                  <p className="font-hanken text-sm text-on-primary/60">
                    Khách hàng: <span className="font-medium text-white">{booking.customerName}</span>
                  </p>
                </div>

                {/* Details Section */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-outline-variant/10">
                    <div>
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Gói dịch vụ
                      </span>
                      <span className="text-on-surface font-playfair text-headline-sm font-bold block">
                        {booking.packageName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Concept chụp
                      </span>
                      <span className="text-on-surface font-playfair text-headline-sm font-bold block">
                        {booking.conceptTitle}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Thời gian chụp
                      </span>
                      <span className="text-on-surface font-hanken text-sm font-semibold block">
                        {booking.shootDate} vào lúc {booking.shootTimeSlot.substring(0, 5)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Địa điểm chụp
                      </span>
                      <span className="text-on-surface font-hanken text-sm block">
                        {booking.shootLocation}
                      </span>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="pb-6 border-b border-outline-variant/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Thanh toán
                      </span>
                      <span className={`inline-block px-3 py-1 border text-xs font-semibold rounded-full ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                        {getPaymentLabel(booking.paymentStatus)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-1">
                        Tổng cộng
                      </span>
                      <span className="text-secondary font-playfair text-headline-md font-bold block">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Ê-kíp thực hiện */}
                  <div>
                    <span className="text-xs text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-3">
                      Ê-kíp được phân công
                    </span>
                    {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {booking.assignedStaff.map((staff, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/10">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden concept-placeholder bg-gray-100 flex-shrink-0">
                              {staff.avatarUrl ? (
                                <img
                                  src={staff.avatarUrl}
                                  alt={staff.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-gray-400 absolute inset-0 flex items-center justify-center" style={{ fontSize: 20 }}>
                                  face
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-hanken text-sm font-semibold text-on-surface">{staff.fullName}</div>
                              <div className="font-hanken text-xs text-secondary uppercase tracking-widest font-medium">
                                {staff.role === "PHOTOGRAPHER" ? "Photographer" : "Makeup Artist"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-hanken text-sm text-on-surface-variant italic">
                        Lịch chụp đang được quản trị viên xử lý và sắp xếp ê-kíp phù hợp.
                      </p>
                    )}
                  </div>

                  {/* Tiến độ hậu kỳ & Nhận ảnh */}
                  {booking.bookingStatus === "COMPLETED" || booking.productionStatus ? (
                    <div className="mt-6 bg-secondary/5 p-5 rounded-2xl border border-secondary/20 space-y-3">
                      <div className="flex items-center gap-2 text-secondary font-hanken text-sm font-semibold">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_library</span>
                        <span>Trạng thái sản phẩm ảnh: {booking.productionStatus || "Đang xử lý"}</span>
                      </div>
                      
                      {booking.editedPhotoLink ? (
                        <div className="pt-2">
                          <p className="font-hanken text-xs text-on-surface-variant mb-2">
                            Sản phẩm ảnh đã hoàn thiện và sẵn sàng để tải xuống:
                          </p>
                          <a
                            href={booking.editedPhotoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors shadow-md"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cloud_download</span>
                            Tải bộ ảnh hoàn thiện
                          </a>
                        </div>
                      ) : (
                        <p className="font-hanken text-xs text-on-surface-variant italic">
                          Đội ngũ đang tiến hành lọc và chỉnh sửa ảnh (hậu kỳ) theo yêu cầu. Bạn sẽ nhận được link tải ảnh sớm nhất.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
