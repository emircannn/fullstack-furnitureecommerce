import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// ---- next-intl eklentisini yapılandır ----
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ---- Görüntü Optimizasyonu Ayarları ----
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ---- Deneysel Özellikler ----
  experimental: {
    // Sunucu eylemlerini etkinleştir
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // React derleyicisi (Next.js 15 ile gelir)
    reactCompiler: false,
  },

  // ---- Güvenlik Başlıkları ----
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // ---- Yönlendirme Kuralları ----
  async redirects() {
    return [];
  },

  // ---- Çevre Değişkeni Doğrulaması ----
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  },
};

export default withNextIntl(nextConfig as any);

