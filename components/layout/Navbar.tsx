"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { guestApi, authApi } from "@/lib/api";
import type { StudioInfo, BookingLookupResponse } from "@/types";

const NAV_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/#services" },
  { label: "Concept", href: "/#concepts" },
  { label: "Đội ngũ", href: "/#team" },
  { label: "Tra cứu đơn", href: "#lookup" },
  { label: "Đặt lịch", href: "/#booking" },
  { label: "Blog", href: "/#blog" },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState<StudioInfo | null>(null);

  // States for Booking Lookup Modal
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [booking, setBooking] = useState<BookingLookupResponse | null>(null);

  // States for Login Modal
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<"admin" | "staff">("admin");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    guestApi
      .getStudioInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (info?.logoUrl) {
      const iconLinks = document.querySelectorAll("link[rel*='icon']");
      if (iconLinks.length > 0) {
        iconLinks.forEach((link) => {
          (link as HTMLLinkElement).href = info.logoUrl;
        });
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = info.logoUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [info]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu OR lookup modal OR login modal is open
  useEffect(() => {
    if (menuOpen || isLookupOpen || isLoginOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isLookupOpen, isLoginOpen]);

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setErrorMsg("Vui lòng nhập số điện thoại.");
    if (!code) return setErrorMsg("Vui lòng nhập mã đặt lịch.");

    setLookupStatus("loading");
    setErrorMsg("");
    setBooking(null);

    try {
      const data = await guestApi.lookupBooking(phone.trim(), code.trim());
      setBooking(data);
      setLookupStatus("success");
    } catch (err) {
      setLookupStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Không tìm thấy lịch đặt với thông tin trên.");
    }
  };

  const closeLookupModal = () => {
    setIsLookupOpen(false);
    setPhone("");
    setCode("");
    setLookupStatus("idle");
    setErrorMsg("");
    setBooking(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setLoginError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await authApi.login({ username: loginUsername, password: loginPassword });

      // Validate role matches selected tab
      const allowedRoles = loginTab === "admin" ? ["ADMIN"] : ["PHOTOGRAPHER", "MAKEUP"];
      if (!allowedRoles.includes(res.role)) {
        setLoginError(
          loginTab === "admin"
            ? "Tài khoản này không có quyền Admin."
            : "Tài khoản này không phải nhân viên Studio."
        );
        setLoginLoading(false);
        return;
      }

      // Save token & user
      localStorage.setItem("studio_token", res.token);
      localStorage.setItem("studio_role", res.role);
      localStorage.setItem("studio_user", JSON.stringify({ id: res.userId, name: res.fullName }));

      // Redirect
      setIsLoginOpen(false);
      const target = res.role === "ADMIN" ? "/admin/dashboard" : "/staff/dashboard";
      router.push(target);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Tài khoản hoặc mật khẩu không đúng.");
    } finally {
      setLoginLoading(false);
    }
  };

  const openLoginModal = (role: "admin" | "staff") => {
    setLoginTab(role);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setShowLoginPassword(false);
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setShowLoginPassword(false);
  };

  const getStatusBadgeClass = (statusStr: string) => {
    switch (statusStr) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ASSIGNED": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "UNPAID": return "bg-red-100 text-red-800 border-red-200";
      case "DEPOSITED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PAID": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  const studioName = info?.studioName || "LEON STUDIO";
  const splitName = studioName.split(" ");
  const firstWord = splitName[0] || "LEON";
  const restOfName = splitName.slice(1).join(" ") || "STUDIO";

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 header-transition ${
          scrolled ? "glass-header" : "bg-transparent"
        }`}
        style={{ height: 70 }}
      >
        <div className="container-max px-page h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center"
            aria-label={`${studioName} - Trang chủ`}
          >
            {info?.logoUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center flex-shrink-0">
                <img
                  src={info.logoUrl}
                  alt={studioName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex flex-col leading-none">
                <span
                  className="text-white font-playfair font-bold tracking-widest uppercase"
                  style={{ fontSize: 22, letterSpacing: "0.18em" }}
                >
                  {firstWord}
                </span>
                <span
                  className="text-white font-hanken font-light tracking-widest uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.4em" }}
                >
                  {restOfName}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              if (link.href === "#lookup") {
                return (
                  <button
                    key={link.href}
                    onClick={() => setIsLookupOpen(true)}
                    className="text-white/80 hover:text-gold-luxury font-hanken text-sm font-medium tracking-wider uppercase transition-colors duration-300 text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-gold-luxury font-hanken text-sm font-medium tracking-wider uppercase transition-colors duration-300"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Login Dropdown */}
            <div className="relative group">
              <button
                id="login-btn"
                className="flex items-center gap-1.5 text-white/80 hover:text-white font-hanken text-sm font-medium tracking-wider uppercase transition-colors duration-300 py-2 px-3 cursor-pointer"
                aria-haspopup="true"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  person
                </span>
                Đăng nhập
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  expand_more
                </span>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-1 w-52 bg-white shadow-lg rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={() => openLoginModal("admin")}
                  id="login-admin-link"
                  className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low hover:text-secondary font-hanken text-sm transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    admin_panel_settings
                  </span>
                  <div>
                    <div className="font-semibold text-on-surface">Admin</div>
                    <div className="text-xs text-on-surface-variant">Quản trị viên</div>
                  </div>
                </button>
                <div className="border-t border-outline-variant/20" />
                <button
                  onClick={() => openLoginModal("staff")}
                  id="login-staff-link"
                  className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low hover:text-secondary font-hanken text-sm transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    badge
                  </span>
                  <div>
                    <div className="font-semibold text-on-surface">Nhân viên</div>
                    <div className="text-xs text-on-surface-variant">Photographer / Makeup</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Book CTA */}
            <Link
              href="/#booking"
              id="booking-cta-btn"
              className="bg-gold-luxury hover:bg-gold-dark text-black font-hanken text-sm font-semibold tracking-wider uppercase px-6 py-2.5 transition-colors duration-300 active:scale-95"
            >
              Đặt lịch ngay
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden text-white p-2 focus:outline-none cursor-pointer"
            aria-label="Mở menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 flex flex-col gap-1.5 transition-all">
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(0,0,0,0.97)" }}
      >
        <div className="flex flex-col h-full pt-24 px-page pb-10">
          {/* Nav Links */}
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_LINKS.map((link, i) => {
              if (link.href === "#lookup") {
                return (
                  <button
                    key={link.href}
                    onClick={() => {
                      setMenuOpen(false);
                      setIsLookupOpen(true);
                    }}
                    className="text-white/80 hover:text-gold-luxury font-playfair text-3xl font-semibold py-3 border-b border-white/5 transition-colors duration-200 text-left w-full cursor-pointer"
                    style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
                  >
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/80 hover:text-gold-luxury font-playfair text-3xl font-semibold py-3 border-b border-white/5 transition-colors duration-200"
                  style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Login Options */}
          <div className="space-y-3 mt-6">
            <p className="text-white/40 font-hanken text-xs uppercase tracking-widest">Đăng nhập</p>
            <button
              onClick={() => {
                setMenuOpen(false);
                openLoginModal("admin");
              }}
              id="mobile-login-admin"
              className="w-full flex items-center gap-3 text-white/70 hover:text-gold-luxury font-hanken text-sm py-2 transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>admin_panel_settings</span>
              Admin
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                openLoginModal("staff");
              }}
              id="mobile-login-staff"
              className="w-full flex items-center gap-3 text-white/70 hover:text-gold-luxury font-hanken text-sm py-2 transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>badge</span>
              Nhân viên (Photographer / Makeup)
            </button>

            <Link
              href="/#booking"
              className="block w-full text-center bg-gold-luxury hover:bg-gold-dark text-black font-hanken text-sm font-semibold uppercase tracking-wider py-4 mt-4 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Premium Order Lookup Modal Popup ─── */}
      {isLookupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={closeLookupModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-outline-variant/10 flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLookupModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-on-surface hover:text-secondary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/10 text-center bg-primary text-on-primary">
              <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 32 }}>
                search
              </span>
              <h3 className="font-playfair text-headline-lg font-bold text-white mt-2">
                Tra Cứu Tiến Độ Đơn Đặt Lịch
              </h3>
              <p className="font-hanken text-xs text-on-primary/60 mt-1">
                Nhập số điện thoại và mã đơn đặt lịch (gửi kèm trong email)
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Form Input fields */}
              <form onSubmit={handleLookupSubmit} className="space-y-4 bg-surface-container-low p-5 rounded-xl border border-outline-variant/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lookup-phone" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lookup-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0901234567"
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="lookup-code" className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Mã đặt lịch <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lookup-code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ví dụ: STB-20260820-A3FBX"
                      className="input-luxury w-full uppercase"
                    />
                  </div>
                </div>

                {/* Error Box */}
                {lookupStatus === "error" && errorMsg && (
                  <div className="bg-error/10 border border-error/20 text-error font-hanken text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined font-semibold" style={{ fontSize: 16 }}>error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={lookupStatus === "loading"}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-xs font-semibold uppercase tracking-widest py-3.5 transition-all duration-300 active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {lookupStatus === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>
                        progress_activity
                      </span>
                      Đang tìm kiếm...
                    </span>
                  ) : (
                    "Bắt đầu tra cứu"
                  )}
                </button>
              </form>

              {/* Display Result Details if Successful */}
              {lookupStatus === "success" && booking && (
                <div className="border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm bg-white animate-scale-up">
                  {/* Status header card */}
                  <div className="bg-primary/95 text-on-primary p-5 flex flex-wrap justify-between items-center gap-4 border-b border-outline-variant/10">
                    <div>
                      <span className="text-[10px] text-gold-luxury uppercase tracking-widest font-bold block mb-0.5">
                        Mã đặt lịch
                      </span>
                      <h4 className="font-playfair text-headline-md font-bold text-white">
                        {booking.bookingCode}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 border text-[10px] font-bold uppercase rounded-full ${getStatusBadgeClass(booking.bookingStatus)}`}>
                        {getStatusLabel(booking.bookingStatus)}
                      </span>
                      <span className={`px-3 py-1 border text-[10px] font-bold rounded-full ${getPaymentBadgeClass(booking.paymentStatus)}`}>
                        {getPaymentLabel(booking.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Grid details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-outline-variant/10">
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-0.5">
                          Khách hàng
                        </span>
                        <span className="text-on-surface font-hanken text-sm font-semibold block">
                          {booking.customerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-0.5">
                          Tổng thanh toán
                        </span>
                        <span className="text-secondary font-playfair text-headline-sm font-bold block">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-0.5">
                          Gói dịch vụ &amp; Concept
                        </span>
                        <span className="text-on-surface font-hanken text-sm font-semibold block">
                          {booking.packageName} — {booking.conceptTitle}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-0.5">
                          Lịch &amp; Địa điểm chụp
                        </span>
                        <span className="text-on-surface font-hanken text-xs block">
                          Ngày {booking.shootDate} lúc {booking.shootTimeSlot.substring(0, 5)}
                          <br />
                          Tại: {booking.shootLocation}
                        </span>
                      </div>
                    </div>

                    {/* Crew list */}
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-hanken uppercase tracking-wider font-semibold block mb-2.5">
                        Ê-kíp phục vụ bối cảnh
                      </span>
                      {booking.assignedStaff && booking.assignedStaff.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {booking.assignedStaff.map((staff, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/10">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                {staff.avatarUrl ? (
                                  <img
                                    src={staff.avatarUrl}
                                    alt={staff.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-gray-400 absolute inset-0 flex items-center justify-center" style={{ fontSize: 16 }}>
                                    face
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-hanken text-xs font-semibold text-on-surface">{staff.fullName}</div>
                                <div className="font-hanken text-[9px] text-secondary uppercase tracking-widest font-bold">
                                  {staff.role === "PHOTOGRAPHER" ? "Photographer" : "Makeup Artist"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-hanken text-xs text-on-surface-variant italic">
                          Lịch đặt đang chờ phân công ê-kíp Photographer &amp; Makeup artist.
                        </p>
                      )}
                    </div>

                    {/* Post production Raw/Edited Links */}
                    {(booking.bookingStatus === "COMPLETED" || booking.productionStatus) && (
                      <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/15 space-y-2">
                        <div className="flex items-center gap-1.5 text-secondary font-hanken text-xs font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_library</span>
                          <span>Hậu kỳ: {booking.productionStatus || "Đang xử lý"}</span>
                        </div>
                        {booking.editedPhotoLink ? (
                          <div>
                            <p className="font-hanken text-[11px] text-on-surface-variant mb-2">
                              Sản phẩm ảnh đã hoàn thành! Nhấn vào nút dưới đây để xem/tải ảnh:
                            </p>
                            <a
                              href={booking.editedPhotoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded shadow transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cloud_download</span>
                              Tải bộ ảnh hoàn thiện
                            </a>
                          </div>
                        ) : (
                          <p className="font-hanken text-[11px] text-on-surface-variant italic">
                            Ê-kíp đang tiến hành lọc ảnh và chỉnh sửa hậu kỳ chuyên sâu. Bạn sẽ nhận được link tải ảnh sớm nhất.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Premium Account & Password Login Modal Popup ─── */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={closeLoginModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-on-surface hover:text-secondary flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Modal Header / Tab Toggle */}
            <div className="grid grid-cols-2 bg-surface-container-low border-b border-outline-variant/5">
              <button
                onClick={() => {
                  setLoginTab("admin");
                  setLoginError("");
                }}
                className={`py-4 font-hanken text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginTab === "admin"
                    ? "bg-white text-secondary font-black border-b-2 border-secondary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-selected={loginTab === "admin"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
                Admin
              </button>
              <button
                onClick={() => {
                  setLoginTab("staff");
                  setLoginError("");
                }}
                className={`py-4 font-hanken text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginTab === "staff"
                    ? "bg-white text-secondary font-black border-b-2 border-secondary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-selected={loginTab === "staff"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>badge</span>
                Nhân viên
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Header metadata */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    {loginTab === "admin" ? "admin_panel_settings" : "badge"}
                  </span>
                </div>
                <div>
                  <h4 className="font-playfair text-headline-sm font-bold text-on-surface leading-tight">
                    Đăng nhập {loginTab === "admin" ? "Quản trị viên" : "Nhân viên Studio"}
                  </h4>
                  <p className="font-hanken text-[10px] text-on-surface-variant mt-0.5">
                    {loginTab === "admin" ? "Trang quản trị vận hành LEON Studio" : "Dành cho Photographer & Makeup Artist"}
                  </p>
                </div>
              </div>

              {/* Error Box */}
              {loginError && (
                <div className="bg-error/10 border border-error/20 text-error font-hanken text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined font-semibold" style={{ fontSize: 16 }}>error</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-username" className="block font-hanken text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Tài khoản
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 18 }}>
                      person
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder={loginTab === "admin" ? "admin" : "photo_hai"}
                      className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-hanken text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block font-hanken text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 18 }}>
                      lock
                    </span>
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-outline-variant rounded-lg pl-10 pr-12 py-2.5 font-hanken text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {showLoginPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-xs font-semibold uppercase tracking-widest py-3.5 rounded-lg transition-all duration-200 active:scale-98 disabled:opacity-60 cursor-pointer mt-2"
                >
                  {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>
                        progress_activity
                      </span>
                      Đang xác thực...
                    </span>
                  ) : (
                    "Xác nhận đăng nhập"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
