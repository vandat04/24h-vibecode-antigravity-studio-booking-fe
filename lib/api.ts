// API client for LEON STUDIO Spring Boot backend
// Base prefix: /api/studio/** (public - no auth required)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Generic fetch helper ──────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: callerHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(callerHeaders as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth helper ──────────────────────────────────────────────────
function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("studio_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

import type {
  StudioInfo,
  ConceptSummary,
  ConceptDetail,
  PackageSummary,
  PackageDetail,
  StaffMember,
  BlogSummary,
  BlogDetail,
  CustomerStory,
  ScheduleResponse,
  BookingHoldRequest,
  BookingHoldResponse,
  BookingRequest,
  BookingResponse,
  BookingLookupResponse,
  LoginRequest,
  LoginResponse,
} from "@/types";

// ═══════════════════════════════════════════════════════════════════
// GUEST API — /api/studio/**  (Public, no auth)
// ═══════════════════════════════════════════════════════════════════
export const guestApi = {

  // ── API 1: Thông tin studio ──────────────────────────────────────
  /** GET /api/studio/info */
  getStudioInfo: () =>
    apiFetch<StudioInfo>("/api/studio/info"),

  // ── API 2: Danh sách concept ─────────────────────────────────────
  /** GET /api/studio/concepts?type=BEAUTY (type tùy chọn) */
  getConcepts: (type?: string) =>
    apiFetch<ConceptSummary[]>(`/api/studio/concepts${type ? `?type=${type}` : ""}`),

  // ── API 3: Chi tiết concept theo slug ────────────────────────────
  /** GET /api/studio/concepts/{slug} */
  getConceptBySlug: (slug: string) =>
    apiFetch<ConceptDetail>(`/api/studio/concepts/${slug}`),

  // ── API 4: Danh sách gói dịch vụ ────────────────────────────────
  /** GET /api/studio/packages */
  getPackages: () =>
    apiFetch<PackageSummary[]>("/api/studio/packages?size=100"),

  // ── API 5: Chi tiết gói dịch vụ theo slug ───────────────────────
  /** GET /api/studio/packages/{slug} */
  getPackageBySlug: (slug: string) =>
    apiFetch<PackageDetail>(`/api/studio/packages/${slug}`),

  // ── API 6: Đội ngũ nhân sự ───────────────────────────────────────
  /** GET /api/studio/staff?role=PHOTOGRAPHER (role tùy chọn) */
  getStaff: (role?: "PHOTOGRAPHER" | "MAKEUP" | "MEDIA" | "ADMIN") => {
    const params = new URLSearchParams({ size: "100" });
    if (role) params.set("role", role);
    return apiFetch<StaffMember[]>(`/api/studio/staff?${params.toString()}`);
  },

  // ── API 7: Danh sách blog ────────────────────────────────────────
  /** GET /api/studio/blogs */
  getBlogs: () =>
    apiFetch<BlogSummary[]>("/api/studio/blogs"),

  // ── API 8: Chi tiết bài blog theo slug ──────────────────────────
  /** GET /api/studio/blogs/{slug} */
  getBlogBySlug: (slug: string) =>
    apiFetch<BlogDetail>(`/api/studio/blogs/${slug}`),

  // ── API 9: Customer stories (Before/After) ───────────────────────
  /** GET /api/studio/stories */
  getStories: () =>
    apiFetch<CustomerStory[]>("/api/studio/stories"),

  // ── API 10: Kiểm tra lịch trống ─────────────────────────────────
  /** GET /api/studio/bookings/schedule?date=yyyy-MM-dd&packageId=&conceptId= */
  getSchedule: (date: string, packageId?: number, conceptId?: number) => {
    const params = new URLSearchParams({ date });
    if (packageId) params.set("packageId", String(packageId));
    if (conceptId) params.set("conceptId", String(conceptId));
    return apiFetch<ScheduleResponse>(`/api/studio/bookings/schedule?${params}`);
  },

  // ── API 10b: Giữ chỗ tạm thời (Hold Slot) ────────────────────────
  /** POST /api/studio/bookings/hold */
  holdSlot: (data: BookingHoldRequest) =>
    apiFetch<BookingHoldResponse>("/api/studio/bookings/hold", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ── API 11: Đặt lịch chụp ───────────────────────────────────────
  /** POST /api/studio/bookings */
  createBooking: (data: BookingRequest) =>
    apiFetch<BookingResponse>("/api/studio/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ── API 12: Tra cứu booking ──────────────────────────────────────
  /** GET /api/studio/bookings/lookup?phone=&code= */
  lookupBooking: (phone: string, code: string) =>
    apiFetch<BookingLookupResponse>(
      `/api/studio/bookings/lookup?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`
    ),
};

// ═══════════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════════
export const authApi = {
  /** POST /api/auth/login */
  login: (data: LoginRequest) =>
    apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ═══════════════════════════════════════════════════════════════════
// STAFF API — /api/staff/** (Requires JWT)
// ═══════════════════════════════════════════════════════════════════
export const staffApi = {
  /** Lấy danh sách ca làm việc (lịch chụp) cá nhân */
  getBookings: () =>
    apiFetch<any[]>("/api/staff/bookings", { headers: authHeader() }),

  /** Chi tiết ca làm việc */
  getBookingDetail: (bookingId: number) =>
    apiFetch<any>(`/api/staff/bookings/${bookingId}`, { headers: authHeader() }),

  /** Xác nhận hoàn thành Makeup (Chỉ chuyên viên MAKEUP) */
  completeMakeup: (bookingId: number) => {
    const { Authorization } = authHeader();
    return fetch(`${BASE_URL}/api/staff/bookings/${bookingId}/makeup-complete`, {
      method: "POST",
      headers: Authorization ? { Authorization } : {},
    }).then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        let errMessage = errText;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMessage = parsed.error;
        } catch {}
        throw new Error(errMessage || "Không thể xác nhận hoàn thành makeup.");
      }
      return res.text();
    });
  },

  /** Cập nhật tiến độ hậu kỳ & Bàn giao hình ảnh (Chỉ PHOTOGRAPHER) */
  updatePostProduction: (bookingId: number, data: { productionStatus: string; rawPhotoLink?: string; editedPhotoLink?: string; note?: string }) =>
    apiFetch<any>(`/api/staff/bookings/${bookingId}/post-production`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  /** Thay đổi mật khẩu cá nhân */
  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    const { Authorization } = authHeader();
    return fetch(`${BASE_URL}/api/staff/profile/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(Authorization ? { Authorization } : {}),
      },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        let errMessage = errText;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMessage = parsed.error;
        } catch {}
        throw new Error(errMessage || "Thay đổi mật khẩu thất bại.");
      }
      return res.text();
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN API — /api/admin/** (Requires JWT with ADMIN role)
// ═══════════════════════════════════════════════════════════════════
export const adminApi = {
  // --- Dashboard Statistics & Revenue ---
  getStatistics: () =>
    apiFetch<{ totalStaff: number; totalBookings: number; pendingBookings: number; activePackages: number }>(
      "/api/admin/dashboard/statistics",
      { headers: authHeader() }
    ),

  getRevenue: (startDate: string, endDate: string) =>
    apiFetch<{
      totalRevenue: number;
      totalBookings: number;
      revenueByDate: { date: string; amount: number }[];
      packagePopularity: { packageName: string; bookingCount: number }[];
    }>(`/api/admin/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`, {
      headers: authHeader(),
    }),

  // --- Bookings Management ---
  getBookings: (page: number, size: number, status?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set("status", status);
    return apiFetch<any>(`/api/admin/bookings?${params}`, { headers: authHeader() });
  },

  getBookingDetail: (id: number) =>
    apiFetch<any>(`/api/admin/bookings/${id}`, { headers: authHeader() }),

  updateBookingStatus: (id: number, status: string, note?: string) => {
    const params = new URLSearchParams({ status });
    if (note) params.set("note", note);
    return apiFetch<any>(`/api/admin/bookings/${id}/status?${params}`, {
      method: "PUT",
      headers: authHeader(),
    });
  },

  updatePaymentStatus: (id: number, status: string, method: string = "BANK") => {
    const params = new URLSearchParams({ status, method });
    return apiFetch<any>(`/api/admin/bookings/${id}/payment?${params}`, {
      method: "PUT",
      headers: authHeader(),
    });
  },

  assignStaff: (id: number, photographerId: number, makeupId: number) => {
    const params = new URLSearchParams({
      photographerId: String(photographerId),
      makeupId: String(makeupId),
    });
    return apiFetch<any>(`/api/admin/bookings/${id}/assign?${params}`, {
      method: "POST",
      headers: authHeader(),
    });
  },

  getBookingHistory: (id: number) =>
    apiFetch<any[]>(`/api/admin/bookings/${id}/history`, { headers: authHeader() }),

  // --- Post-Production ---
  getPostProductions: (page: number, size: number, status?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set("status", status);
    return apiFetch<any>(`/api/admin/post-productions?${params}`, { headers: authHeader() });
  },

  updatePostProduction: (bookingId: number, data: { productionStatus: string; rawPhotoLink?: string; editedPhotoLink?: string; note?: string }) =>
    apiFetch<any>(`/api/admin/bookings/${bookingId}/post-production`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  // --- Staff / HR ---
  getStaff: (page: number, size: number, role?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (role) params.set("role", role);
    return apiFetch<any>(`/api/admin/staff?${params}`, { headers: authHeader() });
  },

  createStaff: (data: any) =>
    apiFetch<any>("/api/admin/staff", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  // Creates staff with avatar file upload (multipart/form-data)
  createStaffMultipart: (data: any, avatarFile: File) => {
    const form = new FormData();
    form.append("staff", new Blob([JSON.stringify(data)], { type: "application/json" }));
    form.append("avatarFile", avatarFile);
    const { Authorization } = authHeader();
    return fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")}/api/admin/staff`, {
      method: "POST",
      headers: Authorization ? { Authorization } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    });
  },

  updateStaff: (id: number, data: any) =>
    apiFetch<any>(`/api/admin/staff/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  // Updates staff with avatar file upload (multipart/form-data)
  updateStaffMultipart: (id: number, data: any, avatarFile: File) => {
    const form = new FormData();
    form.append("profile", new Blob([JSON.stringify(data)], { type: "application/json" }));
    form.append("avatarFile", avatarFile);
    const { Authorization } = authHeader();
    return fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")}/api/admin/staff/${id}`, {
      method: "PUT",
      headers: Authorization ? { Authorization } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    });
  },

  toggleStaffActive: (id: number) =>
    apiFetch<any>(`/api/admin/staff/${id}/toggle-active`, {
      method: "PUT",
      headers: authHeader(),
    }),

  toggleStaffDisplay: (id: number) =>
    apiFetch<any>(`/api/admin/staff/${id}/toggle-display`, {
      method: "PUT",
      headers: authHeader(),
    }),

  resetStaffPassword: (id: number, newPass: string) =>
    apiFetch<any>(`/api/admin/staff/${id}/reset-password?newPassword=${encodeURIComponent(newPass)}`, {
      method: "POST",
      headers: authHeader(),
    }),


  // --- Customers (CRM) ---
  getCustomers: (page: number, size: number, search?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.set("search", search);
    return apiFetch<any>(`/api/admin/customers?${params}`, { headers: authHeader() });
  },

  // --- Packages CMS ---
  getPackages: (page: number, size: number) =>
    apiFetch<any>(`/api/admin/packages?page=${page}&size=${size}`, { headers: authHeader() }),

  getPackageById: (id: number) =>
    apiFetch<any>(`/api/admin/packages/${id}`, { headers: authHeader() }),

  createPackage: (data: any) =>
    apiFetch<any>("/api/admin/packages", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  updatePackage: (id: number, data: any) =>
    apiFetch<any>(`/api/admin/packages/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  deletePackage: (id: number) =>
    apiFetch<any>(`/api/admin/packages/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    }),

  // --- Concepts CMS ---
  getConcepts: (page: number, size: number, conceptType?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (conceptType && conceptType !== "ALL") params.set("conceptType", conceptType);
    return apiFetch<any>(`/api/admin/concepts?${params}`, { headers: authHeader() });
  },

  getConceptById: (id: number) =>
    apiFetch<any>(`/api/admin/concepts/${id}`, { headers: authHeader() }),

  createConcept: (data: any) =>
    apiFetch<any>("/api/admin/concepts", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  updateConcept: (id: number, data: any) =>
    apiFetch<any>(`/api/admin/concepts/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  deleteConcept: (id: number) =>
    apiFetch<any>(`/api/admin/concepts/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    }),

  // Upload ảnh tự do lên Cloudinary lấy link URL
  uploadFile: (file: File, folder: string = "studio") => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const { Authorization } = authHeader();
    return fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")}/api/admin/upload`, {
      method: "POST",
      headers: Authorization ? { Authorization } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    });
  },

  // Thêm ảnh mô tả vào Concept
  addConceptImage: (conceptId: number, file: File, sortOrder: number = 0) => {
    const form = new FormData();
    form.append("file", file);
    form.append("sortOrder", String(sortOrder));
    const { Authorization } = authHeader();
    return fetch(`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")}/api/admin/concepts/${conceptId}/images`, {
      method: "POST",
      headers: Authorization ? { Authorization } : {},
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    });
  },

  // Xóa ảnh mô tả khỏi Concept
  deleteConceptImage: (imageId: number) =>
    apiFetch<any>(`/api/admin/concepts/images/${imageId}`, {
      method: "DELETE",
      headers: authHeader(),
    }),

  // --- Blogs CMS ---
  getAdminBlogs: (page: number, size: number) =>
    apiFetch<any>(`/api/admin/blogs?page=${page}&size=${size}`, { headers: authHeader() }),

  getAdminBlogById: (id: number) =>
    apiFetch<any>(`/api/admin/blogs/${id}`, { headers: authHeader() }),

  createAdminBlog: (data: any, conceptId?: number) => {
    const params = new URLSearchParams();
    if (conceptId) params.set("conceptId", String(conceptId));
    const url = `/api/admin/blogs${conceptId ? `?${params}` : ""}`;
    return apiFetch<any>(url, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },

  updateAdminBlog: (id: number, data: any, conceptId?: number) => {
    const params = new URLSearchParams();
    if (conceptId) params.set("conceptId", String(conceptId));
    const url = `/api/admin/blogs/${id}${conceptId ? `?${params}` : ""}`;
    return apiFetch<any>(url, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    });
  },

  deleteAdminBlog: (id: number) =>
    apiFetch<any>(`/api/admin/blogs/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    }),

  // --- Stories CMS ---
  createAdminStory: (data: any) =>
    apiFetch<any>("/api/admin/stories", {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  updateAdminStory: (id: number, data: any) =>
    apiFetch<any>(`/api/admin/stories/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),

  deleteAdminStory: (id: number) =>
    apiFetch<any>(`/api/admin/stories/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    }),

  // --- Studio Information CMS ---
  getStudioInfoAdmin: () =>
    apiFetch<any>("/api/admin/info", { headers: authHeader() }),

  updateStudioInfoAdmin: (data: any) =>
    apiFetch<any>("/api/admin/info", {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    }),
};
