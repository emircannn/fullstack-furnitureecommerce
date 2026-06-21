// ============================================================
// Belenay Mobilya - Next.js Middleware
// next-intl ile dil tespiti ve yönlendirme yapılır.
// Korunan rotalar için kimlik doğrulama kontrolü buraya eklenir.
// ============================================================

import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// ---- Desteklenen Diller ----
export const locales = ["tr", "ru", "ky"] as const;
export type AppLocale = (typeof locales)[number];

// ---- Varsayılan Dil ----
export const defaultLocale: AppLocale = "ru";

// ---- Korunan Rotalar (Giriş Gerektirir) ----
const protectedRoutes = [
  "/kabinet",
  "/moi-zakazy",
  "/korzina/odeme",
  "/izbrannoe",
];

// ---- Admin Rotaları (Admin Yetkisi Gerektirir) ----
const adminRoutes = ["/admin"];

// ---- next-intl Middleware Oluşturma ----
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Varsayılan dil için URL'de locale prefix kullan
  localePrefix: "as-needed",
  // Tarayıcı diline göre otomatik yönlendirme
  localeDetection: true,
});

// ---- Ana Middleware Fonksiyonu ----
export async function middleware(request: NextRequest): Promise<any> {
  const pathname = request.nextUrl.pathname;

  // Statik dosyalar ve API rotaları için middleware'i atla
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next() as any;
  }

  // next-intl middleware'ini çalıştır
  const response = intlMiddleware(request as any);

  return response as any;
}

// ---- Middleware Eşleştirme Kuralları ----
export const config = {
  matcher: [
    // Statik dosyaları hariç tut, diğer tüm yollar için çalıştır
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
