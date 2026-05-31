"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import type { UserRole } from "@/types";

type Tab = "admin" | "staff";

const ROLE_MAP: Record<Tab, UserRole[]> = {
  admin: ["ADMIN"],
  staff: ["PHOTOGRAPHER", "MAKEUP"],
};

const REDIRECT_MAP: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  PHOTOGRAPHER: "/staff/dashboard",
  MAKEUP: "/staff/dashboard",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab: Tab =
    searchParams.get("role") === "staff" ? "staff" : "admin";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update tab when URL changes
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "staff") setTab("staff");
    else if (role === "admin") setTab("admin");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await authApi.login({ username, password });

      // Validate role matches selected tab
      const allowedRoles = ROLE_MAP[tab];
      if (!allowedRoles.includes(res.role)) {
        setError(
          tab === "admin"
            ? "Tài khoản này không có quyền Admin."
            : "Tài khoản này không phải nhân viên Studio."
        );
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("studio_token", res.token);
      localStorage.setItem("studio_role", res.role);
      localStorage.setItem("studio_user", JSON.stringify({ id: res.userId, name: res.fullName }));

      // Redirect
      router.push(REDIRECT_MAP[res.role]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tài khoản hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, #D4AF37 0%, transparent 40%),
                            radial-gradient(circle at 80% 20%, #735c00 0%, transparent 40%)`,
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="relative z-10 px-page py-6">
        <Link href="/" aria-label="Về trang chủ LEON STUDIO" className="inline-flex flex-col">
          <span className="font-playfair font-bold text-xl tracking-widest uppercase text-white">
            LEON
          </span>
          <span className="font-hanken font-light text-[10px] tracking-[0.4em] uppercase text-gold-luxury">
            STUDIO
          </span>
        </Link>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-page py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Tab Toggle */}
            <div className="grid grid-cols-2">
              <button
                id="tab-admin"
                onClick={() => { setTab("admin"); setError(""); }}
                className={`py-4 font-hanken text-sm font-semibold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                  tab === "admin"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
                aria-selected={tab === "admin"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  admin_panel_settings
                </span>
                Admin
              </button>
              <button
                id="tab-staff"
                onClick={() => { setTab("staff"); setError(""); }}
                className={`py-4 font-hanken text-sm font-semibold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                  tab === "staff"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                }`}
                aria-selected={tab === "staff"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  badge
                </span>
                Nhân viên
              </button>
            </div>

            {/* Form Body */}
            <div className="p-8">
              {/* Role badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 24 }}>
                    {tab === "admin" ? "admin_panel_settings" : "badge"}
                  </span>
                </div>
                <div>
                  <h1 className="font-playfair text-headline-md text-on-surface">
                    {tab === "admin" ? "Quản trị viên" : "Nhân viên Studio"}
                  </h1>
                  <p className="font-hanken text-xs text-on-surface-variant">
                    {tab === "admin"
                      ? "Đăng nhập để quản lý hệ thống"
                      : "Photographer / Makeup Artist"}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-error/10 border border-error/30 text-error font-hanken text-sm px-4 py-3 rounded mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                  {error}
                </div>
              )}

              {/* Form */}
              <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5"
                  >
                    Tài khoản
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 18 }}>
                      person
                    </span>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={tab === "admin" ? "admin" : "photographer01"}
                      className="w-full border border-outline-variant rounded-lg pl-10 pr-4 py-3 font-hanken text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block font-hanken text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: 18 }}>
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-outline-variant rounded-lg pl-10 pr-12 py-3 font-hanken text-sm text-on-surface focus:outline-none focus:border-secondary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary hover:bg-gold-dark text-on-secondary font-hanken text-sm font-semibold uppercase tracking-widest py-4 rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                        progress_activity
                      </span>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="font-hanken text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary" />}>
      <LoginForm />
    </Suspense>
  );
}
