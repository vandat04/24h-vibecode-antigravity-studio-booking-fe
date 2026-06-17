"use client";

import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/lib/api";

export default function AdminConceptsPage() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingConcept, setDeletingConcept] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [conceptType, setConceptType] = useState("BEAUTY");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [conceptTypeFilter, setConceptTypeFilter] = useState("ALL");
  const [allUniqueTypes, setAllUniqueTypes] = useState<string[]>([]);
  const [selectedTypeOption, setSelectedTypeOption] = useState("");
  const [customConceptType, setCustomConceptType] = useState("");

  // Upload bìa
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Album ảnh mô tả
  const [conceptImages, setConceptImages] = useState<any[]>([]);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchConcepts = () => {
    setLoading(true);
    adminApi
      .getConcepts(page, 8, conceptTypeFilter)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setConcepts(data);
          setTotalPages(data.length === 8 ? page + 2 : page + 1);
        } else if (data && data.content) {
          setConcepts(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setConcepts([]);
        }
      })
      .catch(() => {
        setConcepts([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConcepts();
  }, [page, conceptTypeFilter]);

  useEffect(() => {
    adminApi
      .getConcepts(0, 1000, "ALL")
      .then((data) => {
        let list: any[] = [];
        if (data && Array.isArray(data)) {
          list = data;
        } else if (data && data.content) {
          list = data.content;
        }
        const types = Array.from(new Set(list.map((c: any) => c.conceptType?.trim().toUpperCase()).filter(Boolean)));
        setAllUniqueTypes(types);
      })
      .catch(() => {});
  }, [concepts]);

  const handleOpenCreate = () => {
    setEditingConcept(null);
    setConceptImages([]);
    setTitle("");
    const defaultType = allUniqueTypes.length > 0 ? allUniqueTypes[0] : "BEAUTY";
    setConceptType(defaultType);
    setSelectedTypeOption(defaultType);
    setCustomConceptType("");
    setThumbnailUrl("");
    setDescription("");
    setStatus("PUBLISHED");
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  };

  const refreshConceptImages = (conceptId: number) => {
    adminApi
      .getConceptById(conceptId)
      .then((detail) => {
        setConceptImages(detail.images || []);
      })
      .catch(() => {});
  };

  const handleOpenEdit = (concept: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    setEditingConcept(concept);
    setConceptImages(concept.images || []);

    adminApi
      .getConceptById(concept.id)
      .then((detail) => {
        setTitle(detail.title || "");
        const type = detail.conceptType || "BEAUTY";
        setConceptType(type);
        if (allUniqueTypes.includes(type)) {
          setSelectedTypeOption(type);
          setCustomConceptType("");
        } else {
          setSelectedTypeOption("CUSTOM");
          setCustomConceptType(type);
        }
        setThumbnailUrl(detail.thumbnailUrl || "");
        setDescription(detail.description || "");
        setStatus(detail.status || "PUBLISHED");
        setConceptImages(detail.images || []);
        setIsFormOpen(true);
      })
      .catch(() => {
        // Fallback prefill from summary row
        setTitle(concept.title || "");
        const type = concept.conceptType || "BEAUTY";
        setConceptType(type);
        if (allUniqueTypes.includes(type)) {
          setSelectedTypeOption(type);
          setCustomConceptType("");
        } else {
          setSelectedTypeOption("CUSTOM");
          setCustomConceptType(type);
        }
        setThumbnailUrl(concept.thumbnailUrl || "");
        setDescription(concept.description || "");
        setStatus(concept.status || "PUBLISHED");
        setConceptImages(concept.images || []);
        setIsFormOpen(true);
      });
  };

  const handleDelete = () => {
    if (!deletingConcept || deleting) return;
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    adminApi
      .deleteConcept(deletingConcept.id)
      .then(() => {
        setSuccessMsg("Xóa Concept thành công!");
        fetchConcepts();
        setTimeout(() => {
          setIsDeleteOpen(false);
          setDeleting(false);
        }, 1500);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi xóa Concept");
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
      const res = await adminApi.uploadFile(file, "concepts");
      if (res && res.url) {
        setThumbnailUrl(res.url);
        setSuccessMsg("Tải ảnh bìa bối cảnh lên Cloudinary thành công!");
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

  const handleUploadAlbumImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingConcept || uploadingAlbum) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAlbum(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await adminApi.addConceptImage(editingConcept.id, file, conceptImages.length);
      setSuccessMsg("Đã tải ảnh mô tả lên album thành công!");
      refreshConceptImages(editingConcept.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tải ảnh album lên Cloudinary!");
    } finally {
      setUploadingAlbum(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteAlbumImage = async (imageId: number) => {
    if (!editingConcept) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await adminApi.deleteConceptImage(imageId);
      setSuccessMsg("Đã xóa ảnh khỏi album!");
      refreshConceptImages(editingConcept.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi xóa ảnh album!");
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!thumbnailUrl || thumbnailUrl.trim() === "") {
      setErrorMsg("Vui lòng cung cấp ảnh minh họa bằng cách dán URL hoặc chọn file tải lên!");
      return;
    }

    const payload = {
      title,
      conceptType,
      thumbnailUrl: thumbnailUrl || undefined,
      description,
      status,
    };

    setSaving(true);
    if (editingConcept) {
      adminApi
        .updateConcept(editingConcept.id, payload)
        .then(() => {
          setSuccessMsg("Cập nhật Concept chụp ảnh thành công!");
          fetchConcepts();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi cập nhật Concept");
          setSaving(false);
        });
    } else {
      adminApi
        .createConcept(payload)
        .then(() => {
          setSuccessMsg("Tạo Concept chụp ảnh mới thành công!");
          fetchConcepts();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi tạo Concept");
          setSaving(false);
        });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Bảng cấu hình Concept chụp (CMS)</h2>
          <p className="text-xs text-zinc-400 mt-1">Quản lý bối cảnh chụp ảnh, chủ đề concept, hình bìa minh họa và trạng thái xuất bản.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={conceptTypeFilter}
            disabled={loading}
            onChange={(e) => { setConceptTypeFilter(e.target.value); setPage(0); }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-350 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-gold-luxury cursor-pointer disabled:opacity-50"
          >
            <option value="ALL">Tất cả chủ đề</option>
            {allUniqueTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1 bg-gold-luxury hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Tạo Concept mới
          </button>
        </div>
      </div>

      {/* Grid List Table */}
      {loading && concepts.length === 0 ? (
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
                  <th className="py-4 px-4">Ảnh đại diện</th>
                  <th className="py-4 px-4">Tên Concept</th>
                  <th className="py-4 px-4">Chủ đề / Thể loại</th>
                  <th className="py-4 px-4">Nội dung tóm tắt</th>
                  <th className="py-4 px-4">Trạng thái CMS</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {concepts.length > 0 ? (
                  concepts.map((concept) => (
                    <tr key={concept.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded border border-zinc-700 overflow-hidden bg-zinc-800">
                          {concept.thumbnailUrl ? (
                            <img src={concept.thumbnailUrl} alt={concept.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white uppercase tracking-wider font-mono">{concept.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-gold-luxury text-[9px] font-bold font-mono">
                          {concept.conceptType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 max-w-[250px] truncate">{concept.description}</td>
                      <td className="py-3 px-4">
                        {concept.status === "PUBLISHED" ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-semibold font-sans">Công khai</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 text-[9px] font-semibold font-sans">Bản nháp</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(concept)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingConcept(concept); setErrorMsg(""); setSuccessMsg(""); setIsDeleteOpen(true); }}
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
                      Chưa có concept nào được tạo trong hệ thống.
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
                  type="button"
                  disabled={page === 0 || loading}
                  onClick={() => setPage(page - 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 px-3 py-1.5 rounded text-xs text-white disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage(page + 1)}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 px-3 py-1.5 rounded text-xs text-white disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Add/Edit Concept Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-5 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold font-playfair text-white">
                {editingConcept ? `Chỉnh sửa Concept: ${editingConcept.title}` : "Tạo Concept bối cảnh mới"}
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold">✓ {successMsg}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tên chủ đề Concept</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  placeholder="SWEET ANGEL..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Chủ đề / Thể loại chính *</label>
                <select
                  value={selectedTypeOption}
                  disabled={saving}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTypeOption(val);
                    if (val !== "CUSTOM") {
                      setConceptType(val);
                    } else {
                      setConceptType(customConceptType);
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-350 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>-- Chọn thể loại --</option>
                  {allUniqueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="CUSTOM">Khác (Tự thêm thể loại mới...)</option>
                </select>
              </div>

              {selectedTypeOption === "CUSTOM" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Nhập thể loại mới *</label>
                  <input
                    type="text"
                    required
                    disabled={saving}
                    placeholder="Ví dụ: RETRO, VINTAGE, STREETWEAR..."
                    value={customConceptType}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCustomConceptType(val);
                      setConceptType(val);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-250 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                  />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh bìa bối cảnh (Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={saving}
                    placeholder="Đường dẫn ảnh bìa bối cảnh Concept (hoặc upload)..."
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
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-650 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Mô tả bối cảnh và ý tưởng</label>
                <textarea
                  rows={4}
                  required
                  disabled={saving}
                  placeholder="Mô tả chi tiết về trang phục phù hợp, phông nền bối cảnh, ánh sáng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 resize-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Trạng thái xuất bản CMS</label>
                <select
                  value={status}
                  disabled={saving}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury cursor-pointer disabled:opacity-50"
                >
                  <option value="PUBLISHED">Công khai trên Website (PUBLISHED)</option>
                  <option value="DRAFT">Lưu bản nháp ẩn (DRAFT)</option>
                </select>
              </div>
            </div>

            {/* ─── Album Ảnh mô tả chi tiết (Chỉ hiển thị khi chỉnh sửa) ─── */}
            {editingConcept && (
              <div className="border-t border-zinc-800 pt-4 sm:col-span-2 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-gold-luxury font-bold uppercase tracking-wider text-[10px]">Album ảnh mô tả chi tiết</label>
                    <p className="text-[10px] text-zinc-500">Các hình ảnh thực tế hiển thị trong bối cảnh của concept.</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={albumInputRef}
                      onChange={handleUploadAlbumImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAlbum || saving}
                      onClick={() => albumInputRef.current?.click()}
                      className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingAlbum ? (
                        <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span>
                      )}
                      Thêm ảnh vào Album
                    </button>
                  </div>
                </div>

                {conceptImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[160px] overflow-y-auto p-2 bg-zinc-950/30 rounded-xl border border-zinc-850/40">
                    {conceptImages.map((image: any) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 group">
                        <img src={image.imageUrl} alt="Album" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDeleteAlbumImage(image.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-0"
                          title="Xóa ảnh này"
                        >
                          <span className="material-symbols-outlined text-[12px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl text-[10px] italic">
                    Chưa có ảnh mô tả nào trong album. Hãy tải ảnh lên để hoàn thiện Concept bối cảnh!
                  </div>
                )}
              </div>
            )}

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
                ) : editingConcept ? (
                  "Cập nhật Concept"
                ) : (
                  "Tạo Concept"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {isDeleteOpen && deletingConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 text-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-md font-bold font-playfair text-white">Xác nhận xóa Concept</h3>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setIsDeleteOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-2 rounded text-[11px] font-semibold">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-3 py-2 rounded text-[11px] font-semibold">✓ {successMsg}</div>}

            <p className="text-[11px] text-zinc-400">Bạn có chắc chắn muốn xóa vĩnh viễn bối cảnh concept **{deletingConcept.title}** khỏi hệ thống không? Hành động này sẽ gỡ toàn bộ album liên quan.</p>

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
