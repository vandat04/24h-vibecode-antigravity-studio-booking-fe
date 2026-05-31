"use client";

import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/lib/api";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [relatedConceptId, setRelatedConceptId] = useState<string>("");

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch blogs list
  const fetchBlogs = () => {
    setLoading(true);
    const pageSize = 10;
    adminApi
      .getAdminBlogs(page, pageSize)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setBlogs(data);
          setTotalPages(data.length === pageSize ? page + 2 : page + 1);
        } else if (data && data.content) {
          setBlogs(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setBlogs([]);
        }
      })
      .catch(() => {
        setBlogs([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  // Fetch concepts list for related dropdown
  const fetchConcepts = () => {
    adminApi
      .getConcepts(0, 100)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setConcepts(data);
        } else if (data && data.content) {
          setConcepts(data.content);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  useEffect(() => {
    fetchConcepts();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle("");
    setThumbnailUrl("");
    setContent("");
    setStatus("DRAFT");
    setRelatedConceptId("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    setEditingBlog(blog);

    adminApi
      .getAdminBlogById(blog.id)
      .then((detail) => {
        setTitle(detail.title || "");
        setThumbnailUrl(detail.thumbnailUrl || "");
        setContent(detail.content || "");
        setStatus(detail.status || "DRAFT");
        setRelatedConceptId(detail.concept?.id ? String(detail.concept.id) : "");
        setIsFormOpen(true);
      })
      .catch(() => {
        // Fallback prefill from summary row
        setTitle(blog.title || "");
        setThumbnailUrl(blog.thumbnailUrl || "");
        setContent(blog.content || "");
        setStatus(blog.status || "DRAFT");
        setRelatedConceptId(blog.relatedConceptId ? String(blog.relatedConceptId) : "");
        setIsFormOpen(true);
      });
  };

  const handleDelete = () => {
    if (!deletingBlog || deleting) return;
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    adminApi
      .deleteAdminBlog(deletingBlog.id)
      .then(() => {
        setSuccessMsg("Xóa bài viết Blog thành công!");
        fetchBlogs();
        setTimeout(() => {
          setIsDeleteOpen(false);
          setDeleting(false);
        }, 1500);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi xóa bài viết");
        setDeleting(false);
      });
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await adminApi.uploadFile(file, "blogs");
      if (res && res.url) {
        setThumbnailUrl(res.url);
        setSuccessMsg("Tải ảnh bìa bài viết lên Cloudinary thành công!");
      } else {
        setErrorMsg("Tải ảnh lên thất bại, không nhận được URL!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tải ảnh lên Cloudinary!");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!thumbnailUrl || thumbnailUrl.trim() === "") {
      setErrorMsg("Vui lòng tải lên hoặc dán URL ảnh bìa cho bài viết!");
      return;
    }

    if (!content || content.trim() === "") {
      setErrorMsg("Vui lòng nhập nội dung chi tiết bài viết!");
      return;
    }

    const payload = {
      title,
      thumbnailUrl,
      content,
      status,
    };

    const conceptIdNum = relatedConceptId ? Number(relatedConceptId) : undefined;

    setSaving(true);
    if (editingBlog) {
      adminApi
        .updateAdminBlog(editingBlog.id, payload, conceptIdNum)
        .then(() => {
          setSuccessMsg("Cập nhật bài viết thành công!");
          fetchBlogs();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi cập nhật bài viết");
          setSaving(false);
        });
    } else {
      adminApi
        .createAdminBlog(payload, conceptIdNum)
        .then(() => {
          setSuccessMsg("Tạo bài viết mới thành công!");
          fetchBlogs();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi tạo bài viết mới");
          setSaving(false);
        });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Bảng cấu hình Bài viết (CMS)</h2>
          <p className="text-xs text-zinc-400 mt-1">Quản lý các bài viết cẩm nang chia sẻ, tin tức studio, và liên kết concept gợi ý.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1 bg-gold-luxury hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Tạo bài viết mới
        </button>
      </div>

      {/* Grid List Table */}
      {loading && blogs.length === 0 ? (
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
                  <th className="py-4 px-4">Ảnh bìa</th>
                  <th className="py-4 px-4">Tiêu đề bài viết</th>
                  <th className="py-4 px-4">Concept gợi ý</th>
                  <th className="py-4 px-4">Ngày cập nhật</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded border border-zinc-700 overflow-hidden bg-zinc-800">
                          {blog.thumbnailUrl ? (
                            <img src={blog.thumbnailUrl} alt={blog.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>article</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white max-w-[250px] truncate uppercase tracking-wider">
                        <div>{blog.title}</div>
                        <div className="text-[10px] text-zinc-500 font-normal mt-0.5">slug: {blog.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        {blog.concept || blog.relatedConceptTitle ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950/20 text-gold-luxury border border-amber-900/30 text-[9px] font-bold">
                            {blog.concept?.title || blog.relatedConceptTitle}
                          </span>
                        ) : (
                          <span className="text-zinc-600 italic">Chưa liên kết</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{formatDate(blog.updatedAt || blog.createdAt)}</td>
                      <td className="py-3 px-4">
                        {blog.status === "PUBLISHED" ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-semibold font-sans">Công khai</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 text-[9px] font-semibold font-sans">Bản nháp</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(blog)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingBlog(blog); setErrorMsg(""); setSuccessMsg(""); setIsDeleteOpen(true); }}
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
                      Chưa có bài viết blog nào được tạo trong hệ thống.
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

      {/* ─── Add/Edit Blog Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-5 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold font-playfair text-white">
                {editingBlog ? `Chỉnh sửa bài viết: ${editingBlog.title}` : "Viết bài chia sẻ mới"}
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
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tiêu đề bài viết</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  placeholder="5 MẸO TẠO DÁNG TỰ NHIÊN KHI CHỤP ẢNH BEAUTY..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Concept chụp ảnh liên quan</label>
                <select
                  value={relatedConceptId}
                  disabled={saving}
                  onChange={(e) => setRelatedConceptId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-350 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury cursor-pointer disabled:opacity-50"
                >
                  <option value="">Không có concept liên kết</option>
                  {concepts.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.title} ({concept.conceptType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Trạng thái xuất bản CMS</label>
                <select
                  value={status}
                  disabled={saving}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-350 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury cursor-pointer disabled:opacity-50"
                >
                  <option value="PUBLISHED">Công khai trên Website (PUBLISHED)</option>
                  <option value="DRAFT">Lưu bản nháp ẩn (DRAFT)</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh bìa bài viết (Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={saving}
                    placeholder="Đường dẫn ảnh bìa bài viết (hoặc upload)..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadThumbnail}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading || saving}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? (
                      <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    )}
                    Tải ảnh lên
                  </button>
                </div>
                
                {/* Image Preview Area */}
                {thumbnailUrl && (
                  <div className="relative mt-2 w-full max-w-[200px] aspect-[4/3] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group">
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setThumbnailUrl("")}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-650 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Nội dung chi tiết bài viết (Rich Text / HTML)</label>
                <textarea
                  rows={10}
                  required
                  disabled={saving}
                  placeholder="<h2>1. Mẹo đầu tiên...</h2><p>Hãy viết nội dung chia sẻ ở đây...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 resize-none font-mono focus:border-gold-luxury disabled:opacity-50"
                />
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
                disabled={saving || uploading}
                className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : editingBlog ? (
                  "Cập nhật bài viết"
                ) : (
                  "Đăng bài"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {isDeleteOpen && deletingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 text-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-md font-bold font-playfair text-white">Xác nhận xóa bài viết</h3>
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

            <p className="text-[11px] text-zinc-400">Bạn có chắc chắn muốn xóa vĩnh viễn bài viết **{deletingBlog.title}** khỏi hệ thống không? Hành động này không thể hoàn tác.</p>

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
