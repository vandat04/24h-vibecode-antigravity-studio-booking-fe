import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | LEON STUDIO",
  description: "Đăng nhập vào hệ thống quản lý LEON STUDIO",
  robots: "noindex,nofollow",
};

// Login page không cần Navbar và Footer
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
