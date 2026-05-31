"use client";

import { useEffect, useRef, useState } from "react";
import { adminApi } from "@/lib/api";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả vai trò" },
  { value: "PHOTOGRAPHER", label: "Nhiếp ảnh gia" },
  { value: "MAKEUP", label: "Makeup Artist" },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStaff, setResetStaff] = useState<any | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("3");
  const [yearsOfExperience, setYearsOfExperience] = useState(1);
  const [bio, setBio] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Submit / notifications
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [updatingProfiles, setUpdatingProfiles] = useState<number[]>([]);

  /* ─── Fetch ─── */
  const fetchStaff = () => {
    setLoading(true);
    adminApi
      .getStaff(page, PAGE_SIZE, roleFilter || undefined)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setStaff(data);
          setTotalPages(data.length === PAGE_SIZE ? page + 2 : page + 1);
        } else if (data && data.content) {
          setStaff(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setStaff([]);
          setTotalPages(1);
        }
      })
      .catch(() => { setStaff([]); setTotalPages(1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, [page, roleFilter]);

  /* ─── Avatar picker ─── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  /* ─── Open Create ─── */
  const handleOpenCreate = () => {
    setEditingStaff(null);
    setUsername(""); setPassword(""); setFullName(""); setEmail(""); setPhone("");
    setRoleId("3"); setYearsOfExperience(1); setBio("");
    setFacebookUrl(""); setInstagramUrl("");
    setAvatarFile(null); setAvatarPreview("");
    setErrorMsg(""); setSuccessMsg("");
    setIsFormOpen(true);
  };

  /* ─── Open Edit ─── */
  const handleOpenEdit = (member: any) => {
    setEditingStaff(member);
    setUsername(member.username || "");
    setPassword("");
    setFullName(member.fullName || "");
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setRoleId(member.roleName === "PHOTOGRAPHER" ? "3" : "2");
    setYearsOfExperience(member.yearsOfExperience || 1);
    setBio(member.bio || "");
    setFacebookUrl(member.facebookUrl || "");
    setInstagramUrl(member.instagramUrl || "");
    setAvatarFile(null);
    setAvatarPreview(member.avatarUrl || "");
    setErrorMsg(""); setSuccessMsg("");
    setIsFormOpen(true);
  };

  /* ─── Submit Form ─── */
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLoading) return;
    setErrorMsg(""); setSuccessMsg(""); setSubmitLoading(true);

    const profileData: any = {
      fullName, email, phone,
      yearsOfExperience: Number(yearsOfExperience),
      bio, facebookUrl, instagramUrl,
      roleId: Number(roleId),
    };

    try {
      if (editingStaff) {
        // UPDATE — send multipart if new avatar selected, else JSON
        if (avatarFile) {
          await (adminApi as any).updateStaffMultipart(editingStaff.profileId, profileData, avatarFile);
        } else {
          await adminApi.updateStaff(editingStaff.profileId, profileData);
        }
        setSuccessMsg("Cập nhật hồ sơ nhân sự thành công!");
      } else {
        // CREATE — require username & password
        if (!username || !password) {
          setErrorMsg("Vui lòng nhập tài khoản và mật khẩu.");
          setSubmitLoading(false);
          return;
        }
        const createData = { ...profileData, username, password };
        if (avatarFile) {
          await (adminApi as any).createStaffMultipart(createData, avatarFile);
        } else {
          await adminApi.createStaff(createData);
        }
        setSuccessMsg("Tạo tài khoản nhân viên mới thành công!");
      }
      fetchStaff();
      setTimeout(() => setIsFormOpen(false), 1600);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ─── Toggle Active ─── */
  const handleToggleActive = (member: any) => {
    if (updatingProfiles.includes(member.profileId)) return;
    setUpdatingProfiles(prev => [...prev, member.profileId]);
    adminApi.toggleStaffActive(member.profileId)
      .then(() => fetchStaff())
      .catch(() => {})
      .finally(() => {
        setUpdatingProfiles(prev => prev.filter(id => id !== member.profileId));
      });
  };

  /* ─── Toggle Display ─── */
  const handleToggleDisplay = (member: any) => {
    if (updatingProfiles.includes(member.profileId)) return;
    setUpdatingProfiles(prev => [...prev, member.profileId]);
    adminApi.toggleStaffDisplay(member.profileId)
      .then(() => fetchStaff())
      .catch(() => {})
      .finally(() => {
        setUpdatingProfiles(prev => prev.filter(id => id !== member.profileId));
      });
  };

  /* ─── Reset Password ─── */
  const handleResetPassword = () => {
    if (!resetStaff || !newPasswordVal || resetLoading) return;
    setResetLoading(true); setErrorMsg(""); setSuccessMsg("");
    adminApi.resetStaffPassword(resetStaff.profileId, newPasswordVal)
      .then(() => {
        setSuccessMsg(`Đã đặt lại mật khẩu thành công cho ${resetStaff.fullName}!`);
        setNewPasswordVal("");
        setTimeout(() => setIsResetOpen(false), 1500);
      })
      .catch((err: any) => setErrorMsg(err.message || "Lỗi đặt lại mật khẩu"))
      .finally(() => setResetLoading(false));
  };

  const inputCls = "w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2.5 rounded-lg outline-none placeholder-zinc-700 focus:border-gold-luxury text-xs transition-colors disabled:opacity-50";
  const labelCls = "text-zinc-500 font-bold uppercase tracking-wider text-[9px] block mb-1";

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-white">Quản lý Đội ngũ nhân sự</h2>
          <p className="text-xs text-zinc-400 mt-1">Cấp tài khoản mới, bật/tắt quyền đăng nhập, chỉnh sửa hồ sơ hoặc đặt lại mật khẩu.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            disabled={loading}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2.5 rounded-lg outline-none cursor-pointer focus:border-gold-luxury disabled:opacity-50"
          >
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1 bg-gold-luxury hover:bg-amber-500 text-black font-bold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
            Thêm nhân viên mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl relative">
        {/* Progress line */}
        <div className="h-0.5 w-full bg-zinc-950 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-gold-luxury/50 to-transparent animate-pulse transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"}`} />
        </div>

        <div className={`overflow-x-auto min-h-[520px] transition-all duration-300 ${loading && staff.length === 0 ? "pointer-events-none opacity-100" : loading ? "pointer-events-none opacity-50" : "opacity-100"}`}>
          <table className="w-full text-left text-xs font-hanken">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">Ảnh đại diện</th>
                <th className="py-4 px-4">Họ và tên</th>
                <th className="py-4 px-4">Vai trò</th>
                <th className="py-4 px-4">Liên hệ</th>
                <th className="py-4 px-4">Kinh nghiệm</th>
                <th className="py-4 px-4">Trạng thái</th>
                <th className="py-4 px-4">Hiển thị Web</th>
                <th className="py-4 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading && staff.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-6 px-4 text-center">
                      <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto opacity-50" />
                    </td>
                  </tr>
                ))
              ) : staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.profileId} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800 flex items-center justify-center">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-zinc-500" style={{ fontSize: 18 }}>person</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{member.fullName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">@{member.username || "—"}</div>
                      <div className="text-[10px] text-zinc-600 italic max-w-[160px] truncate">{member.bio || ""}</div>
                    </td>
                    <td className="py-3 px-4">
                      {member.roleName === "PHOTOGRAPHER" ? (
                        <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/40 text-[9px] font-bold font-mono tracking-wide">PHOTOGRAPHER</span>
                      ) : member.roleName === "MAKEUP" ? (
                        <span className="px-2 py-0.5 rounded bg-pink-950/40 text-pink-400 border border-pink-900/40 text-[9px] font-bold font-mono tracking-wide">MAKEUP</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-bold font-mono">{member.roleName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-zinc-600" style={{ fontSize: 12 }}>phone</span>
                        {member.phone || <span className="text-zinc-600 italic">Chưa có</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-zinc-500">
                        <span className="material-symbols-outlined text-zinc-700" style={{ fontSize: 12 }}>mail</span>
                        <span className="text-[10px]">{member.email || <span className="text-zinc-600 italic">Chưa có</span>}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-300">{member.yearsOfExperience ?? "—"} năm</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={updatingProfiles.includes(member.profileId)}
                        onClick={() => handleToggleActive(member)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                          member.isActive
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/30"
                            : "bg-red-950/40 text-red-400 border-red-900/40 hover:bg-red-900/30"
                        }`}
                      >
                        {member.isActive ? "Hoạt động" : "Bị khóa"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        disabled={updatingProfiles.includes(member.profileId)}
                        onClick={() => handleToggleDisplay(member)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                          member.isDisplayed
                            ? "bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-900/30"
                            : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700"
                        }`}
                      >
                        {member.isDisplayed ? "Đang hiện" : "Đang ẩn"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(member)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer font-sans"
                      >
                        Sửa hồ sơ
                      </button>
                      <button
                        type="button"
                        onClick={() => { setResetStaff(member); setNewPasswordVal(""); setErrorMsg(""); setSuccessMsg(""); setIsResetOpen(true); }}
                        className="bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer font-sans"
                      >
                        Mật khẩu
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 italic">
                    Chưa có nhân sự nào phù hợp trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — always visible */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-zinc-500 text-xs">Trang {page + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage(p => p - 1)}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded text-xs text-white"
            >Trước</button>
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(p => p + 1)}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded text-xs text-white"
            >Sau</button>
          </div>
        </div>
      </div>

      {/* ─── Add / Edit Staff Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col space-y-5 text-zinc-100 mb-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-gold-luxury uppercase tracking-widest font-mono font-bold">
                  {editingStaff ? "CHỈNH SỬA HỒ SƠ" : "THÊM NHÂN VIÊN MỚI"}
                </span>
                <h3 className="text-lg font-bold font-playfair text-white mt-0.5">
                  {editingStaff ? editingStaff.fullName : "Tạo tài khoản nhân viên"}
                </h3>
              </div>
              <button
                type="button"
                disabled={submitLoading}
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[15px]">warning</span>{errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"><span className="material-symbols-outlined text-[15px]">check_circle</span>{successMsg}</div>}

            {/* Avatar Upload Section */}
            <div className="flex items-center gap-5">
              <div
                onClick={() => !submitLoading && avatarInputRef.current?.click()}
                className={`w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 hover:border-gold-luxury overflow-hidden bg-zinc-955 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 relative group ${submitLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-zinc-600 group-hover:text-gold-luxury" style={{ fontSize: 30 }}>add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>edit</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">Ảnh đại diện nhân viên</p>
                <p className="text-[10px] text-zinc-500 mt-1">Nhấn vào ảnh để chọn file từ máy tính.<br />Hệ thống sẽ tự động upload lên Cloudinary.</p>
                {avatarFile && <p className="text-[10px] text-gold-luxury mt-1">✓ Đã chọn: {avatarFile.name}</p>}
              </div>
              <input ref={avatarInputRef} type="file" disabled={submitLoading} accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account fields — only for create */}
              {!editingStaff && (
                <>
                  <div>
                    <label className={labelCls}>Tài khoản đăng nhập *</label>
                    <input type="text" required disabled={submitLoading} placeholder="photographer.tuan" value={username}
                      onChange={(e) => setUsername(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Mật khẩu mặc định *</label>
                    <input type="password" required disabled={submitLoading} placeholder="Mật khẩu bảo mật..." value={password}
                      onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                </>
              )}
              {editingStaff && (
                <div>
                  <label className={labelCls}>Tài khoản đăng nhập</label>
                  <input type="text" value={username} disabled
                    className={`${inputCls} opacity-50 cursor-not-allowed`} />
                </div>
              )}

              <div>
                <label className={labelCls}>Họ và tên nhân sự *</label>
                <input type="text" required disabled={submitLoading} placeholder="Nguyễn Văn A" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Vai trò chuyên môn *</label>
                <select value={roleId} disabled={submitLoading} onChange={(e) => setRoleId(e.target.value)}
                  className={inputCls}>
                  <option value="3">Nhiếp ảnh gia (PHOTOGRAPHER)</option>
                  <option value="2">Thợ trang điểm (MAKEUP ARTIST)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Số điện thoại</label>
                <input type="tel" disabled={submitLoading} placeholder="0901234567" value={phone}
                  onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email cá nhân</label>
                <input type="email" disabled={submitLoading} placeholder="tuan.photo@gmail.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Số năm kinh nghiệm *</label>
                <input type="number" required disabled={submitLoading} min={0} value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Facebook URL</label>
                <input type="url" disabled={submitLoading} placeholder="https://facebook.com/..." value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Instagram URL</label>
                <input type="url" disabled={submitLoading} placeholder="https://instagram.com/..." value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)} className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Giới thiệu ngắn (Bio)</label>
                <textarea rows={2} disabled={submitLoading} placeholder="Đam mê bắt trọn khoảnh khắc, chuyên chụp couple..."
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  className={`${inputCls} resize-none`} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                disabled={submitLoading}
                onClick={() => setIsFormOpen(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-5 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button type="submit" disabled={submitLoading}
                className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 font-sans">
                {submitLoading ? (
                  <><span className="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>Đang lưu...</>
                ) : (
                  editingStaff ? "Cập nhật hồ sơ" : "Tạo tài khoản"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Reset Password Modal ─── */}
      {isResetOpen && resetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 text-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-md font-bold font-playfair text-white">Cấp lại mật khẩu</h3>
              <button
                type="button"
                disabled={resetLoading}
                onClick={() => setIsResetOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>

            {errorMsg && <div className="bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-2 rounded text-[11px] font-semibold">⚠️ {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-3 py-2 rounded text-[11px] font-semibold">✓ {successMsg}</div>}

            <div className="flex items-center gap-3 bg-zinc-950/40 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full border border-zinc-700 overflow-hidden bg-zinc-800 flex-shrink-0">
                {resetStaff.avatarUrl
                  ? <img src={resetStaff.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="material-symbols-outlined text-zinc-500 w-full h-full flex items-center justify-center" style={{ fontSize: 18 }}>person</span>}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{resetStaff.fullName}</div>
                <div className="text-[10px] text-zinc-500 font-mono">@{resetStaff.username || "—"}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className={labelCls}>Mật khẩu mới</label>
              <input type="password" disabled={resetLoading} placeholder="Nhập mật khẩu mới an toàn..."
                value={newPasswordVal} onChange={(e) => setNewPasswordVal(e.target.value)}
                className={inputCls} />
            </div>

            <button
              disabled={!newPasswordVal || resetLoading}
              onClick={handleResetPassword}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              {resetLoading
                ? <><span className="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>Đang xử lý...</>
                : "Thiết lập mật khẩu mới"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
