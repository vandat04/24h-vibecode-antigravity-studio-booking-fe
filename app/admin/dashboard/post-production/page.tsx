"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminPostProductionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Update States
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [prodStatus, setProdStatus] = useState("");
  const [rawLink, setRawLink] = useState("");
  const [editedLink, setEditedLink] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const PAGE_SIZE = 10;

  const fetchPostProductions = () => {
    setLoading(true);
    // Correct API order: (page, size, status?) as defined in adminApi.getPostProductions
    adminApi
      .getPostProductions(page, PAGE_SIZE, statusFilter || undefined)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setItems(data);
          // Dynamic next-page prediction for flat list response
          setTotalPages(data.length === PAGE_SIZE ? page + 2 : page + 1);
        } else if (data && data.content) {
          setItems(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setItems([]);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setItems([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPostProductions();
  }, [page, statusFilter]);

  // Delayed skeleton: show skeleton only if loading takes > 180ms
  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setTimeout(() => setShowSkeleton(true), 180);
    } else {
      setShowSkeleton(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setProdStatus(item.productionStatus);
    setRawLink(item.rawPhotoLink || "");
    setEditedLink(item.editedPhotoLink || "");
    setNote(item.note || "");
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitLoading(false);
  };

  const handleUpdate = () => {
    if (!selectedItem) return;
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitLoading(true);

    const payload = {
      productionStatus: prodStatus,
      rawPhotoLink: rawLink || undefined,
      editedPhotoLink: editedLink || undefined,
      note: note || undefined,
    };

    // bookingId from nested booking object
    const bookingId = selectedItem.booking?.id ?? selectedItem.id;

    adminApi
      .updatePostProduction(bookingId, payload)
      .then(() => {
        setSuccessMsg("Cập nhật tiến độ hậu kỳ thành công!");
        setSelectedItem({
          ...selectedItem,
          productionStatus: prodStatus,
          rawPhotoLink: rawLink,
          editedPhotoLink: editedLink,
          note: note,
        });
        fetchPostProductions();
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi cập nhật tiến độ hậu kỳ. Vui lòng thử lại.");
      })
      .finally(() => setSubmitLoading(false));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNPROCESSED":
        return <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider">Chưa xử lý</span>;
      case "EDITING":
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">Đang chỉnh sửa</span>;
      case "WAITING_APPROVAL":
        return <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">Chờ duyệt</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">Đã bàn giao</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Giám sát &amp; Bàn giao Hậu kỳ</h2>
          <p className="text-xs text-zinc-400 mt-1">Theo dõi tiến độ chỉnh sửa ảnh và lưu trữ/cập nhật link bàn giao cho khách hàng.</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-lg outline-none cursor-pointer focus:border-gold-luxury"
        >
          <option value="">Tất cả tiến độ</option>
          <option value="UNPROCESSED">Chưa xử lý</option>
          <option value="EDITING">Đang chỉnh sửa</option>
          <option value="WAITING_APPROVAL">Chờ duyệt</option>
          <option value="DELIVERED">Đã bàn giao</option>
        </select>
      </div>

      {/* Grid list table */}
      {showSkeleton && items.length === 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative">
          {/* Gold progress line - fixed height, no layout shift */}
          <div className="h-0.5 w-full bg-zinc-950 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-gold-luxury/50 to-transparent animate-pulse transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"}`} />
          </div>

          <div className={`overflow-x-auto min-h-[510px] ${loading ? "pointer-events-none" : ""}`}>
            <table className="w-full text-left text-xs font-hanken">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Mã đơn</th>
                  <th className="py-4 px-4">Khách hàng</th>
                  <th className="py-4 px-4">Trạng thái Hậu kỳ</th>
                  <th className="py-4 px-4">Link ảnh Gốc (Raw)</th>
                  <th className="py-4 px-4">Link ảnh Final</th>
                  <th className="py-4 px-4">Ghi chú</th>
                  <th className="py-4 px-4">Cập nhật lúc</th>
                  <th className="py-4 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-zinc-300">{item.booking?.bookingCode}</td>
                      <td className="py-4 px-4 font-semibold text-white">{item.booking?.customerName}</td>
                      <td className="py-4 px-4">{getStatusBadge(item.productionStatus)}</td>
                      <td className="py-4 px-4">
                        {item.rawPhotoLink ? (
                          <a
                            href={item.rawPhotoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gold-luxury hover:underline"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                            Truy cập Drive
                          </a>
                        ) : (
                          <span className="text-zinc-600 italic">Chưa tải lên</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.editedPhotoLink ? (
                          <a
                            href={item.editedPhotoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cloud_download</span>
                            Ảnh Final
                          </a>
                        ) : (
                          <span className="text-zinc-600 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-zinc-400 max-w-[180px] truncate">{item.note || "—"}</td>
                      <td className="py-4 px-4 text-zinc-500 font-mono text-[10px]">{item.updatedAt?.substring(0, 16).replace("T", " ")}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="bg-zinc-800 hover:bg-gold-luxury hover:text-black text-zinc-300 font-semibold px-3 py-1.5 rounded text-[11px] transition-colors cursor-pointer"
                        >
                          Bàn giao / Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 italic">
                      Không tìm thấy tiến trình hậu kỳ nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - always visible */}
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
        </div>
      )}

      {/* ─── Production Delivery Update Modal ─── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-6 text-zinc-100">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-gold-luxury uppercase tracking-widest font-bold font-mono">BÀN GIAO SẢN PHẨM</span>
                <h3 className="text-xl font-bold font-playfair mt-0.5 text-white">Cập nhật Link Hậu kỳ</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {successMsg}
              </div>
            )}

            {/* Info display */}
            <div className="bg-zinc-950/40 p-4 rounded-xl space-y-2 text-xs text-zinc-300">
              <p><span className="text-zinc-500 font-semibold">Mã Booking:</span> <span className="font-mono font-bold text-white">{selectedItem.booking?.bookingCode}</span></p>
              <p><span className="text-zinc-500 font-semibold">Khách hàng:</span> <span className="font-semibold text-white">{selectedItem.booking?.customerName}</span></p>
            </div>

            {/* Action Inputs */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Tiến độ sản xuất</label>
                <select
                  value={prodStatus}
                  onChange={(e) => setProdStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                >
                  <option value="UNPROCESSED">Chưa xử lý (Mới chụp xong)</option>
                  <option value="EDITING">Đang chỉnh sửa ảnh</option>
                  <option value="WAITING_APPROVAL">Chờ khách hàng duyệt album</option>
                  <option value="DELIVERED">Đã bàn giao thành công</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Link ảnh Gốc (Google Drive/Dropbox)</label>
                <input
                  type="url"
                  placeholder="Nhập đường dẫn Google Drive chứa ảnh thô..."
                  value={rawLink}
                  onChange={(e) => setRawLink(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-700 focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Link ảnh Đã chỉnh sửa (Photoshop/Final)</label>
                <input
                  type="url"
                  placeholder="Nhập đường dẫn chứa album ảnh hoàn thiện..."
                  value={editedLink}
                  onChange={(e) => setEditedLink(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-700 focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Ghi chú tiến độ chỉnh màu</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú tone màu, số lượng ảnh đã hoàn thiện..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-700 resize-none focus:border-gold-luxury"
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-5 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                disabled={submitLoading}
                onClick={handleUpdate}
                className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
              >
                {submitLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                    Đang lưu...
                  </>
                ) : (
                  "Cập nhật thông tin bàn giao"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
