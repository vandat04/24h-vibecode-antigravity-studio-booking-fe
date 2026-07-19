"use client";

import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function AdminStudioInfoPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [studioName, setStudioName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [workingProcess, setWorkingProcess] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");

  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Fetch current studio information
  const fetchStudioInfo = () => {
    setLoading(true);
    adminApi
      .getStudioInfoAdmin()
      .then((data) => {
        if (data) {
          setStudioName(data.studioName || "");
          setLogoUrl(data.logoUrl || "");
          setBannerUrl(data.bannerUrl || "");
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setFacebookUrl(data.facebookUrl || "");
          setZaloUrl(data.zaloUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
          setInstagramUrl(data.instagramUrl || "");
          setTiktokUrl(data.tiktokUrl || "");
          setIntroVideoUrl(data.introVideoUrl || "");
          setIntroduction(data.introduction || "");
          setVision(data.vision || "");
          setMission(data.mission || "");
          setWorkingProcess(data.workingProcess || "");
          setGoogleMapUrl(data.googleMapUrl || "");
        }
      })
      .catch(() => {
        showError("Lỗi không thể tải cấu hình thông tin Studio từ server.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudioInfo();
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await adminApi.uploadFile(file, "studio");
      if (res && res.url) {
        setLogoUrl(res.url);
        showSuccess("Tải logo lên Cloudinary thành công!");
      } else {
        showError("Tải ảnh thất bại!");
      }
    } catch (err: any) {
      showError(err.message || "Lỗi tải logo!");
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const res = await adminApi.uploadFile(file, "studio");
      if (res && res.url) {
        setBannerUrl(res.url);
        showSuccess("Tải banner lên Cloudinary thành công!");
      } else {
        showError("Tải ảnh thất bại!");
      }
    } catch (err: any) {
      showError(err.message || "Lỗi tải banner!");
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validations
    if (!studioName.trim() || !logoUrl.trim() || !bannerUrl.trim() || !address.trim() || !phone.trim() || !email.trim() || !introduction.trim() || !workingProcess.trim() || !googleMapUrl.trim()) {
      showWarning("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      return;
    }

    setSaving(true);

    const payload = {
      id: 1,
      studioName,
      logoUrl,
      bannerUrl,
      address,
      phone,
      email,
      facebookUrl: facebookUrl || null,
      zaloUrl: zaloUrl || null,
      youtubeUrl: youtubeUrl || null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      introVideoUrl: introVideoUrl || null,
      introduction,
      vision: vision || null,
      mission: mission || null,
      workingProcess,
      googleMapUrl,
    };

    adminApi
      .updateStudioInfoAdmin(payload)
      .then(() => {
        showSuccess("Cập nhật thông tin cấu hình Studio thành công!");
        fetchStudioInfo();
      })
      .catch((err) => {
        showError(err.message || "Lỗi lưu thông tin cấu hình Studio.");
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-gold-luxury animate-spin text-4xl">
          progress_activity
        </span>
        <p className="text-xs text-zinc-550 italic">Đang tải cấu hình thông tin Studio...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-xs text-zinc-300">
      {/* Title Header */}
      <div>
        <h2 className="font-playfair text-2xl font-bold text-white">Cấu hình thông tin Studio</h2>
        <p className="text-xs text-zinc-400 mt-1">Quản lý toàn bộ thông tin giới thiệu, liên hệ, ảnh thương hiệu, logo, banner, các kênh mạng xã hội hiển thị trên website.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROW 1: THÔNG TIN LIÊN HỆ & THƯƠNG HIỆU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CỘT 1 + CỘT 2: Thông tin liên hệ cơ bản */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-bold font-playfair text-white flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>contact_mail</span>
              Thông tin liên hệ cơ bản
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tên Studio thương hiệu *</label>
                <input
                  type="text"
                  required
                  placeholder="LEON STUDIO..."
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Hotline SĐT liên hệ *</label>
                <input
                  type="text"
                  required
                  placeholder="0905xxxxxx..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Email chính thức *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@leonstudio.com..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Địa chỉ trụ sở chính *</label>
                <input
                  type="text"
                  required
                  placeholder="123 Nguyễn Văn Linh, Đà Nẵng..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Nhúng Google Maps URL *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none resize-none focus:border-gold-luxury"
                />
              </div>
            </div>
          </div>

          {/* CỘT 3: Logo thương hiệu */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
            <div className="w-full">
              <h3 className="text-sm font-bold font-playfair text-white flex items-center justify-center gap-1.5 border-b border-zinc-800 pb-2 mb-4">
                <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>brand_family</span>
                Logo thương hiệu
              </h3>

              {logoUrl ? (
                <div className="relative w-36 h-36 rounded-full border border-zinc-700 bg-zinc-950 mx-auto overflow-hidden group flex items-center justify-center shadow-lg">
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="absolute inset-0 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full border-2 border-dashed border-zinc-800 bg-zinc-950 mx-auto flex flex-col items-center justify-center text-zinc-600">
                  <span className="material-symbols-outlined text-3xl">image</span>
                  <span className="text-[10px] mt-1">Chưa có logo</span>
                </div>
              )}
            </div>

            <div className="w-full pt-4">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleUploadLogo}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploadingLogo ? (
                  <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                )}
                Tải ảnh Logo mới
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: KÊNH MẠNG XÃ HỘI & BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CỘT 1 + CỘT 2: Kênh mạng xã hội */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-sm font-bold font-playfair text-white flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>share</span>
              Mạng xã hội & Video truyền thông
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đường dẫn Facebook Fanpage</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đường dẫn chat Zalo OA</label>
                <input
                  type="url"
                  placeholder="https://zalo.me/..."
                  value={zaloUrl}
                  onChange={(e) => setZaloUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đường dẫn Youtube Channel</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đường dẫn Instagram Profile</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Đường dẫn TikTok Profile</label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@..."
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Nhúng Video giới thiệu (Cloudinary/Youtube)</label>
                <input
                  type="url"
                  placeholder="Link Video giới thiệu..."
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none focus:border-gold-luxury"
                />
              </div>
            </div>
          </div>

          {/* CỘT 3: Banner trang chủ */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
            <div className="w-full">
              <h3 className="text-sm font-bold font-playfair text-white flex items-center justify-center gap-1.5 border-b border-zinc-800 pb-2 mb-4">
                <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>background_replace</span>
                Banner trang chủ
              </h3>

              {bannerUrl ? (
                <div className="relative w-full aspect-[16/9] rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden group flex items-center justify-center shadow-lg">
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBannerUrl("")}
                    className="absolute inset-0 bg-black/60 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold"
                  >
                    Xóa banner
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-zinc-600">
                  <span className="material-symbols-outlined text-3xl">image</span>
                  <span className="text-[10px] mt-1">Chưa có banner</span>
                </div>
              )}
            </div>

            <div className="w-full pt-4">
              <input
                type="file"
                ref={bannerInputRef}
                onChange={handleUploadBanner}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploadingBanner ? (
                  <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                )}
                Tải ảnh Banner mới
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: GIỚI THIỆU & QUY TRÌNH LÀM VIỆC */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-sm font-bold font-playfair text-white flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <span className="material-symbols-outlined text-gold-luxury" style={{ fontSize: 18 }}>article</span>
            Nội dung giới thiệu & Quy trình hoạt động
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Lời giới thiệu tổng quan Studio *</label>
              <textarea
                rows={5}
                required
                placeholder="Leon Studio là studio chuyên về chụp ảnh beauty, trang điểm nghệ thuật cao cấp..."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none resize-none focus:border-gold-luxury"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tầm nhìn định hướng (Vision)</label>
              <textarea
                rows={5}
                placeholder="Trở thành Studio chụp ảnh nghệ thuật hàng đầu..."
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none resize-none focus:border-gold-luxury"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Sứ mệnh cam kết (Mission)</label>
              <textarea
                rows={5}
                placeholder="Mang đến cho mỗi khách hàng trải nghiệm nhiếp ảnh độc bản..."
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none resize-none focus:border-gold-luxury"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Quy trình hoạt động, làm việc từng bước *</label>
              <textarea
                rows={5}
                required
                placeholder="Bước 1: Chọn gói chụp → Bước 2: Setup bối cảnh chụp → Bước 3: Hậu kỳ ảnh..."
                value={workingProcess}
                onChange={(e) => setWorkingProcess(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 px-3 py-2.5 rounded-lg outline-none resize-none focus:border-gold-luxury"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gold-luxury hover:bg-amber-500 text-black font-bold text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-gold-luxury/10"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">save</span>
            )}
            Lưu thay đổi cấu hình
          </button>
        </div>
      </form>
    </div>
  );
}
