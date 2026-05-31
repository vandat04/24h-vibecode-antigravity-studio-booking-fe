"use client";

import { useEffect, useState } from "react";
import { adminApi, guestApi } from "@/lib/api";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Detail Modal States
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [makeups, setMakeups] = useState<any[]>([]);
  
  // Action Forms States
  const [statusVal, setStatusVal] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [payMethod, setPayMethod] = useState("BANK");
  const [assignPhotoId, setAssignPhotoId] = useState("");
  const [assignMakeupId, setAssignMakeupId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Submitting States
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    const pageSize = 10;
    adminApi
      .getBookings(page, pageSize, statusFilter || undefined)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setBookings(data);
          // Dynamic next-page prediction for flat list response
          setTotalPages(data.length === pageSize ? page + 2 : page + 1);
        } else if (data && data.content) {
          setBookings(data.content);
          setTotalPages(data.totalPages || 1); // Spring Page response
        } else {
          setBookings([]);
        }
      })
      .catch((err) => {
        setBookings([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  // Delayed skeleton pattern: only show skeleton if loading takes > 180ms
  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 180);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Load Staff dropdown list for assignments
  useEffect(() => {
    guestApi.getStaff("PHOTOGRAPHER").then(setPhotographers).catch(() => {});
    guestApi.getStaff("MAKEUP").then(setMakeups).catch(() => {});
  }, []);

  const handleOpenDetail = (booking: any) => {
    setSelectedBooking(booking);
    setStatusVal(booking.bookingStatus);
    setPayStatus(booking.paymentStatus);
    setAssignPhotoId("");
    setAssignMakeupId("");
    setErrorMsg("");
    setSuccessMsg("");
    setStatusLoading(false);
    setPaymentLoading(false);
    setAssignLoading(false);

    // Fetch history
    adminApi
      .getBookingHistory(booking.id)
      .then(setHistory)
      .catch(() => {
        setHistory([]);
      });
  };

  const handleUpdateStatus = () => {
    if (!selectedBooking) return;
    setErrorMsg("");
    setSuccessMsg("");
    setStatusLoading(true);
    adminApi
      .updateBookingStatus(selectedBooking.id, statusVal, statusNote || undefined)
      .then((res) => {
        setSuccessMsg("Cập nhật trạng thái booking thành công!");
        setSelectedBooking({ ...selectedBooking, bookingStatus: statusVal });
        fetchBookings();
        // Refresh booking history log
        adminApi.getBookingHistory(selectedBooking.id).then(setHistory).catch(() => {});
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi cập nhật trạng thái");
      })
      .finally(() => {
        setStatusLoading(false);
      });
  };

  const handleUpdatePayment = () => {
    if (!selectedBooking) return;
    setErrorMsg("");
    setSuccessMsg("");
    setPaymentLoading(true);
    adminApi
      .updatePaymentStatus(selectedBooking.id, payStatus, payMethod)
      .then((res) => {
        setSuccessMsg("Cập nhật trạng thái thanh toán thành công!");
        setSelectedBooking({ ...selectedBooking, paymentStatus: payStatus });
        fetchBookings();
        // Refresh booking history log
        adminApi.getBookingHistory(selectedBooking.id).then(setHistory).catch(() => {});
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi cập nhật thanh toán");
      })
      .finally(() => {
        setPaymentLoading(false);
      });
  };

  const handleAssignStaff = () => {
    if (!selectedBooking || !assignPhotoId || !assignMakeupId) return;
    setErrorMsg("");
    setSuccessMsg("");
    setAssignLoading(true);
    adminApi
      .assignStaff(selectedBooking.id, Number(assignPhotoId), Number(assignMakeupId))
      .then((res) => {
        setSuccessMsg("Phân công ê-kíp phục vụ thành công!");
        setSelectedBooking({
          ...selectedBooking,
          bookingStatus: "ASSIGNED",
          assignedStaff: [
            { fullName: photographers.find(p => p.userId === Number(assignPhotoId))?.fullName || "Thợ chụp ảnh", role: "PHOTOGRAPHER" },
            { fullName: makeups.find(m => m.userId === Number(assignMakeupId))?.fullName || "Thợ trang điểm", role: "MAKEUP" },
          ]
        });
        fetchBookings();
        // Refresh booking history log
        adminApi.getBookingHistory(selectedBooking.id).then(setHistory).catch(() => {});
      })
      .catch((err) => {
        setErrorMsg(err.message || "Không thể phân công: Nhân sự đã kẹt ca chụp vào thời điểm này.");
      })
      .finally(() => {
        setAssignLoading(false);
      });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Quản lý Đơn đặt lịch (Bookings)</h2>
          <p className="text-xs text-zinc-400 mt-1">Duyệt ca, kiểm tra thanh toán, phân công ê-kíp và theo dõi nhật ký lịch sử.</p>
        </div>

        {/* Status Quick Filters */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-lg outline-none cursor-pointer focus:border-gold-luxury"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="ASSIGNED">Đã phân công</option>
          <option value="SHOOTING">Đang chụp hình</option>
          <option value="EDITING">Đang hậu kỳ</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Grid List Table */}
      {showSkeleton && bookings.length === 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative">
          {/* Subtle golden loading line with fixed height to prevent layout shift */}
          <div className="h-0.5 w-full bg-zinc-950 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-gold-luxury/50 to-transparent animate-pulse transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"}`} />
          </div>

          <div className={`overflow-x-auto min-h-[510px] ${loading ? "pointer-events-none" : ""}`}>
            <table className="w-full text-left text-xs font-hanken">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Mã đơn</th>
                  <th className="py-4 px-4">Khách hàng</th>
                  <th className="py-4 px-4">Liên hệ</th>
                  <th className="py-4 px-4">Lịch chụp</th>
                  <th className="py-4 px-4">Tổng tiền</th>
                  <th className="py-4 px-4">Thanh toán</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-zinc-300">{b.bookingCode}</td>
                      <td className="py-4 px-4 font-semibold text-white">{b.customerName}</td>
                      <td className="py-4 px-4 text-zinc-400">
                        <div>{b.customerPhone}</div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[120px]">{b.customerEmail}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-zinc-300">{b.shootDate}</div>
                        <div className="text-[10px] text-gold-luxury font-semibold">{b.shootTimeSlot?.substring(0, 5)}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-200">{formatPrice(b.totalAmount)}</td>
                      <td className="py-4 px-4">
                        {b.paymentStatus === "UNPAID" && <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40 text-[9px] font-semibold">Chưa trả</span>}
                        {b.paymentStatus === "DEPOSITED" && <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/40 text-[9px] font-semibold">Đã cọc</span>}
                        {b.paymentStatus === "PAID" && <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 text-[9px] font-semibold">Đã thanh toán</span>}
                      </td>
                      <td className="py-4 px-4">
                        {b.bookingStatus === "PENDING" && <span className="px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 text-[9px] font-bold uppercase tracking-wider">Chờ duyệt</span>}
                        {b.bookingStatus === "CONFIRMED" && <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[9px] font-bold uppercase tracking-wider">Đã xác nhận</span>}
                        {b.bookingStatus === "ASSIGNED" && <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[9px] font-bold uppercase tracking-wider">Đã phân công</span>}
                        {b.bookingStatus === "SHOOTING" && <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[9px] font-bold uppercase tracking-wider">Đang chụp hình</span>}
                        {b.bookingStatus === "EDITING" && <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[9px] font-bold uppercase tracking-wider">Đang hậu kỳ</span>}
                        {b.bookingStatus === "COMPLETED" && <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold uppercase tracking-wider">Hoàn thành</span>}
                        {b.bookingStatus === "CANCELLED" && <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] font-bold uppercase tracking-wider">Đã hủy</span>}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(b)}
                          className="bg-zinc-800 hover:bg-gold-luxury hover:text-black text-zinc-300 font-semibold px-3 py-1.5 rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 italic">
                      Không tìm thấy đơn đặt lịch nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages >= 1 && (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-500 text-xs">Trang {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded text-xs text-white"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded text-xs text-white"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Detail Control Room Modal ─── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto space-y-6 text-zinc-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-gold-luxury uppercase tracking-widest font-bold font-mono">Đơn đặt #{selectedBooking.bookingCode}</span>
                <h3 className="text-xl font-bold font-playfair mt-0.5 text-white">Quản lý chi tiết lịch chụp</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Error and Success Indicators */}
            {errorMsg && (
              <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-4 py-3 rounded-lg text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-4 py-3 rounded-lg text-xs font-semibold">
                ✓ {successMsg}
              </div>
            )}

            {/* Modal Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Specs Details */}
              <div className="space-y-4 md:col-span-1 border-r md:border-r border-zinc-800/60 pr-6">
                <div className="bg-zinc-950/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs text-gold-luxury uppercase font-bold tracking-wider">Thông tin khách</h4>
                  <div className="text-xs space-y-1.5">
                    <p className="text-white font-semibold">Tên: {selectedBooking.customerName}</p>
                    <p className="text-zinc-400">SĐT: {selectedBooking.customerPhone}</p>
                    <p className="text-zinc-400 truncate">Email: {selectedBooking.customerEmail}</p>
                    {selectedBooking.customerFacebook && (
                      <p className="text-zinc-400 truncate">FB: <a href={selectedBooking.customerFacebook} target="_blank" className="text-gold-luxury hover:underline">Link Facebook</a></p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-950/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs text-gold-luxury uppercase font-bold tracking-wider">Thông tin chụp</h4>
                  <div className="text-xs space-y-1.5">
                    <p className="text-white font-semibold">Gói: {selectedBooking.packageName}</p>
                    <p className="text-zinc-300">Concept: {selectedBooking.conceptTitle}</p>
                    <p className="text-zinc-300">Ngày: {selectedBooking.shootDate}</p>
                    <p className="text-gold-luxury font-bold">Khung giờ: {selectedBooking.shootTimeSlot?.substring(0, 5)}</p>
                    <p className="text-zinc-400 leading-relaxed">Địa điểm: {selectedBooking.shootLocation}</p>
                    <p className="text-zinc-500 italic mt-2">Ghi chú khách: "{selectedBooking.customerNotes || "Không có ghi chú"}"</p>
                  </div>
                </div>
              </div>

              {/* Middle Column: Operational Control Panel */}
              <div className="space-y-5 md:col-span-1">
                {/* Status Update Form */}
                <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/40 space-y-3">
                  <h4 className="text-xs text-white uppercase font-bold tracking-wider">Vòng đời Đơn đặt</h4>
                  <div className="space-y-2">
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="ASSIGNED">Đã phân công</option>
                      <option value="SHOOTING">Đang chụp hình</option>
                      <option value="EDITING">Đang hậu kỳ</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Lý do/Ghi chú đổi..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none placeholder-zinc-600"
                    />
                    <button
                      disabled={statusLoading}
                      onClick={handleUpdateStatus}
                      className="w-full bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs py-2 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      {statusLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật trạng thái"
                      )}
                    </button>
                  </div>
                </div>

                {/* Payment Update Form */}
                <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/40 space-y-3">
                  <h4 className="text-xs text-white uppercase font-bold tracking-wider">Trạng thái thanh toán</h4>
                  <div className="space-y-2">
                    <select
                      value={payStatus}
                      onChange={(e) => setPayStatus(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none"
                    >
                      <option value="UNPAID">Chưa thanh toán</option>
                      <option value="DEPOSITED">Đã đặt cọc</option>
                      <option value="PAID">Đã thanh toán đủ</option>
                    </select>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none"
                    >
                      <option value="BANK">Chuyển khoản (BANK)</option>
                      <option value="CASH">Tiền mặt (CASH)</option>
                    </select>
                    <button
                      disabled={paymentLoading}
                      onClick={handleUpdatePayment}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      {paymentLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Đang ghi nhận...
                        </>
                      ) : (
                        "Ghi nhận giao dịch"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Crew Allocation & History Logs */}
              <div className="space-y-5 md:col-span-1">
                {/* Crew Allocation Panel */}
                <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/40 space-y-3">
                  <h4 className="text-xs text-white uppercase font-bold tracking-wider">Phân công Ê-kíp phục vụ</h4>
                  
                  {selectedBooking.assignedStaff && selectedBooking.assignedStaff.length > 0 ? (
                    <div className="text-xs space-y-2 mb-3">
                      <p className="text-zinc-400 font-semibold">Nhân sự đã gán:</p>
                      {selectedBooking.assignedStaff.map((s: any, idx: number) => (
                        <div key={idx} className="flex justify-between bg-zinc-900/60 p-2 rounded border border-zinc-800 text-zinc-300">
                          <span>{s.fullName}</span>
                          <span className="text-[10px] text-gold-luxury uppercase font-bold font-mono">{s.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic text-[11px] mb-3">Chưa phân công ê-kíp.</p>
                  )}

                  <div className="space-y-2">
                    <select
                      value={assignPhotoId}
                      onChange={(e) => setAssignPhotoId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none"
                    >
                      <option value="">Chọn Nhiếp ảnh gia...</option>
                      {photographers.map(p => (
                        <option key={p.userId} value={p.userId}>{p.fullName} ({p.yearsOfExperience} năm KN)</option>
                      ))}
                    </select>
                    <select
                      value={assignMakeupId}
                      onChange={(e) => setAssignMakeupId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded outline-none"
                    >
                      <option value="">Chọn Thợ Makeup...</option>
                      {makeups.map(m => (
                        <option key={m.userId} value={m.userId}>{m.fullName} ({m.yearsOfExperience} năm KN)</option>
                      ))}
                    </select>
                    <button
                      disabled={!assignPhotoId || !assignMakeupId || assignLoading}
                      onClick={handleAssignStaff}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs py-2 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {assignLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Đang phân công...
                        </>
                      ) : (
                        "Xác nhận phân công"
                      )}
                    </button>
                  </div>
                </div>

                {/* Status History Audit logs */}
                <div className="space-y-3">
                  <h4 className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Nhật ký trạng thái</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {history.map((h: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950/20 p-3 rounded-lg border border-zinc-800 text-[10px] space-y-1">
                        <div className="flex justify-between font-mono text-zinc-500">
                          <span>{h.changedAt?.substring(0, 16).replace("T", " ")}</span>
                          <span className="text-gold-luxury">{h.newStatus}</span>
                        </div>
                        <p className="text-zinc-400">{h.note || "Hệ thống ghi nhận sự thay đổi."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
