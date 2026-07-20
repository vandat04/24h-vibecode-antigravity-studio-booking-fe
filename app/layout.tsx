import type { Metadata } from "next";
import Script from "next/script";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-PHVVRZC5";
const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-XV55TX2K11";
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION || "";

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
  ...(gscVerification
    ? {
        verification: {
          google: gscVerification,
        },
      }
    : {}),
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
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Google Tag Manager Script */}
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='gtm'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {/* Optional Direct Google Analytics GA4 Script */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
