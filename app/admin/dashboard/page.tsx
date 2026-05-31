"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import Link from "next/link";

interface Stats {
  totalStaff: number;
  totalBookings: number;
  pendingBookings: number;
  activePackages: number;
}

interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  revenueByDate: { date: string; amount: number }[];
  packagePopularity: { packageName: string; bookingCount: number }[];
}

export default function AdminDashboardOverview() {
  // Initialize to zero and empty structures to prevent any virtual/mock metrics
  const [stats, setStats] = useState<Stats>({
    totalStaff: 0,
    totalBookings: 0,
    pendingBookings: 0,
    activePackages: 0,
  });

  const [revenue, setRevenue] = useState<RevenueData>({
    totalRevenue: 0,
    totalBookings: 0,
    revenueByDate: [],
    packagePopularity: [],
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Detailed Report Modal States
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [reportLoading, setReportLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDetailedReport = () => {
    setReportLoading(true);
    adminApi
      .getRevenue(startDate, endDate)
      .then((data) => {
        if (data) setRevenue(data);
      })
      .catch(() => {})
      .finally(() => setReportLoading(false));
  };

  useEffect(() => {
    // Get user info
    const userStr = localStorage.getItem("studio_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    // Fetch Stats, Revenue and Bookings
    let hasError = false;
    Promise.all([
      adminApi.getStatistics().catch(() => { hasError = true; return null; }),
      adminApi.getRevenue(startDate, endDate).catch(() => { hasError = true; return null; }),
      adminApi.getBookings(0, 5).catch(() => { hasError = true; return null; }),
    ])
      .then(([statsData, revenueData, bookingsData]) => {
        if (statsData) setStats(statsData);
        if (revenueData) setRevenue(revenueData);
        if (bookingsData) {
          if (Array.isArray(bookingsData)) {
            setRecentBookings(bookingsData);
          } else if (bookingsData.content) {
            setRecentBookings(bookingsData.content);
          }
        }
        if (hasError) {
          setErrorMsg("Phiên làm việc đã hết hạn hoặc không kết nối được với máy chủ API. Vui lòng đăng xuất và đăng nhập lại.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 text-[10px] font-bold uppercase tracking-wider">Chờ duyệt</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">Đã xác nhận</span>;
      case "ASSIGNED":
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold uppercase tracking-wider">Đã phân công</span>;
      case "SHOOTING":
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold uppercase tracking-wider">Đang chụp hình</span>;
      case "EDITING":
        return <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-bold uppercase tracking-wider">Đang hậu kỳ</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-3xl font-bold text-white">
            Chào mừng trở lại, <span className="text-gold-luxury">{user?.fullName || "Quản trị viên"}</span>!
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Dưới đây là tổng quan hiệu suất vận hành của Studio ngày hôm nay.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400">warning</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("studio_token");
              localStorage.removeItem("studio_role");
              localStorage.removeItem("studio_user");
              window.location.href = "/login";
            }}
            className="w-full sm:w-auto bg-red-900/30 hover:bg-red-900/50 border border-red-800/60 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer text-center"
          >
            Đăng nhập lại
          </button>
        </div>
      )}

      {/* Quick Metrics KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tổng nhân sự</p>
            <h3 className="text-3xl font-playfair font-black text-white mt-1">{stats.totalStaff} người</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-2 font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>circle</span>
              Đang hoạt động tốt
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold-luxury">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>badge</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Tổng lịch đặt</p>
            <h3 className="text-3xl font-playfair font-black text-white mt-1">{stats.totalBookings} đơn</h3>
            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 mt-2">
              Toàn bộ hệ thống
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold-luxury">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>calendar_month</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Đang chờ duyệt</p>
            <h3 className="text-3xl font-playfair font-black text-white mt-1">{stats.pendingBookings} đơn</h3>
            <span className="text-[10px] text-amber-500 flex items-center gap-0.5 mt-2 font-semibold animate-pulse">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>pending</span>
              Cần Admin xử lý duyệt
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-500">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>notifications_active</span>
          </div>
        </div>

        {/* Dynamic Clickable Revenue Card */}
        <div
          onClick={() => setIsReportOpen(true)}
          className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-gold-luxury transition-all group"
        >
          <div>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider group-hover:text-gold-luxury transition-colors">Doanh thu tháng này</p>
            <h3 className="text-2xl sm:text-3xl font-playfair font-black text-gold-luxury mt-1">{formatPrice(revenue.totalRevenue)}</h3>
            <span className="text-[10px] text-gold-luxury flex items-center gap-0.5 mt-2 font-semibold underline">
              Xem báo cáo chi tiết →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gold-luxury/10 border border-gold-luxury/20 flex items-center justify-center text-gold-luxury group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>monetization_on</span>
          </div>
        </div>
      </div>

      {/* Split Content: Recent bookings & package popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Panel */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-luxury">schedule</span>
              Đơn đặt lịch chụp gần đây
            </h4>
            <Link href="/admin/dashboard/bookings" className="text-xs font-semibold text-gold-luxury hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-hanken">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Mã Booking</th>
                  <th className="py-3 px-2">Khách hàng</th>
                  <th className="py-3 px-2">Ngày chụp</th>
                  <th className="py-3 px-2">Concept</th>
                  <th className="py-3 px-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-2 font-mono font-bold text-zinc-300">{b.bookingCode}</td>
                      <td className="py-4 px-2 font-semibold text-white">{b.customerName}</td>
                      <td className="py-4 px-2 text-zinc-300">{b.shootDate} {b.shootTimeSlot ? `lúc ${b.shootTimeSlot.substring(0, 5)}` : ""}</td>
                      <td className="py-4 px-2 text-zinc-400">{b.conceptTitle}</td>
                      <td className="py-4 px-2">{getStatusBadge(b.bookingStatus)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                      Chưa có đơn chụp gần đây trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Popularity Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-playfair text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-luxury">analytics</span>
              Đo lường gói chụp
            </h4>
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-xs font-semibold text-gold-luxury hover:underline cursor-pointer"
            >
              Xem đầy đủ
            </button>
          </div>

          <div className="space-y-4">
            {revenue.packagePopularity.length > 0 ? (
              revenue.packagePopularity.slice(0, 4).map((p, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-300">{p.packageName}</span>
                    <span className="text-gold-luxury">{p.bookingCount} đơn</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gold-luxury h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (p.bookingCount / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-8">Chưa có số liệu thống kê gói chụp.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detailed Revenue Report Modal ─── */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto space-y-6 text-zinc-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-gold-luxury uppercase tracking-widest font-bold">BÁO CÁO THỐNG KÊ CHI TIẾT</span>
                <h3 className="text-xl font-bold font-playfair mt-0.5 text-white">Báo cáo Doanh thu &amp; Hiệu suất Gói dịch vụ</h3>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Date Picker Query Bar */}
            <div className="flex flex-col sm:flex-row items-end gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60">
              <div className="flex-1 space-y-1.5 text-xs">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-gold-luxury"
                />
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded outline-none focus:border-gold-luxury"
                />
              </div>
              <button
                onClick={fetchDetailedReport}
                className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer w-full sm:w-auto h-[38px] flex items-center justify-center"
              >
                {reportLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                ) : (
                  "Cập nhật báo cáo"
                )}
              </button>
            </div>

            {/* Metrics overview inside report */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/40">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tổng doanh thu kỳ báo cáo</p>
                <h4 className="text-2xl font-playfair font-black text-gold-luxury mt-1">{formatPrice(revenue.totalRevenue)}</h4>
              </div>
              <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/40">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tổng số đơn hoàn tất</p>
                <h4 className="text-2xl font-playfair font-black text-white mt-1">{revenue.totalBookings} đơn đặt</h4>
              </div>
            </div>

            {/* Split Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Daily breakdown */}
              <div className="space-y-3">
                <h4 className="font-playfair text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 16 }}>calendar_today</span>
                  Chi tiết Doanh thu theo Ngày
                </h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left font-hanken">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">Ngày báo cáo</th>
                        <th className="py-2.5 px-3 text-right">Doanh thu thu về</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 bg-zinc-900/20">
                      {revenue.revenueByDate.length > 0 ? (
                        revenue.revenueByDate.map((r, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/20">
                            <td className="py-2.5 px-3 font-semibold text-zinc-300">{r.date}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">{formatPrice(r.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="py-8 text-center text-zinc-500 italic">
                            Chưa có doanh thu trong khoảng thời gian này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Package Popularity full */}
              <div className="space-y-3">
                <h4 className="font-playfair text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 16 }}>assessment</span>
                  Xếp hạng Hiệu suất Gói dịch vụ
                </h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left font-hanken">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-semibold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-3">Tên gói dịch vụ</th>
                        <th className="py-2.5 px-3 text-center">Số lượng đơn</th>
                        <th className="py-2.5 px-3 text-right">Mức độ phổ biến</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 bg-zinc-900/20">
                      {revenue.packagePopularity.length > 0 ? (
                        revenue.packagePopularity.map((p, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/20">
                            <td className="py-2.5 px-3 font-semibold text-zinc-300">{p.packageName}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-gold-luxury">{p.bookingCount} đơn</td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="w-20 bg-zinc-850 h-2 rounded-full overflow-hidden ml-auto">
                                <div
                                  className="bg-gold-luxury h-full rounded-full"
                                  style={{ width: `${Math.min(100, (p.bookingCount / 20) * 100)}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-500 italic">
                            Chưa có thống kê gói chụp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
