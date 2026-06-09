"use client";

import { useEffect, useState, useRef } from "react";
import { adminApi, guestApi } from "@/lib/api";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPkg, setDeletingPkg] = useState<any | null>(null);

  // Form Fields
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState(0);
  const [shortDescription, setShortDescription] = useState("");
  const [detailContent, setDetailContent] = useState("");
  const [layoutCount, setLayoutCount] = useState(2);
  const [outfitCount, setOutfitCount] = useState(2);
  const [editedPhotos, setEditedPhotos] = useState(10);
  const [makeupPersonCount, setMakeupPersonCount] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [serviceTypeId, setServiceTypeId] = useState<number | string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPackages = () => {
    setLoading(true);
    const pageSize = 10;
    adminApi
      .getPackages(page, pageSize)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setPackages(data);
          setTotalPages(data.length === pageSize ? page + 2 : page + 1);
        } else if (data && data.content) {
          setPackages(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setPackages([]);
        }
      })
      .catch(() => {
        setPackages([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, [page]);

  useEffect(() => {
    const TYPE_ORDER: Record<string, number> = { "STANDARD": 1, "PREMIUM": 2, "VIP": 3 };
    const getWeight = (name: string): number => {
      const normalized = (name || "").trim().toUpperCase();
      if (normalized.includes("STANDARD")) return TYPE_ORDER.STANDARD;
      if (normalized.includes("PREMIUM")) return TYPE_ORDER.PREMIUM;
      if (normalized.includes("VIP")) return TYPE_ORDER.VIP;
      return 99;
    };

    guestApi
      .getServiceTypes()
      .then((types) => {
        const sorted = [...types].sort((a, b) => getWeight(a.serviceName) - getWeight(b.serviceName));
        setServiceTypes(sorted);
      })
      .catch((err) => console.error("Lỗi lấy danh sách Service Types:", err));
  }, []);

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setPackageName("");
    setPrice(2000000);
    setShortDescription("");
    setDetailContent("<ul><li>Hỗ trợ trang điểm nhẹ nhàng</li><li>Bàn giao toàn bộ file ảnh gốc</li></ul>");
    setLayoutCount(2);
    setOutfitCount(2);
    setEditedPhotos(10);
    setMakeupPersonCount(1);
    setThumbnailUrl("");
    setIsActive(true);
    setServiceTypeId("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    setEditingPkg(pkg);

    // Fetch detail if needed, or prefill from summary
    adminApi
      .getPackageById(pkg.id)
      .then((detail) => {
        setPackageName(detail.packageName || "");
        setPrice(detail.price || 0);
        setShortDescription(detail.shortDescription || "");
        setDetailContent(detail.detailContent || "");
        setLayoutCount(detail.layoutCount || 2);
        setOutfitCount(detail.outfitCount || 2);
        setEditedPhotos(detail.editedPhotos || 10);
        setMakeupPersonCount(detail.makeupPersonCount || 1);
        setThumbnailUrl(detail.thumbnailUrl || "");
        setIsActive(detail.isActive);
        setServiceTypeId(detail.serviceTypeId || "");
        setIsFormOpen(true);
      })
      .catch(() => {
        // Fallback prefill from summary row
        setPackageName(pkg.packageName || "");
        setPrice(pkg.price || 0);
        setShortDescription(pkg.shortDescription || "");
        setDetailContent(pkg.detailContent || "<ul><li>Bàn giao ảnh gốc</li></ul>");
        setLayoutCount(pkg.layoutCount || 2);
        setOutfitCount(pkg.outfitCount || 2);
        setEditedPhotos(pkg.editedPhotos || 10);
        setMakeupPersonCount(pkg.makeupPersonCount || 1);
        setThumbnailUrl(pkg.thumbnailUrl || "");
        setIsActive(pkg.isActive);
        setServiceTypeId(pkg.serviceTypeId || "");
        setIsFormOpen(true);
      });
  };

  const handleDelete = () => {
    if (!deletingPkg || deleting) return;
    setDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    adminApi
      .deletePackage(deletingPkg.id)
      .then(() => {
        setSuccessMsg("Xóa gói dịch vụ thành công!");
        fetchPackages();
        setTimeout(() => {
          setIsDeleteOpen(false);
          setDeleting(false);
        }, 1500);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Lỗi xóa gói dịch vụ");
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
      const res = await adminApi.uploadFile(file, "packages");
      if (res && res.url) {
        setThumbnailUrl(res.url);
        setSuccessMsg("Tải ảnh bìa lên Cloudinary thành công!");
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
      setErrorMsg("Vui lòng cung cấp ảnh minh họa bằng cách dán URL hoặc chọn file tải lên!");
      return;
    }

    const payload = {
      packageName,
      price: Number(price),
      shortDescription,
      detailContent,
      layoutCount: Number(layoutCount),
      outfitCount: Number(outfitCount),
      editedPhotos: Number(editedPhotos),
      makeupPersonCount: Number(makeupPersonCount),
      thumbnailUrl: thumbnailUrl || undefined,
      isActive,
      serviceTypeId: serviceTypeId ? Number(serviceTypeId) : null,
    };

    setSaving(true);
    if (editingPkg) {
      adminApi
        .updatePackage(editingPkg.id, payload)
        .then(() => {
          setSuccessMsg("Cập nhật gói chụp ảnh thành công!");
          fetchPackages();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi cập nhật gói chụp");
          setSaving(false);
        });
    } else {
      adminApi
        .createPackage(payload)
        .then(() => {
          setSuccessMsg("Tạo gói chụp ảnh mới thành công!");
          fetchPackages();
          setTimeout(() => {
            setIsFormOpen(false);
            setSaving(false);
          }, 1500);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Lỗi tạo gói chụp");
          setSaving(false);
        });
    }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Bảng cấu hình Gói dịch vụ (CMS)</h2>
          <p className="text-xs text-zinc-400 mt-1">Quản lý nội dung gói chụp, bảng giá, số layout, trang phục và ảnh minh họa.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1 bg-gold-luxury hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Tạo gói chụp mới
        </button>
      </div>

      {/* Grid List Table */}
      {loading && packages.length === 0 ? (
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
                  <th className="py-4 px-4">Tên gói chụp</th>
                  <th className="py-4 px-4">Giá tiền</th>
                  <th className="py-4 px-4">Layouts</th>
                  <th className="py-4 px-4">Số ảnh PSD</th>
                  <th className="py-4 px-4">Makeup</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {packages.length > 0 ? (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-14 h-10 rounded border border-zinc-700 overflow-hidden bg-zinc-800">
                          {pkg.thumbnailUrl ? (
                            <img src={pkg.thumbnailUrl} alt={pkg.packageName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-650">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sell</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{pkg.packageName}</span>
                          {pkg.serviceTypeName && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-gold-luxury border border-gold-luxury/25 text-[9px] font-bold font-sans">
                              {pkg.serviceTypeName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{pkg.shortDescription}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gold-luxury">{formatPrice(pkg.price)}</td>
                      <td className="py-3 px-4 text-zinc-300 font-semibold">{pkg.layoutCount} layout</td>
                      <td className="py-3 px-4 font-bold text-zinc-300">{pkg.editedPhotos} ảnh</td>
                      <td className="py-3 px-4">
                        {pkg.makeupPersonCount > 0 ? (
                          <span className="text-zinc-300 font-semibold">Tích hợp</span>
                        ) : (
                          <span className="text-zinc-500">Khách tự túc</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {pkg.isActive ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/40 text-[9px] font-bold font-sans">Kinh doanh</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 text-[9px] font-bold font-sans">Tạm ngưng</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingPkg(pkg); setErrorMsg(""); setSuccessMsg(""); setIsDeleteOpen(true); }}
                          className="bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 italic">
                      Chưa có gói dịch vụ nào được cấu hình.
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

      {/* ─── Add/Edit Package Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-5 text-zinc-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold font-playfair text-white">
                {editingPkg ? `Chỉnh sửa Gói: ${editingPkg.packageName}` : "Tạo gói dịch vụ nghệ thuật mới"}
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
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tên gói chụp</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  placeholder="GÓI CHỤP CƯỚI LUXURY..."
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Bảng giá niêm yết (VND)</label>
                <input
                  type="number"
                  required
                  disabled={saving}
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Phân loại dịch vụ (Service Type)</label>
                <select
                  disabled={saving}
                  value={serviceTypeId}
                  onChange={(e) => setServiceTypeId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50 cursor-pointer"
                >
                  <option value="">-- Chọn Loại dịch vụ --</option>
                  {serviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.serviceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Mô tả ngắn trang chủ</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  placeholder="Hỗ trợ trang phục, poses nhẹ nhàng, chỉnh sửa..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Số lượng Layout chụp</label>
                <input
                  type="number"
                  required
                  disabled={saving}
                  min={1}
                  value={layoutCount}
                  onChange={(e) => setLayoutCount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Số bộ trang phục</label>
                <input
                  type="number"
                  required
                  disabled={saving}
                  min={1}
                  value={outfitCount}
                  onChange={(e) => setOutfitCount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh chỉnh sửa PSD bàn giao</label>
                <input
                  type="number"
                  required
                  disabled={saving}
                  min={1}
                  value={editedPhotos}
                  onChange={(e) => setEditedPhotos(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Hỗ trợ Makeup (Số người)</label>
                <input
                  type="number"
                  required
                  disabled={saving}
                  min={0}
                  value={makeupPersonCount}
                  onChange={(e) => setMakeupPersonCount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Ảnh minh họa (Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    disabled={saving}
                    placeholder="Đường dẫn ảnh bìa (Cloudinary/Google Drive hoặc upload)..."
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
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Nội dung chi tiết (HTML hoặc danh sách liệt kê)</label>
                <textarea
                  rows={4}
                  disabled={saving}
                  placeholder="<ul><li>Free makeup & hair styling</li><li>Giao toàn bộ file ảnh gốc</li></ul>..."
                  value={detailContent}
                  onChange={(e) => setDetailContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-750 resize-none font-mono focus:border-gold-luxury disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveBox"
                  disabled={saving}
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-gold-luxury bg-zinc-900 border-zinc-800 rounded focus:ring-0 disabled:opacity-50"
                />
                <label htmlFor="isActiveBox" className="text-zinc-300 font-semibold cursor-pointer disabled:opacity-50">Bật hoạt động kinh doanh</label>
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
                ) : editingPkg ? (
                  "Cập nhật"
                ) : (
                  "Tạo gói chụp"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {isDeleteOpen && deletingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 text-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-md font-bold font-playfair text-white">Xác nhận xóa gói chụp</h3>
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

            <p className="text-[11px] text-zinc-400">Bạn có chắc chắn muốn xóa vĩnh viễn gói dịch vụ **{deletingPkg.packageName}** khỏi hệ thống không? Hành động này không thể hoàn tác.</p>

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
