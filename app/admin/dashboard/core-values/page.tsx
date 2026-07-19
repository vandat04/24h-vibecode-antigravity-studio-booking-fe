"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { CoreValue, CoreValueRequest } from "@/types";

const PRESET_ICONS = [
  { name: "verified_user", label: "Khiên bảo vệ" },
  { name: "lightbulb", label: "Bóng đèn sáng tạo" },
  { name: "favorite", label: "Trái tim khách hàng" },
  { name: "workspace_premium", label: "Huy hiệu cao cấp" },
  { name: "star", label: "Ngôi sao" },
  { name: "diamond", label: "Kim cương" },
  { name: "auto_awesome", label: "Nghệ thuật" },
  { name: "shield", label: "Tấm khiên" },
  { name: "handshake", label: "Hợp tác" },
  { name: "recommend", label: "Đánh giá cao" },
];

export default function AdminCoreValuesPage() {
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CoreValue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("verified_user");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isDisplayed, setIsDisplayed] = useState(true);

  const fetchCoreValues = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getAdminCoreValues();
      setCoreValues(data || []);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách giá trị cốt lõi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setIconName("verified_user");
    setSortOrder(coreValues.length + 1);
    setIsDisplayed(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CoreValue) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setIconName(item.iconName || "verified_user");
    setSortOrder(item.sortOrder || 0);
    setIsDisplayed(item.isDisplayed);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Vui lòng nhập tiêu đề!");
    if (!description.trim()) return alert("Vui lòng nhập nội dung mô tả!");

    setSubmitting(true);
    setError("");

    const payload: CoreValueRequest = {
      title: title.trim(),
      description: description.trim(),
      iconName: iconName.trim() || "verified_user",
      sortOrder: Number(sortOrder) || 0,
      isDisplayed,
    };

    try {
      if (editingItem) {
        await adminApi.updateAdminCoreValue(editingItem.id, payload);
        setSuccessMsg("Cập nhật giá trị cốt lõi thành công!");
      } else {
        await adminApi.createAdminCoreValue(payload);
        setSuccessMsg("Thêm giá trị cốt lõi mới thành công!");
      }
      closeModal();
      fetchCoreValues();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item: CoreValue) => {
    try {
      await adminApi.toggleAdminCoreValueDisplay(item.id);
      fetchCoreValues();
    } catch (err: any) {
      alert(err.message || "Không thể thay đổi trạng thái.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giá trị cốt lõi này?")) return;
    try {
      await adminApi.deleteAdminCoreValue(id);
      setSuccessMsg("Đã xóa giá trị cốt lõi.");
      fetchCoreValues();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Xóa thất bại.");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 32 }}>
              verified_user
            </span>
            Quản Lý Giá Trị Cốt Lõi
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Quản lý các giá trị cốt lõi hiển thị ở trang chủ (khối giữa Brand Story và Service Packages)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-gold-luxury hover:bg-gold-dark text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Thêm Giá Trị Cốt Lõi
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 20 }}>check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-400" style={{ fontSize: 20 }}>error</span>
          {error}
        </div>
      )}

      {/* List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-gold-luxury" style={{ fontSize: 32 }}>
              progress_activity
            </span>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : coreValues.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 space-y-3">
            <span className="material-symbols-outlined text-zinc-600" style={{ fontSize: 48 }}>
              folder_off
            </span>
            <p className="text-sm font-medium">Chưa có giá trị cốt lõi nào.</p>
            <button
              onClick={openAddModal}
              className="text-xs text-gold-luxury underline hover:text-white"
            >
              Tạo mới ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 text-center w-16">Icon</th>
                  <th className="px-5 py-3.5">Tiêu đề</th>
                  <th className="px-5 py-3.5">Nội dung</th>
                  <th className="px-5 py-3.5 text-center w-24">Thứ tự</th>
                  <th className="px-5 py-3.5 text-center w-32">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {coreValues.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Icon */}
                    <td className="px-5 py-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold-luxury mx-auto">
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                          {item.iconName || "verified_user"}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-4 font-semibold text-white font-playfair text-base">
                      {item.title}
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 max-w-md text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </td>

                    {/* Sort Order */}
                    <td className="px-5 py-4 text-center font-mono text-zinc-300">
                      {item.sortOrder}
                    </td>

                    {/* Display Status Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          item.isDisplayed
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                        }`}
                      >
                        {item.isDisplayed ? "Hiển thị" : "Đã ẩn"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/30 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-6 p-6 md:p-8 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-playfair text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 24 }}>
                  {editingItem ? "edit" : "add_circle"}
                </span>
                {editingItem ? "Chỉnh Sửa Giá Trị Cốt Lõi" : "Thêm Giá Trị Cốt Lõi Mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Chất lượng và Chuyên nghiệp"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-luxury transition-colors font-playfair font-bold"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nội dung mô tả <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập đoạn văn miêu tả giá trị cốt lõi..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-luxury transition-colors leading-relaxed"
                />
              </div>

              {/* Icon Picker (Preset + Custom) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Biểu tượng (Icon Google Material Symbols)
                </label>
                
                {/* Visual Icon Preview & Input */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border border-gold-luxury/40 flex items-center justify-center text-gold-luxury flex-shrink-0 shadow-inner">
                    <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                      {iconName || "verified_user"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    placeholder="Mã icon (ví dụ: verified_user, lightbulb)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-luxury font-mono"
                  />
                </div>

                {/* Preset List */}
                <p className="text-[11px] text-zinc-500 mb-2">Bấm chọn nhanh icon phổ biến:</p>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_ICONS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setIconName(p.name)}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        iconName === p.name
                          ? "bg-gold-luxury/10 border-gold-luxury text-gold-luxury"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                      title={p.label}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {p.name}
                      </span>
                      <span className="text-[9px] truncate w-full text-center">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order & Display Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Thứ tự sắp xếp
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-luxury"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Trạng thái hiển thị
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDisplayed(!isDisplayed)}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isDisplayed
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                        : "bg-zinc-950 text-zinc-400 border border-zinc-800"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {isDisplayed ? "visibility" : "visibility_off"}
                    </span>
                    {isDisplayed ? "Hiển thị" : "Đã ẩn"}
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold-luxury hover:bg-gold-dark text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Đang lưu..." : editingItem ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
