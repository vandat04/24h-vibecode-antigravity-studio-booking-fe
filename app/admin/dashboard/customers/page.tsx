"use client";

import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    adminApi
      .getCustomers(page, 8, searchQuery || undefined)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setCustomers(data);
          setTotalPages(1);
        } else if (data && data.content) {
          setCustomers(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => {
        setCustomers([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Live Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Quản lý Khách hàng (CRM)</h2>
          <p className="text-xs text-zinc-400 mt-1">Hồ sơ khách hàng, thống kê số lần đặt lịch và tổng chi tiêu (LTV).</p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs px-10 py-3 rounded-lg outline-none placeholder-zinc-600 focus:border-gold-luxury"
          />
          <span className="material-symbols-outlined text-zinc-600 absolute left-3 top-3 text-[18px]">
            search
          </span>
        </div>
      </div>

      {/* Grid List Table */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-hanken">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Tên khách hàng</th>
                  <th className="py-4 px-4">Số điện thoại</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4 text-center">Tổng lượt đặt</th>
                  <th className="py-4 px-4">Tổng chi tiêu (LTV)</th>
                  <th className="py-4 px-4 text-right">Lịch sử chụp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {customers.length > 0 ? (
                  customers.map((c, idx) => {
                    const uniqueId = `${c.customerPhone}-${idx}`;
                    const isExpanded = expandedId === uniqueId;
                    return (
                      <React.Fragment key={uniqueId}>
                        <tr className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 px-4 font-semibold text-white">{c.customerName}</td>
                          <td className="py-4 px-4 text-zinc-300 font-semibold">{c.customerPhone}</td>
                          <td className="py-4 px-4 text-zinc-400">{c.customerEmail || "Chưa cập nhật"}</td>
                          <td className="py-4 px-4 text-center font-bold text-gold-luxury">{c.totalBookings} đơn</td>
                          <td className="py-4 px-4 font-black text-white">{formatPrice(c.totalSpent)}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => toggleExpand(uniqueId)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-3 py-1.5 rounded text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Lịch sử đặt</span>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                                {isExpanded ? "expand_less" : "expand_more"}
                              </span>
                            </button>
                          </td>
                        </tr>

                        {/* Expandable History Drawer */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-zinc-950/50 p-4 border-t border-zinc-800/60">
                              <div className="space-y-3">
                                <h4 className="text-[10px] text-gold-luxury uppercase font-bold tracking-wider">Nhật ký lịch chụp khách hàng</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {c.bookingHistory && c.bookingHistory.length > 0 ? (
                                    c.bookingHistory.map((h: any, hIdx: number) => (
                                      <div key={hIdx} className="bg-zinc-900 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                          <span className="font-mono font-bold text-zinc-300">#{h.bookingCode}</span>
                                          {h.status === "COMPLETED" && <span className="text-emerald-400 font-bold uppercase tracking-wider">Hoàn thành</span>}
                                          {h.status === "CONFIRMED" && <span className="text-blue-400 font-bold uppercase tracking-wider">Đã xác nhận</span>}
                                          {h.status === "PENDING" && <span className="text-yellow-400 font-bold uppercase tracking-wider animate-pulse">Chờ duyệt</span>}
                                        </div>
                                        
                                        <div className="text-[11px] space-y-0.5">
                                          <p className="text-white font-semibold">{h.packageName}</p>
                                          <p className="text-zinc-500">Ngày chụp: {h.shootDate}</p>
                                        </div>

                                        <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-[11px]">
                                          <span className="text-zinc-500">Giá trị đơn:</span>
                                          <span className="font-bold text-zinc-300">{formatPrice(h.totalAmount)}</span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-zinc-600 italic text-[11px] col-span-full">Chưa có lịch sử chụp ghi nhận.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 italic">
                      Không tìm thấy thông tin khách hàng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-500 text-xs">Trang {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 px-3 py-1.5 rounded text-xs text-white"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 px-3 py-1.5 rounded text-xs text-white"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
