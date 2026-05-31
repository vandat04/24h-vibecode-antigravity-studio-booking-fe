"use client";

import { useEffect, useState, useRef } from "react";
import { guestApi, adminApi } from "@/lib/api";

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStory, setDeletingStory] = useState<any | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageAfterUrl, setImageAfterUrl] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [isDisplayed, setIsDisplayed] = useState(true);

  // Upload States
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch stories list
  const fetchStories = () => {
    setLoading(true);
    const pageSize = 10;
    guestApi
      .getStories()
      .then((data) => {
        if (data && Array.isArray(data)) {
          const offset = page * pageSize;
          const paginatedData = data.slice(offset, offset + pageSize);
          setStories(paginatedData);
          setTotalPages(Math.ceil(data.length / pageSize) || 1);
        } else {
          setStories([]);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setStories([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, [page]);

  const handleOpenCreate = () => {
    setEditingStory(null);
    setCustomerName("");
    setAvatarUrl("");
    setImageAfterUrl("");
    setStoryContent("");
    setIsDisplayed(true);
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (story: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    setEditingStory(story);

    setCustomerName(story.customerName || "");
    setAvatarUrl(story.avatarUrl || "");
    setImageAfterUrl(story.imageAfterUrl || "");
    setStoryContent(story.storyContent || "");
    setIsDisplayed(story.isDisplayed !== false);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (!deletingStory || deleting) return;
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    adminApi
      .deleteAdminStory(deletingStory.id)
      .then(() => {
        setSuccessMsg("Xóa câu chuyện khách hàng thành công!");
        fetchStories();
        setTimeout(() => {
          setIsDeleteOpen(false);
          setDeleting(false);
        }, 1500);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi xóa câu chuyện");
        setDeleting(false);
      });
  };

  const handleUploadBefore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBefore(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminApi.uploadFile(file, "stories");
      if (res && res.url) {
        setAvatarUrl(res.url);
        setSuccessMsg("Tải ảnh chân dung (Before) lên thành công!");
      } else {
        setErrorMsg("Tải ảnh lên thất bại, không nhận được URL!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tải ảnh chân dung!");
    } finally {
      setUploadingBefore(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadAfter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAfter(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminApi.uploadFile(file, "stories");
      if (res && res.url) {
        setImageAfterUrl(res.url);
        setSuccessMsg("Tải ảnh nghệ thuật (After) lên thành công!");
      } else {
        setErrorMsg("Tải ảnh lên thất bại, không nhận được URL!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tải ảnh nghệ thuật!");
    } finally {
      setUploadingAfter(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!customerName || customerName.trim() === "") {
      setErrorMsg("Vui lòng điền họ tên khách hàng!");
      return;
    }

    if (!storyContent || storyContent.trim() === "") {
      setErrorMsg("Vui lòng nhập nội dung đánh giá của khách hàng!");
      return;
    }

    const payload = {
      customerName,
      avatarUrl: avatarUrl || null,
      imageAfterUrl: imageAfterUrl || null,
      storyContent,
      isDisplayed,
    };

    setSaving(true);
    if (editingStory) {
      adminApi
        .updateAdminStory(editingStory.id, payload)
        .then(() => {
          setSuccessMsg("Cập nhật câu chuyện khách hàng thành công!");
          fetchStories();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi cập nhật câu chuyện");
          setSaving(false);
        });
    } else {
      adminApi
        .createAdminStory(payload)
        .then(() => {
          setSuccessMsg("Tạo câu chuyện khách hàng mới thành công!");
          fetchStories();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi tạo câu chuyện mới");
          setSaving(false);
        });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Bảng Câu chuyện khách hàng (Stories / Review)</h2>
          <p className="text-xs text-zinc-400 mt-1">Quản lý phản hồi khách hàng, album Before/After phỏng vấn dịch vụ thực tế.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1 bg-gold-luxury hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Tạo Story mới
        </button>
      </div>

      {/* Grid List Table */}
      {loading && stories.length === 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-hanken">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Ảnh Before</th>
                  <th className="py-4 px-4">Ảnh After</th>
                  <th className="py-4 px-4">Tên khách hàng</th>
                  <th className="py-4 px-4">Nội dung câu chuyện</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {stories.length > 0 ? (
                  stories.map((story) => (
                    <tr key={story.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800">
                          {story.avatarUrl ? (
                            <img src={story.avatarUrl} alt="Before" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>portrait</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded border border-zinc-700 overflow-hidden bg-zinc-800">
                          {story.imageAfterUrl ? (
                            <img src={story.imageAfterUrl} alt="After" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white uppercase tracking-wider">{story.customerName}</td>
                      <td className="py-3 px-4 text-zinc-400 max-w-[250px] truncate">{story.storyContent}</td>
                      <td className="py-3 px-4">
                        {story.isDisplayed !== false ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-semibold font-sans">Đang hiển thị</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 text-[9px] font-semibold font-sans">Tạm ẩn</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(story)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingStory(story); setErrorMsg(""); setSuccessMsg(""); setIsDeleteOpen(true); }}
                          className="bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 italic">
                      Chưa có câu chuyện khách hàng nào được tạo trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-500 text-[11px] font-semibold">Trang {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => setPage(page - 1)}
                  className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/80 disabled:opacity-30 px-3 py-1.5 rounded text-[11px] text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage(page + 1)}
                  className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-800/80 disabled:opacity-30 px-3 py-1.5 rounded text-[11px] text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Add/Edit Story Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-5 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold font-playfair text-white">
                {editingStory ? `Chỉnh sửa Đánh giá: ${editingStory.customerName}` : "Ghi nhận đánh giá khách hàng mới"}
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold">✓ {successMsg}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Họ tên khách hàng</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  placeholder="CHỊ HỒ THU HÀ..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              {/* ─── UPLOAD BỘ ĐÔI BEFORE / AFTER ─── */}

              {/* 1. Before Image (Avatar) */}
              <div className="space-y-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh chân dung trước (Before / Avatar)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={saving}
                    placeholder="URL ảnh Before..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury text-[11px] disabled:opacity-50"
                  />
                  <input
                    type="file"
                    ref={fileInputBeforeRef}
                    onChange={handleUploadBefore}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingBefore || saving}
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="px-2.5 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingBefore ? (
                      <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                    )}
                    Tải ảnh
                  </button>
                </div>
                
                {avatarUrl && (
                  <div className="relative mt-1 w-full max-w-[120px] aspect-square rounded-full border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group mx-auto">
                    <img src={avatarUrl} alt="Before Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setAvatarUrl("")}
                      className="absolute inset-0 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold disabled:opacity-0"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>

              {/* 2. After Image (Nghệ thuật) */}
              <div className="space-y-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh sau khi chụp (After / Nghệ thuật)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={saving}
                    placeholder="URL ảnh After..."
                    value={imageAfterUrl}
                    onChange={(e) => setImageAfterUrl(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury text-[11px] disabled:opacity-50"
                  />
                  <input
                    type="file"
                    ref={fileInputAfterRef}
                    onChange={handleUploadAfter}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingAfter || saving}
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="px-2.5 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingAfter ? (
                      <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                    )}
                    Tải ảnh
                  </button>
                </div>
                
                {imageAfterUrl && (
                  <div className="relative mt-1 w-full max-w-[150px] aspect-[4/3] rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group mx-auto">
                    <img src={imageAfterUrl} alt="After Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setImageAfterUrl("")}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-650 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-0"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Lời phản hồi, phỏng vấn thực tế</label>
                <textarea
                  rows={4}
                  required
                  disabled={saving}
                  placeholder="Cảm ơn team Leon Studio đã rất chu đáo, trang điểm nhẹ nhàng tự nhiên và bối cảnh setup rất có tâm..."
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 resize-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDisplayedBox"
                  disabled={saving}
                  checked={isDisplayed}
                  onChange={(e) => setIsDisplayed(e.target.checked)}
                  className="w-4 h-4 text-gold-luxury bg-zinc-900 border-zinc-800 rounded focus:ring-0 disabled:opacity-50"
                />
                <label htmlFor="isDisplayedBox" className="text-zinc-300 font-semibold cursor-pointer disabled:opacity-50">Cho phép hiển thị lên Website công khai</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsFormOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-5 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving || uploadingBefore || uploadingAfter}
                className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : editingStory ? (
                  "Cập nhật câu chuyện"
                ) : (
                  "Ghi nhận Story"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {isDeleteOpen && deletingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 text-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-md font-bold font-playfair text-white">Xác nhận xóa Story</h3>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-2 rounded text-[11px] font-semibold">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-3 py-2 rounded text-[11px] font-semibold">✓ {successMsg}</div>}

            <p className="text-[11px] text-zinc-400">Bạn có chắc chắn muốn xóa vĩnh viễn câu chuyện của khách hàng **{deletingStory.customerName}** khỏi hệ thống không? Hành động này không thể hoàn tác.</p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {deleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xác nhận xóa bỏ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
