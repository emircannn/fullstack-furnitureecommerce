"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSettings } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  // Fetch settings dynamically
  const { data: settings = [] } = useSettings();
  const whatsappNumber = React.useMemo(() => {
    const found = settings.find((s: any) => s.key === "whatsapp_number");
    return found?.value ? found.value.replace(/\D/g, "") : "996555180581";
  }, [settings]);

  // Tooltip translations
  const tooltipText = React.useMemo(() => {
    if (locale === "ru") return "Связаться в WhatsApp";
    if (locale === "ky") return "WhatsApp аркылуу байланышуу";
    return "WhatsApp ile İletişime Geçin";
  }, [locale]);

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    locale === "ru" 
      ? "Здравствуйте! У меня есть вопрос." 
      : locale === "ky" 
      ? "Саламатсызбы! Менин суроом бар эле." 
      : "Merhaba! Bir sorum vardı."
  )}`;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip */}
      <div className="absolute right-16 bg-secondary text-white text-[11px] font-bold py-2 px-4 rounded-xl shadow-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none select-none">
        {tooltipText}
        {/* Tooltip arrow */}
        <div className="absolute top-1/2 -translate-y-1/2 right-[-4px] w-2 h-2 bg-secondary rotate-45 border-r border-t border-white/5" />
      </div>

      {/* Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer relative",
          "bg-[#25D366] hover:bg-[#20ba59] shadow-[#25d366]/30 hover:shadow-[#25d366]/40"
        )}
        aria-label="WhatsApp"
      >
        {/* Glow / Pulse Animation Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zM6.59 19.345c1.62.963 3.477 1.47 5.378 1.47 5.489 0 9.954-4.466 9.957-9.958.001-2.661-1.034-5.163-2.915-7.046-1.881-1.882-4.385-2.917-7.048-2.918-5.49 0-9.957 4.468-9.96 9.96-.001 1.986.518 3.923 1.503 5.644l.328.568-1.002 3.655 3.74-.982.559.332zm11.233-5.26c-.3-.149-1.772-.875-2.046-.975-.274-.1-.474-.149-.674.15-.2.3-.772.975-.947 1.173-.175.2-.35.224-.65.074-1.859-.93-3.076-2.022-3.856-3.368-.2-.348-.02-.536.155-.71.157-.156.35-.409.525-.614.175-.205.233-.35.35-.584.117-.233.058-.44-.029-.59-.088-.15-.674-1.623-.925-2.226-.244-.589-.493-.51-.674-.519-.174-.007-.373-.009-.573-.009-.2 0-.524.075-.798.374-.274.3-1.047 1.022-1.047 2.493 0 1.47 1.072 2.89 1.222 3.09.15.2 2.11 3.22 5.11 4.517.714.31 1.272.495 1.708.634.717.228 1.37.196 1.885.118.574-.087 1.772-.724 2.022-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
        </svg>
      </a>
    </div>
  );
}
