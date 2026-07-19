"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface AdminUser {
  id: number;
  name: string;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Client-side authentication check
    const token = localStorage.getItem("studio_token");
    const role = localStorage.getItem("studio_role");
    const userStr = localStorage.getItem("studio_user");

    if (!token || role !== "ADMIN") {
      router.push("/");
      return;
    }

    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("studio_token");
    localStorage.removeItem("studio_role");
    localStorage.removeItem("studio_user");
    router.push("/");
  };

  // Helper to determine active link classes
  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all";
    if (isActive) {
      return `${baseClass} bg-zinc-800 text-gold-luxury font-semibold`;
    }
    return `${baseClass} text-zinc-400 hover:text-white hover:bg-zinc-800/50`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-hanken flex flex-col md:flex-row">
      {/* Sidebar - Rendered instantly to eliminate structural layout shift */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand/Logo */}
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-gold-luxury to-amber-500 flex items-center justify-center text-black font-playfair font-black text-lg">
              L
            </div>
            <div>
              <h1 className="font-playfair font-bold text-white tracking-wider text-sm leading-tight">LEON STUDIO</h1>
              <p className="text-[10px] text-gold-luxury font-semibold uppercase tracking-widest leading-none">ADMIN PANEL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link href="/admin/dashboard" className={getLinkClass("/admin/dashboard")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>dashboard</span>
              <span>Tổng quan</span>
            </Link>
            <Link href="/admin/dashboard/bookings" className={getLinkClass("/admin/dashboard/bookings")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_month</span>
              <span>Lịch hẹn (Bookings)</span>
            </Link>
            <Link href="/admin/dashboard/post-production" className={getLinkClass("/admin/dashboard/post-production")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_library</span>
              <span>Giám sát Hậu kỳ</span>
            </Link>
            <Link href="/admin/dashboard/staff" className={getLinkClass("/admin/dashboard/staff")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>badge</span>
              <span>Đội ngũ nhân sự</span>
            </Link>
            <Link href="/admin/dashboard/customers" className={getLinkClass("/admin/dashboard/customers")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group</span>
              <span>Khách hàng (CRM)</span>
            </Link>
            
            <div className="pt-4 pb-2 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-500">CMS Nội Dung</div>
            
            <Link href="/admin/dashboard/packages" className={getLinkClass("/admin/dashboard/packages")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>sell</span>
              <span>Gói dịch vụ</span>
            </Link>
            <Link href="/admin/dashboard/concepts" className={getLinkClass("/admin/dashboard/concepts")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>image</span>
              <span>Concept chụp</span>
            </Link>
            <Link href="/admin/dashboard/blogs" className={getLinkClass("/admin/dashboard/blogs")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>article</span>
              <span>Bài viết (Blogs)</span>
            </Link>
            <Link href="/admin/dashboard/stories" className={getLinkClass("/admin/dashboard/stories")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>reviews</span>
              <span>Đánh giá (Stories)</span>
            </Link>
            <Link href="/admin/dashboard/core-values" className={getLinkClass("/admin/dashboard/core-values")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified_user</span>
              <span>Giá trị cốt lõi</span>
            </Link>
            <Link href="/admin/dashboard/work-process" className={getLinkClass("/admin/dashboard/work-process")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>schema</span>
              <span>Quy trình làm việc</span>
            </Link>
            <Link href="/admin/dashboard/info" className={getLinkClass("/admin/dashboard/info")}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>info</span>
              <span>Thông tin Studio</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gold-luxury">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>admin_panel_settings</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Quản trị viên"}</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">Chủ Studio</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header - Rendered instantly to align page controls */}
        <header className="h-[70px] bg-zinc-900/50 border-b border-zinc-800/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-zinc-400">menu_open</span>
            <span className="text-sm font-semibold text-zinc-400">
              Leon Admin / {pathname.replace("/admin/dashboard", "").replace("/", "").toUpperCase() || "TỔNG QUAN"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* View live site button */}
            <Link href="/" className="text-xs font-medium text-gold-luxury hover:underline flex items-center gap-1">
              Xem Website công khai
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_outward</span>
            </Link>
          </div>
        </header>

        {/* Content body - Wrapped in a dynamic fade-in key to ensure silky transitions */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-70px)]">
          {authorized ? (
            <div key={pathname} className="animate-fade-in h-full">
              {children}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <span className="material-symbols-outlined text-gold-luxury animate-spin text-4xl">
                progress_activity
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
