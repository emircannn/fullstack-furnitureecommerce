// ============================================================
// Belenay Mobilya - Root Layout
// Tüm sayfalar için temel layout bileşeni.
// Montserrat fontu ve next-intl dil desteği burada yüklenir.
// ============================================================

import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { OrganizationJsonLd, WebsiteJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { AuthModal } from "@/components/auth/auth-modal";
import "./globals.css";


// ---- Montserrat Font Yüklemesi ----
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
});

// ---- Sayfa Metadata Tanımlaması ----
export const metadata: Metadata = {
  title: {
    default: "Belenay Mobilya",
    template: "%s | Belenay Mobilya",
  },
  description: "Belenay Mobilya - Kaliteli ve şık mobilya çözümleri",
  keywords: ["mobilya", "furniture", "мебель", "жиhаздар"],
  authors: [{ name: "Belenay Mobilya" }],
  creator: "Belenay Mobilya",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["ru_RU", "ky_KG"],
    siteName: "Belenay Mobilya",
    title: "Belenay Mobilya",
    description: "Belenay Mobilya - Kaliteli ve şık mobilya çözümleri",
  },
  twitter: {
    card: "summary_large_image",
    title: "Belenay Mobilya",
    description: "Belenay Mobilya - Kaliteli ve şık mobilya çözümleri",
  },
};

// ---- Viewport Ayarları ----
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e75f0d",
};

// ---- Root Layout Bileşeni ----
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Aktif dili ve mesajları al
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* DNS ön çözümlemesi için bağlantı ipuçları */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD Structured Data */}
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body
        className={`${montserrat.variable} font-montserrat antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <Providers>
          {/* next-intl dil sağlayıcısı */}
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <AuthModal />
            <Toaster position="top-right" richColors />
          </NextIntlClientProvider>
        </Providers>

      </body>
    </html>
  );
}
