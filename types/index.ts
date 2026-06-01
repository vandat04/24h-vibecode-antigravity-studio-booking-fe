// ════════════════════════════════════════════════════════════════════
// TypeScript Types — Aligned với Backend Response (guest_api_analysis.md)
// ════════════════════════════════════════════════════════════════════

// ─── API 1: Studio Info ────────────────────────────────────────────
export interface StudioInfo {
  id: number;
  studioName: string;
  logoUrl: string;
  bannerUrl: string;
  address: string;
  phone: string;
  email: string;
  facebookUrl?: string;
  zaloUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  introVideoUrl?: string;
  introduction?: string;
  workingProcess?: string;
  googleMapUrl?: string;
}

// ─── API 2: Concept Summary (danh sách) ───────────────────────────
export type ConceptType = "BEAUTY" | "COUPLE" | "BIRTHDAY" | "FAMILY" | "OUTDOOR" | "EVENT" | "OTHER";

export interface ConceptSummary {
  id: number;
  title: string;
  slug: string;
  conceptType: ConceptType;
  thumbnailUrl: string;
  description: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
}

// ─── API 3: Concept Detail (chi tiết + ảnh + credits) ─────────────
export interface ConceptImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface ConceptCredit {
  fullName: string;
  role: "PHOTOGRAPHER" | "MAKEUP";
}

export interface ConceptDetail extends ConceptSummary {
  images: ConceptImage[];
  credits: ConceptCredit[];
}

// ─── API 4: Package Summary (danh sách) ───────────────────────────
export interface PackageSummary {
  id: number;
  packageName: string;
  slug: string;
  price: number;
  shortDescription: string;
  layoutCount: number;
  outfitCount: number;
  editedPhotos: number;
  makeupPersonCount: number;
  thumbnailUrl: string;
  isActive: boolean;
}

// ─── API 5: Package Detail ─────────────────────────────────────────
export interface PackageDetail extends PackageSummary {
  detailContent: string; // HTML content
}

// ─── API 6: Staff Member ───────────────────────────────────────────
export type StaffRole = "PHOTOGRAPHER" | "MAKEUP";

export interface StaffMember {
  profileId: number;
  userId: number;
  fullName: string;
  roleName: StaffRole;
  avatarUrl: string;
  bio: string;
  experienceDetail: string;
  yearsOfExperience: number;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

// ─── API 7: Blog Summary (danh sách) ──────────────────────────────
export interface BlogSummary {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  relatedConceptId?: number;
  relatedConceptTitle?: string;
  relatedConceptSlug?: string;
}

// ─── API 8: Blog Detail ────────────────────────────────────────────
export interface BlogDetail extends BlogSummary {
  content: string; // HTML content
  relatedConcept?: ConceptSummary;
}

// ─── API 9: Customer Story (Before/After) ─────────────────────────
export interface CustomerStory {
  id: number;
  customerName: string;
  avatarUrl: string;        // ảnh Before
  imageAfterUrl: string;    // ảnh After
  storyContent: string;
  createdAt: string;
}

// ─── API 10: Schedule ─────────────────────────────────────────────
export interface ScheduleResponse {
  date: string;
  bookedSlots: string[];     // ["09:00", "14:30"]
  availableSlots: string[];  // ["07:30", "10:30", "13:00", "16:00"]
}

// Khung giờ cố định của Studio
export const STUDIO_TIME_SLOTS = ["07:30", "09:00", "10:30", "13:00", "14:30", "16:00"] as const;

// ─── API 10b: Booking Hold ────────────────────────────────────────
export interface BookingHoldRequest {
  shootDate: string;        // "2026-08-23"
  shootTimeSlot: string;    // "09:00:00"
  conceptId: number;
  packageId: number;
}

export interface BookingHoldResponse {
  holdToken: string;        // UUID
  holdExpiredAt: string;    // ISO datetime
  message: string;
}

// ─── API 11: Booking Request ──────────────────────────────────────
export interface BookingRequest {
  customerName: string;
  customerEmail: string;      // BẮT BUỘC (backend validate)
  customerPhone: string;
  customerFacebook?: string;
  shootDate: string;          // "yyyy-MM-dd"
  shootTimeSlot: string;      // "HH:mm:ss"
  shootLocation: string;      // BẮT BUỘC
  packageId: number;
  conceptId: number;          // BẮT BUỘC
  customerNotes?: string;
  holdToken?: string;         // UUID từ API hold
}

export interface BookingResponse {
  id: number;
  bookingCode: string;        // "STB-20260820-A3FBX"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shootDate: string;
  shootTimeSlot: string;
  shootLocation: string;
  packageName: string;
  conceptTitle: string;
  totalAmount: number;
  bookingStatus: "PENDING" | "CONFIRMED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "DEPOSITED" | "PAID";
  createdAt: string;
  message: string;
}

// ─── API 12: Booking Lookup ───────────────────────────────────────
export interface AssignedStaff {
  fullName: string;
  role: StaffRole;
  avatarUrl: string;
}

export interface BookingLookupResponse {
  bookingCode: string;
  customerName: string;
  shootDate: string;
  shootTimeSlot: string;
  shootLocation: string;
  packageName: string;
  conceptTitle: string;
  totalAmount: number;
  bookingStatus: BookingResponse["bookingStatus"];
  paymentStatus: BookingResponse["paymentStatus"];
  assignedStaff: AssignedStaff[];
  productionStatus: string | null;
  editedPhotoLink: string | null;
}

// ─── Auth ──────────────────────────────────────────────────────────
export type UserRole = "ADMIN" | "PHOTOGRAPHER" | "MAKEUP";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  userId: number;
  fullName: string;
  message?: string;
}

// ─── Legacy aliases (backward compat with existing components) ─────
/** @deprecated Use PackageSummary */
export type Package = PackageSummary & {
  name: string;
  description: string;
  durationMinutes?: number;
  includesMakeup?: boolean;
  imageUrl?: string;
};

/** @deprecated Use ConceptSummary */
export type Concept = ConceptSummary & {
  name: string;
  category?: string;
  imageUrl?: string;
};

/** @deprecated Use BlogSummary */
export type BlogPost = BlogSummary & {
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  publishedAt: string;
  category?: string;
};

/** @deprecated Use CustomerStory */
export type Testimonial = CustomerStory & {
  rating: number;
  comment: string;
  packageName?: string;
};

export interface NavLink {
  label: string;
  href: string;
}
