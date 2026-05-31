"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { staffApi } from "@/lib/api";

interface StaffUser {
  id: number;
  name: string;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Bookings list state
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected Tab state
  const [activeTab, setActiveTab] = useState<"schedule" | "post-production" | "password">("schedule");

  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Makeup action state
  const [completingMakeupId, setCompletingMakeupId] = useState<number | null>(null);
  const [makeupSuccess, setMakeupSuccess] = useState<string | null>(null);
  const [makeupError, setMakeupError] = useState<string | null>(null);

  // Post production modal state
  const [isPostProdModalOpen, setIsPostProdModalOpen] = useState(false);
  const [postProdBooking, setPostProdBooking] = useState<any | null>(null);
  const [productionStatus, setProductionStatus] = useState("UNPROCESSED");
  const [rawPhotoLink, setRawPhotoLink] = useState("");
  const [editedPhotoLink, setEditedPhotoLink] = useState("");
  const [postProdNote, setPostProdNote] = useState("");
  const [savingPostProd, setSavingPostProd] = useState(false);
  const [postProdError, setPostProdError] = useState<string | null>(null);
  const [postProdSuccess, setPostProdSuccess] = useState<string | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sort bookings helper (Newest created first)
  const sortBookingsNewestFirst = (list: any[]) => {
    return [...list].sort((a, b) => {
      const d1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const d2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return d2 - d1;
    });
  };

