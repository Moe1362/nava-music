import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نوا · موزیک ترند ایران و جهان",
  description: "اپ موزیک نوا: چارت‌های ترند ایران، جهان و دیاسپورا با پخش‌کننده و متن هم‌زمان.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "نوا", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#110c17",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&family=Lalezar&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
