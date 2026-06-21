"use client";

import * as React from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api-client";

const languages = [
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ky", name: "Кыргызча", flag: "🇰🇬" },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const segments = pathname.split("/");
  const hasLocalePrefix = ["tr", "ru", "ky"].includes(segments[1]);
  const currentLocale = (params?.locale as string) || "tr";

  const handleLanguageChange = (locale: string) => {
    // Cookie'yi güncelle (middleware için)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user) {
      apiClient.patch(`/users/${auth.user.id}`, { language: locale }).catch(console.error);
    }
    
    let newPathname;
    if (hasLocalePrefix) {
      if (locale === "tr") {
        const newSegments = ["", ...segments.slice(2)];
        newPathname = newSegments.join("/") || "/";
      } else {
        const newSegments = [...segments];
        newSegments[1] = locale;
        newPathname = newSegments.join("/") || "/";
      }
    } else {
      if (locale === "tr") {
        newPathname = pathname;
      } else {
        const newSegments = ["", locale, ...segments.slice(1)];
        newPathname = newSegments.join("/") || "/";
      }
    }
    
    router.push(newPathname);
    router.refresh();
  };

  const currentLang = languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-secondary hover:bg-zinc-100 rounded-full px-3 h-9"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{currentLang.flag} {currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white text-secondary border-gray-150 rounded-xl p-1 shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-zinc-50 cursor-pointer"
          >
            <span>{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {currentLocale === lang.code && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
