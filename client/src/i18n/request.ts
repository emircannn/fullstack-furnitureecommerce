// ============================================================
// Belenay Mobilya - next-intl Sunucu Tarafı Yapılandırması
// Her istekte aktif locale ve mesajlar bu dosya üzerinden
// belirlenir. Server Component'larda kullanılır.
// ============================================================

import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

// ---- Desteklenen Diller ----
export const locales = ["tr", "ru", "ky"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "ru";

export default getRequestConfig(async () => {
  // Cookie'den aktif dili al, yoksa varsayılan dili kullan
  const cookieStore = await cookies();
  const headersList = await headers();
  
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const acceptLanguage = headersList.get("accept-language");
  
  // Dil öncelik sırası: Cookie > Accept-Language > Varsayılan
  let locale: AppLocale = defaultLocale;
  
  if (cookieLocale && locales.includes(cookieLocale as AppLocale)) {
    locale = cookieLocale as AppLocale;
  } else if (acceptLanguage) {
    // Accept-Language başlığından ilk desteklenen dili bul
    const preferredLocale = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang as AppLocale));
    
    if (preferredLocale) {
      locale = preferredLocale as AppLocale;
    }
  }

  // Dil mesajlarını yükle
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    // İç içe mesaj yapısını düzleştir
    messages: messages[locale] ?? messages,
  };
});
