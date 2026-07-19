import type { Metadata } from "next";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEON STUDIO | Nâng tầm vẻ đẹp",
  description:
    "LEON STUDIO - Nhiếp ảnh chuyên nghiệp, trang điểm nghệ thuật. Ghi lại vẻ đẹp của bạn qua từng khoảnh khắc đáng nhớ.",
  keywords: "studio chụp hình, trang điểm, nhiếp ảnh, leon studio, chụp ảnh nghệ thuật",
  openGraph: {
    title: "LEON STUDIO | Nâng tầm vẻ đẹp",
    description: "Nhiếp ảnh chuyên nghiệp & trang điểm nghệ thuật",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Hanken+Grotesk:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