  // Fetch bookings function
  const fetchBookings = async (showOverlay = true) => {
    if (showOverlay) setRefreshing(true);
    try {
      const data = await staffApi.getBookings();
      // Ensure data is array
      setBookings(Array.isArray(data) ? sortBookingsNewestFirst(data) : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ca làm việc:", err);
    } finally {
      if (showOverlay) setRefreshing(false);
    }
  };

  useEffect(() => {
    // Client-side authentication check
    const token = localStorage.getItem("studio_token");
    const userRole = localStorage.getItem("studio_role");
    const userStr = localStorage.getItem("studio_user");

    const allowedRoles = ["PHOTOGRAPHER", "MAKEUP"];
    if (!token || !userRole || !allowedRoles.includes(userRole)) {
      router.push("/login?role=staff");
      return;
    }

    setRole(userRole);
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Lỗi parse thông tin user:", e);
      }
    }

    // Load actual bookings
    staffApi.getBookings()
      .then((data) => {
        setBookings(Array.isArray(data) ? sortBookingsNewestFirst(data) : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải lịch chụp ban đầu:", err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("studio_token");
    localStorage.removeItem("studio_role");
    localStorage.removeItem("studio_user");
    router.push("/");
  };

  const getRoleLabel = (roleStr: string) => {
    if (roleStr === "PHOTOGRAPHER") return "Nhiếp ảnh gia";
    if (roleStr === "MAKEUP") return "Chuyên viên Trang điểm";
    return "Nhân sự Studio";
  };

  // Open booking detail modal
  const openDetailModal = async (bookingId: number) => {
    setLoadingDetail(true);
    setSelectedBooking(null);
    setIsDetailModalOpen(true);
    setMakeupSuccess(null);
    setMakeupError(null);
    try {
      const detail = await staffApi.getBookingDetail(bookingId);
      setSelectedBooking(detail);
    } catch (err: any) {
      console.error("Lỗi tải chi tiết ca làm việc:", err);
      setMakeupError(err?.message || "Không thể tải chi tiết ca làm việc do lỗi hệ thống hoặc hạn chế quyền truy cập.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open post production modal
  const openPostProdModal = async (booking: any) => {
    setPostProdError(null);
    setPostProdSuccess(null);
    setPostProdBooking(booking);
    setIsPostProdModalOpen(true);

    // Fetch details to get existing links
    try {
      const detail = await staffApi.getBookingDetail(booking.id);
      // Backend may return postProduction inside or flat properties. Let's merge gracefully
      const prod = detail.postProduction || {};
      setProductionStatus(prod.productionStatus || detail.productionStatus || "UNPROCESSED");
      setRawPhotoLink(prod.rawPhotoLink || detail.rawPhotoLink || "");
      setEditedPhotoLink(prod.editedPhotoLink || detail.editedPhotoLink || "");
      setPostProdNote(prod.note || detail.postProductionNote || detail.note || "");
    } catch (err) {
      console.error("Lỗi tải thông tin hậu kỳ chi tiết:", err);
      // Fallback to table fields if any
      setProductionStatus(booking.productionStatus || "UNPROCESSED");
      setRawPhotoLink(booking.rawPhotoLink || "");
      setEditedPhotoLink(booking.editedPhotoLink || "");
      setPostProdNote(booking.postProductionNote || "");
    }
  };

  // Handle Makeup complete
  const handleMakeupComplete = async (bookingId: number) => {
    setCompletingMakeupId(bookingId);
    setMakeupSuccess(null);
    setMakeupError(null);
    try {
      const responseText = await staffApi.completeMakeup(bookingId);
      setMakeupSuccess(responseText || "Xác nhận hoàn thành makeup thành công!");
      // Reload bookings to update UI status
      await fetchBookings(false);
      // If modal is open, reload details
      if (selectedBooking && selectedBooking.id === bookingId) {
        const freshDetail = await staffApi.getBookingDetail(bookingId);
        setSelectedBooking(freshDetail);
      }
    } catch (err: any) {
      console.error("Lỗi xác nhận hoàn thành makeup:", err);
      setMakeupError(err.message || "Xác nhận hoàn thành makeup thất bại.");
    } finally {
      setCompletingMakeupId(null);
    }
  };

  // Handle Post-production submit
  const handlePostProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postProdBooking) return;

    setSavingPostProd(true);
    setPostProdError(null);
    setPostProdSuccess(null);

    try {
      const payload = {
        productionStatus,
        rawPhotoLink: rawPhotoLink.trim() || undefined,
        editedPhotoLink: editedPhotoLink.trim() || undefined,
        note: postProdNote.trim() || undefined,
      };

      await staffApi.updatePostProduction(postProdBooking.id, payload);
      setPostProdSuccess("Cập nhật thông tin hậu kỳ và tiến độ thành công!");
      
      // Reload bookings
      await fetchBookings(false);
      
      // Auto close modal after a short delay
      setTimeout(() => {
        setIsPostProdModalOpen(false);
        setPostProdBooking(null);
      }, 1500);
    } catch (err: any) {
      console.error("Lỗi cập nhật hậu kỳ:", err);
      setPostProdError(err.message || "Không thể cập nhật thông tin hậu kỳ.");
    } finally {
      setSavingPostProd(false);
    }
  };

  // Handle change password submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
      return;
    }

    setSavingPassword(true);
    try {
      const responseText = await staffApi.changePassword({ oldPassword, newPassword });
      setPasswordSuccess(responseText || "Thay đổi mật khẩu thành công!");
      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Lỗi đổi mật khẩu:", err);
      setPasswordError(err.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Client-side search and filter logic
  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      booking.bookingCode?.toLowerCase().includes(query) ||
      booking.customerName?.toLowerCase().includes(query) ||
      booking.customerPhone?.toLowerCase().includes(query) ||
      booking.packageName?.toLowerCase().includes(query) ||
      booking.conceptTitle?.toLowerCase().includes(query) ||
      booking.shootLocation?.toLowerCase().includes(query);

    let matchStatus = true;
    if (statusFilter !== "ALL") {
      matchStatus = booking.bookingStatus === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  // Client-side pagination logic
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Color mapping helper for Booking Status
  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-950 text-blue-400 border-blue-900/50";
      case "COMPLETED":
        return "bg-emerald-950 text-emerald-400 border-emerald-900/50";
      case "DEPOSITED":
        return "bg-amber-950 text-gold-luxury border-amber-900/50";
      case "CANCELLED":
        return "bg-rose-950 text-rose-400 border-rose-900/50";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  // Color mapping helper for Production Status
  const getProdStatusBadge = (status: string) => {
    switch (status) {
      case "UNPROCESSED":
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
      case "EDITING":
        return "bg-orange-950 text-orange-400 border-orange-900/50";
      case "WAITING_APPROVAL":
        return "bg-cyan-950 text-cyan-400 border-cyan-900/50";
      case "DELIVERED":
        return "bg-emerald-950 text-emerald-400 border-emerald-950/60";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getProdStatusText = (status: string) => {
    switch (status) {
      case "UNPROCESSED":
        return "Chưa xử lý";
      case "EDITING":
        return "Đang chỉnh sửa";
      case "WAITING_APPROVAL":
        return "Chờ duyệt ảnh";
      case "DELIVERED":
        return "Đã bàn giao";
      default:
        return "Không có";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-hanken">
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-gold-luxury animate-spin flex items-center justify-center">
            <span className="font-playfair font-black text-gold-luxury text-xl">L</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm tracking-widest text-gold-luxury font-semibold uppercase">LEON STUDIO</p>
            <p className="text-xs text-zinc-400 font-light">Đang đồng bộ dữ liệu lịch trình...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-hanken flex flex-col lg:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-68 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col justify-between flex-shrink-0 relative z-20">
        <div>
          {/* Brand/Logo */}
          <div className="p-6 border-b border-zinc-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-gold-luxury to-amber-500 flex items-center justify-center text-black font-playfair font-black text-xl shadow-lg shadow-gold-luxury/10">
              L
            </div>
            <div>
              <h1 className="font-playfair font-bold text-white tracking-wider text-sm leading-tight">LEON STUDIO</h1>
              <p className="text-[9px] text-gold-luxury font-semibold uppercase tracking-widest leading-none">STAFF PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                activeTab === "schedule"
                  ? "bg-zinc-800 text-gold-luxury font-semibold shadow-inner border-l-2 border-gold-luxury"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>schedule</span>
              <span>Lịch làm việc của tôi</span>
            </button>

            {role === "PHOTOGRAPHER" && (
              <button
                onClick={() => setActiveTab("post-production")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                  activeTab === "post-production"
                    ? "bg-zinc-800 text-gold-luxury font-semibold shadow-inner border-l-2 border-gold-luxury"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_library</span>
                <span>Nhiệm vụ Hậu kỳ</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                activeTab === "password"
                  ? "bg-zinc-800 text-gold-luxury font-semibold shadow-inner border-l-2 border-gold-luxury"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>vpn_key</span>
              <span>Thay đổi mật khẩu</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/40">
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-gold-luxury relative shadow-inner">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>badge</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-900" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Nhân sự Studio"}</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none truncate mt-0.5">{getRoleLabel(role)}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-950/60 rounded-lg transition-all duration-200 cursor-pointer hover:border-rose-900/60"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header */}
        <header className="h-[70px] bg-zinc-900/40 border-b border-zinc-800/60 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-500">menu_open</span>
            <span className="text-xs font-semibold text-zinc-400">
              Cổng Nhân viên / {activeTab === "schedule" ? "Lịch làm việc" : activeTab === "post-production" ? "Hậu kỳ" : "Bảo mật"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block animate-pulse">
              Đang sẵn sàng ca
            </span>
            <Link href="/" className="text-xs font-medium text-gold-luxury hover:text-amber-400 hover:underline flex items-center gap-1 transition-all">
              Xem Website
              <span className="material-symbols-outlined animate-bounce-horizontal" style={{ fontSize: 13 }}>arrow_outward</span>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-70px)] flex-1">
          
          {/* Welcome Message */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/40 pb-5">
            <div>
              <h2 className="font-playfair text-3xl font-bold text-white">
                Xin chào, <span className="text-gold-luxury">{user?.name || "Đồng nghiệp"}</span>!
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Chúc bạn một ngày làm việc tuyệt vời. Bạn đang đăng nhập với vai trò <span className="text-white font-bold">{getRoleLabel(role)}</span>.
              </p>
            </div>
            
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="self-start sm:self-center flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-800/80 disabled:opacity-55 hover:text-white transition-all cursor-pointer"
            >
              <span className={`material-symbols-outlined ${refreshing ? "animate-spin" : ""}`} style={{ fontSize: 16 }}>sync</span>
              Đồng bộ lịch
            </button>
          </div>

          {/* TAB 1: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              
              {/* Search and Filters panel */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4 shadow-xl">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 16 }}>filter_list</span>
                  Bộ lọc và tìm kiếm nhanh ca làm việc
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search query */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" style={{ fontSize: 18 }}>
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm theo Khách hàng, SĐT, Mã đơn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gold-luxury transition-all font-hanken"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                      </button>
                    )}
                  </div>

                  {/* Booking Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-luxury transition-all appearance-none cursor-pointer font-hanken"
                    >
                      <option value="ALL">Tất cả trạng thái lịch chụp</option>
                      <option value="ASSIGNED">Được phân công (ASSIGNED)</option>
                      <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                      <option value="DEPOSITED">Đã đặt cọc (DEPOSITED)</option>
                      <option value="CANCELLED">Đã hủy bỏ (CANCELLED)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" style={{ fontSize: 18 }}>
                      unfold_more
                    </span>
                  </div>

                  {/* Summary results info */}
                  <div className="flex items-center text-xs text-zinc-400 px-1 bg-zinc-950/20 border border-zinc-800/40 rounded-lg">
                    <span className="material-symbols-outlined text-gold-luxury mr-2 ml-2" style={{ fontSize: 18 }}>info</span>
                    Tìm thấy <strong className="text-white mx-1">{filteredBookings.length}</strong> ca phù hợp
                  </div>
                </div>
              </div>

              {/* Bookings List Container */}
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl relative">
                
                {/* Visual loading mask */}
                {refreshing && (
                  <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
                    <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold text-gold-luxury shadow-2xl">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                      Đang đồng bộ dữ liệu mới...
                    </div>
                  </div>
                )}

                <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
                  <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold-luxury">calendar_today</span>
                    Lịch trình công tác của tôi
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">BẢNG DỮ LIỆU THỰC</span>
                </div>

                {/* Empty State */}
                {paginatedBookings.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 shadow-inner">
                      <span className="material-symbols-outlined text-3xl">event_busy</span>
                    </div>
                    <h5 className="font-playfair text-base font-bold text-white mb-1.5">Không tìm thấy ca làm việc nào</h5>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      Bạn hiện tại chưa được Admin phân công ca làm việc nào khớp với tiêu chí tìm kiếm này.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                            <th className="py-4 px-5">Mã Lịch</th>
                            <th className="py-4 px-5">Khách hàng</th>
                            <th className="py-4 px-5">Ngày &amp; Giờ</th>
                            <th className="py-4 px-5">Gói chụp / Concept</th>
                            <th className="py-4 px-5">Trạng thái</th>
                            <th className="py-4 px-5 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {paginatedBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-zinc-800/20 transition-all group">
                              <td className="py-4.5 px-5 font-mono text-zinc-300 font-bold group-hover:text-gold-luxury transition-colors">
                                {booking.bookingCode}
                              </td>
                              <td className="py-4.5 px-5">
                                <p className="font-bold text-white">{booking.customerName}</p>
                                <p className="text-zinc-500 text-[10px] mt-0.5">{booking.customerPhone}</p>
                              </td>
                              <td className="py-4.5 px-5">
                                <p className="font-semibold text-zinc-300">{booking.shootDate}</p>
                                <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
                                  {booking.shootTimeSlot}
                                </p>
                              </td>
                              <td className="py-4.5 px-5">
                                <p className="font-semibold text-white">{booking.packageName}</p>
                                <p className="text-gold-luxury/70 text-[10px] uppercase font-bold tracking-wider mt-0.5">{booking.conceptTitle}</p>
                              </td>
                              <td className="py-4.5 px-5">
                                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getBookingStatusBadge(booking.bookingStatus)}`}>
                                  {booking.bookingStatus}
                                </span>
                              </td>
                              <td className="py-4.5 px-5 text-right space-x-1.5">
                                <button
                                  onClick={() => openDetailModal(booking.id)}
                                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer border border-zinc-700/60"
                                >
                                  Chi tiết
                                </button>
                                
                                {role === "MAKEUP" && booking.bookingStatus === "ASSIGNED" && (
                                  <button
                                    onClick={() => handleMakeupComplete(booking.id)}
                                    disabled={completingMakeupId === booking.id}
                                    className="bg-gold-luxury hover:bg-amber-500 text-black px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {completingMakeupId === booking.id ? (
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>
                                        Đang lưu...
                                      </span>
                                    ) : (
                                      "Xong Makeup"
                                    )}
                                  </button>
                                )}

                                {role === "PHOTOGRAPHER" && (
                                  <button
                                    onClick={() => openPostProdModal(booking)}
                                    className="bg-amber-500/10 hover:bg-amber-500/20 text-gold-luxury border border-gold-luxury/30 px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer"
                                  >
                                    Hậu kỳ
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-zinc-800/60">
                      {paginatedBookings.map((booking) => (
                        <div key={booking.id} className="p-5 space-y-4 hover:bg-zinc-800/10 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-zinc-400 text-xs font-bold block">{booking.bookingCode}</span>
                              <h5 className="font-playfair text-base font-bold text-white mt-1">{booking.customerName}</h5>
                            </div>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getBookingStatusBadge(booking.bookingStatus)}`}>
                              {booking.bookingStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Thời gian</p>
                              <p className="text-zinc-300 font-semibold mt-0.5">{booking.shootDate}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{booking.shootTimeSlot}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Dịch vụ</p>
                              <p className="text-zinc-300 font-semibold truncate mt-0.5">{booking.packageName}</p>
                              <p className="text-gold-luxury/80 text-[10px] uppercase font-bold tracking-wider mt-0.5">{booking.conceptTitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/40">
                            <button
                              onClick={() => openDetailModal(booking.id)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border border-zinc-700/60 flex-1 text-center"
                            >
                              Chi tiết
                            </button>

                            {role === "MAKEUP" && booking.bookingStatus === "ASSIGNED" && (
                              <button
                                onClick={() => handleMakeupComplete(booking.id)}
                                disabled={completingMakeupId === booking.id}
                                className="bg-gold-luxury hover:bg-amber-500 text-black px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex-1 text-center disabled:opacity-55"
                              >
                                {completingMakeupId === booking.id ? "Đang lưu..." : "Xong Makeup"}
                              </button>
                            )}

                            {role === "PHOTOGRAPHER" && (
                              <button
                                onClick={() => openPostProdModal(booking)}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-gold-luxury border border-gold-luxury/30 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex-1 text-center"
                              >
                                Hậu kỳ
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between">
                        <p className="text-xs text-zinc-500">
                          Hiển thị <span className="text-zinc-300">{startIndex + 1}</span> - <span className="text-zinc-300">{Math.min(startIndex + pageSize, totalItems)}</span> trên <span className="text-zinc-300 font-bold">{totalItems}</span> ca
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-800/80 text-xs font-bold text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-all"
                          >
                            Trước
                          </button>
                          <div className="flex gap-1 items-center">
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-6.5 h-6.5 rounded text-xs font-bold transition-all ${
                                  currentPage === i + 1
                                    ? "bg-gold-luxury text-black font-extrabold"
                                    : "bg-zinc-900 border border-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1 px-2.5 rounded bg-zinc-900 border border-zinc-800/80 text-xs font-bold text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-all"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POST PRODUCTION (ONLY FOR PHOTOGRAPHER) */}
          {activeTab === "post-production" && role === "PHOTOGRAPHER" && (
            <div className="space-y-6">
              
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 space-y-4 shadow-2xl">
                <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-luxury">photo_camera</span>
                  Tiến trình xử lý Hậu kỳ &amp; Chỉnh sửa hình ảnh
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  Để đảm bảo dịch vụ chuyên nghiệp, vui lòng cập nhật link thư mục ảnh thô ngay sau khi hoàn thành buổi chụp. Sau khi chỉnh sửa hoàn tất, cập nhật link ảnh Edited và chuyển trạng thái sang <span className="text-emerald-400 font-bold">DELIVERED</span>. Hệ thống sẽ **tự động gửi email bàn giao có kèm link ảnh** trực tiếp tới hộp thư của khách hàng.
                </p>

                {/* Sub-panel filtering and lists */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-lg mt-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 bg-zinc-950 p-4.5 text-zinc-400 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800/80">
                    <div className="md:col-span-1">Mã lịch / Khách hàng</div>
                    <div className="md:col-span-1">Tiến độ hậu kỳ</div>
                    <div className="md:col-span-1">Ảnh Raw / Edited Drive</div>
                    <div className="md:col-span-1 text-right">Hành động</div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900">
                      Không có ca làm việc nào để xử lý hậu kỳ.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/60">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="grid grid-cols-1 md:grid-cols-4 p-4.5 items-center hover:bg-zinc-800/10 transition-all text-xs bg-zinc-900 gap-4 md:gap-0">
                          <div>
                            <p className="font-mono font-bold text-white text-sm">{booking.bookingCode}</p>
                            <p className="text-zinc-500 text-[10px] mt-0.5">{booking.customerName}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getProdStatusBadge(booking.productionStatus || "UNPROCESSED")}`}>
                              {getProdStatusText(booking.productionStatus || "UNPROCESSED")}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {booking.rawPhotoLink ? (
                              <a href={booking.rawPhotoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-luxury hover:underline text-[11px]">
                                <span className="material-symbols-outlined text-[12px]">folder_open</span>
                                Link ảnh Raw
                              </a>
                            ) : (
                              <span className="text-zinc-600 block text-[10px]">Chưa cập nhật ảnh thô</span>
                            )}
                            {booking.editedPhotoLink ? (
                              <a href={booking.editedPhotoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-[11px] block">
                                <span className="material-symbols-outlined text-[12px]">image</span>
                                Link ảnh Đẹp (Edited)
                              </a>
                            ) : (
                              <span className="text-zinc-600 block text-[10px]">Chưa cập nhật ảnh đã sửa</span>
                            )}
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => openPostProdModal(booking)}
                              className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 hover:text-white text-gold-luxury border border-gold-luxury/20 px-3.5 py-1.5 rounded font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[14px]">drive_file_rename_outline</span>
                              Cập nhật Drive &amp; Bàn giao
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <div className="max-w-xl mx-auto">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl relative">
                <div className="border-b border-zinc-800 pb-4">
                  <h4 className="font-playfair text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-gold-luxury">vpn_key</span>
                    Thay đổi mật khẩu tài khoản
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Nhằm mục đích bảo mật thông tin nội bộ của Studio, vui lòng thường xuyên cập nhật mật khẩu cá nhân có độ dài tối thiểu 6 ký tự.
                  </p>
                </div>

                {/* Alerts */}
                {passwordError && (
                  <div className="bg-rose-950/40 border border-rose-900/60 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {passwordSuccess}
                  </div>
                )}

                {/* Form change password */}
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" style={{ fontSize: 18 }}>
                        lock
                      </span>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-luxury transition-all"
                        placeholder="Nhập mật khẩu hiện tại đang dùng"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-[16px]">{showOldPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu mới</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" style={{ fontSize: 18 }}>
                        vpn_key
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-luxury transition-all"
                        placeholder="Nhập ít nhất 6 ký tự"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-[16px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" style={{ fontSize: 18 }}>
                        check_circle
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-luxury transition-all"
                        placeholder="Nhập lại mật khẩu mới để xác nhận"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined text-[16px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full bg-gold-luxury hover:bg-amber-500 text-black font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-all duration-300 disabled:opacity-55 flex items-center justify-center gap-1.5 shadow-lg shadow-gold-luxury/10 cursor-pointer"
                  >
                    {savingPassword ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                        Đang lưu mật khẩu mới...
                      </>
                    ) : (
                      "Đổi mật khẩu"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: VIEW BOOKING DETAILS */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-zinc-500 text-xs font-bold uppercase block">Chi tiết ca làm việc thực tế</span>
                <h3 className="font-playfair text-lg font-bold text-white mt-0.5">
                  {selectedBooking ? `Mã Đơn: ${selectedBooking.bookingCode}` : "Đang tải dữ liệu..."}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsDetailModalOpen(false); setSelectedBooking(null); }}
                className="w-8 h-8 rounded-full bg-zinc-850 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {loadingDetail ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                  <span className="material-symbols-outlined text-gold-luxury animate-spin text-4xl">progress_activity</span>
                  <p className="text-xs">Đang lấy dữ liệu chi tiết an toàn từ hệ thống...</p>
                </div>
              ) : selectedBooking ? (
                <>
                  {/* Status Alerts */}
                  {makeupSuccess && (
                    <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-3 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      {makeupSuccess}
                    </div>
                  )}
                  {makeupError && (
                    <div className="bg-rose-950/40 border border-rose-900/60 text-rose-400 p-3 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      {makeupError}
                    </div>
                  )}

                  {/* Customer Information Panel */}
                  <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4.5 space-y-3">
                    <h5 className="font-playfair text-sm font-bold text-white border-b border-zinc-800/60 pb-1.5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold-luxury text-base">person</span>
                      Thông tin liên hệ khách hàng
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                      <div>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Họ tên khách hàng</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{selectedBooking.customerName}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Số điện thoại</p>
                        <a href={`tel:${selectedBooking.customerPhone}`} className="text-gold-luxury font-semibold hover:underline block text-sm mt-0.5">
                          {selectedBooking.customerPhone}
                        </a>
                      </div>
                      <div>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Hộp thư điện tử</p>
                        <p className="text-zinc-300 font-semibold mt-0.5">{selectedBooking.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Mạng xã hội Facebook</p>
                        {selectedBooking.customerFacebook ? (
                          <a href={selectedBooking.customerFacebook} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-semibold hover:underline flex items-center gap-1 mt-0.5 truncate">
                            {selectedBooking.customerFacebook}
                            <span className="material-symbols-outlined text-[11px]">arrow_outward</span>
                          </a>
                        ) : (
                          <span className="text-zinc-600 block mt-0.5">Không cung cấp</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shoot metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 space-y-2">
                      <h5 className="font-playfair text-zinc-300 font-bold flex items-center gap-1.5 border-b border-zinc-800/60 pb-1.5">
                        <span className="material-symbols-outlined text-gold-luxury text-base">calendar_today</span>
                        Thông tin ca chụp
                      </h5>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Ngày chụp:</strong> {selectedBooking.shootDate}</p>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Khung giờ:</strong> {selectedBooking.shootTimeSlot}</p>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Địa điểm:</strong> {selectedBooking.shootLocation}</p>
                    </div>

                    <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 space-y-2">
                      <h5 className="font-playfair text-zinc-300 font-bold flex items-center gap-1.5 border-b border-zinc-800/60 pb-1.5">
                        <span className="material-symbols-outlined text-gold-luxury text-base">sell</span>
                        Dịch vụ lựa chọn
                      </h5>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Gói chụp:</strong> {selectedBooking.packageName}</p>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Concept:</strong> <span className="text-gold-luxury uppercase font-bold tracking-wider">{selectedBooking.conceptTitle}</span></p>
                      <p className="text-zinc-400"><strong className="text-zinc-200">Giá trị đơn:</strong> <span className="text-emerald-400 font-mono font-bold">{(selectedBooking.totalAmount || 0).toLocaleString()}đ</span></p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 space-y-1.5">
                    <h5 className="font-playfair text-zinc-300 font-bold flex items-center gap-1.5 border-b border-zinc-800/60 pb-1.5">
                      <span className="material-symbols-outlined text-gold-luxury text-base">description</span>
                      Ghi chú đặc biệt từ khách hàng
                    </h5>
                    <p className="text-zinc-300 italic leading-relaxed whitespace-pre-line text-[11px]">
                      {selectedBooking.customerNotes || "Không có ghi chú gì đặc biệt."}
                    </p>
                  </div>

                  {/* Assigned Staff (Colleagues) */}
                  <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 space-y-2.5">
                    <h5 className="font-playfair text-zinc-300 font-bold flex items-center gap-1.5 border-b border-zinc-800/60 pb-1.5">
                      <span className="material-symbols-outlined text-gold-luxury text-base">group</span>
                      Ê-kíp (Staff) cùng đảm nhiệm
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {Array.isArray(selectedBooking.assignedStaff) && selectedBooking.assignedStaff.map((staff: any, idx: number) => {
                        const isSelf = staff.staffId === user?.id;
                        return (
                          <div key={idx} className={`p-2.5 rounded-lg border flex items-center gap-3 ${
                            isSelf
                              ? "bg-gold-luxury/5 border-gold-luxury/30"
                              : "bg-zinc-900/60 border-zinc-800/60"
                          }`}>
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold font-mono">
                              {staff.fullName ? staff.fullName[0] : "S"}
                            </div>
                            <div>
                              <p className="font-bold text-white flex items-center gap-1">
                                {staff.fullName}
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded bg-gold-luxury/20 text-gold-luxury text-[8px] font-bold uppercase">Bạn</span>
                                )}
                              </p>
                              <p className="text-zinc-500 text-[9px] uppercase tracking-wider mt-0.5">
                                {getRoleLabel(staff.role)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-zinc-500">
                  Không tìm thấy thông tin ca làm việc này.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => { setIsDetailModalOpen(false); setSelectedBooking(null); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4.5 py-2 rounded font-semibold transition-all cursor-pointer border border-zinc-700"
              >
                Đóng lại
              </button>
              
              {selectedBooking && role === "MAKEUP" && selectedBooking.bookingStatus === "ASSIGNED" && (
                <button
                  type="button"
                  onClick={() => handleMakeupComplete(selectedBooking.id)}
                  disabled={completingMakeupId === selectedBooking.id}
                  className="bg-gold-luxury hover:bg-amber-500 text-black px-5 py-2 rounded font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-gold-luxury/10"
                >
                  {completingMakeupId === selectedBooking.id ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                      Đang xử lý...
                    </>
                  ) : (
                    "💄 Xác nhận xong Makeup"
                  )}
                </button>
              )}

              {selectedBooking && role === "PHOTOGRAPHER" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openPostProdModal(selectedBooking);
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-gold-luxury border border-gold-luxury/30 px-5 py-2 rounded font-bold transition-all cursor-pointer"
                >
                  📸 Cập nhật Hậu kỳ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE POST PRODUCTION DETAILS */}
      {isPostProdModalOpen && postProdBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden w-full max-w-xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-zinc-500 text-xs font-bold uppercase block">Hậu kỳ &amp; Bàn giao hình ảnh</span>
                <h3 className="font-playfair text-base font-bold text-white mt-0.5">
                  Đơn hàng: {postProdBooking.bookingCode} — Khách: {postProdBooking.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsPostProdModalOpen(false); setPostProdBooking(null); }}
                className="w-8 h-8 rounded-full bg-zinc-850 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePostProdSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                
                {/* Status messages */}
                {postProdSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {postProdSuccess}
                  </div>
                )}
                {postProdError && (
                  <div className="bg-rose-950/40 border border-rose-900/60 text-rose-400 p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {postProdError}
                  </div>
                )}

                {/* Info Note on delivered email */}
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-4.5 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 shrink-0" style={{ fontSize: 20 }}>info</span>
                  <div className="space-y-1 text-zinc-400 leading-relaxed text-[11px]">
                    <p className="font-bold text-zinc-200">Quy tắc tự động hóa từ Studio:</p>
                    <p>Khi chọn trạng thái <strong className="text-emerald-400">DELIVERED (Đã bàn giao)</strong>, hệ thống sẽ ngay lập tức **tự động gửi email thông báo sang trọng** gửi trực tiếp link ảnh Raw và Edited tới khách hàng.</p>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  {/* Production Status Select */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Tiến độ hình ảnh</label>
                    <div className="relative">
                      <select
                        value={productionStatus}
                        onChange={(e) => setProductionStatus(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-luxury transition-all appearance-none cursor-pointer font-hanken"
                        required
                      >
                        <option value="UNPROCESSED">Chưa xử lý (UNPROCESSED)</option>
                        <option value="EDITING">Đang chỉnh sửa (EDITING)</option>
                        <option value="WAITING_APPROVAL">Chờ khách duyệt (WAITING_APPROVAL)</option>
                        <option value="DELIVERED">Đã hoàn thành bàn giao (DELIVERED)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" style={{ fontSize: 18 }}>
                        unfold_more
                      </span>
                    </div>
                  </div>

                  {/* Raw photo link */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Link thư mục ảnh gốc (Google Drive / Dropbox)</label>
                    <input
                      type="url"
                      value={rawPhotoLink}
                      onChange={(e) => setRawPhotoLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-luxury transition-all"
                    />
                  </div>

                  {/* Edited photo link */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Link thư mục ảnh đã sửa (Edited)</label>
                    <input
                      type="url"
                      value={editedPhotoLink}
                      onChange={(e) => setEditedPhotoLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-luxury transition-all"
                    />
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Ghi chú/Hướng dẫn hậu kỳ thêm</label>
                    <textarea
                      value={postProdNote}
                      onChange={(e) => setPostProdNote(e.target.value)}
                      rows={3}
                      placeholder="Điền thông điệp blend màu hoặc lời nhắn gửi tới khách hàng..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-luxury transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex justify-end gap-3 shadow-inner">
                <button
                  type="button"
                  disabled={savingPostProd}
                  onClick={() => { setIsPostProdModalOpen(false); setPostProdBooking(null); }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4.5 py-2 rounded font-semibold transition-all cursor-pointer border border-zinc-700/60 disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingPostProd}
                  className="bg-gold-luxury hover:bg-amber-500 text-black px-5 py-2 rounded font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-gold-luxury/10"
                >
                  {savingPostProd ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                      Đang xử lý lưu ca...
                    </>
                  ) : (
                    "Cập nhật & Lưu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
