"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Grid, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";

export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";

  const { getTotalItems } = useCartStore();
  const { items: favItems } = useFavoriteStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path === "/" ? "" : path}`;
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true, "login");
    }
  };

  const navItems = [
    {
      icon: Home,
      label: t("nav.home") || "Ana Sayfa",
      path: localizedPath("/"),
    },
    {
      icon: Grid,
      label: t("nav.categories") || "Kategoriler",
      path: localizedPath("/kategorii"),
    },
    {
      icon: ShoppingBag,
      label: t("cart.title") || "Sepet",
      path: localizedPath("/korzina"),
      badge: mounted ? getTotalItems() : 0,
    },
    {
      icon: Heart,
      label: t("nav.favorites") || "Favoriler",
      path: localizedPath("/izbrannoe"),
      badge: mounted ? favItems.length : 0,
    },
    {
      icon: User,
      label: t("nav.account") || "Hesabım",
      path: localizedPath("/kabinet"),
      onClick: handleAccountClick,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-150 z-45 flex items-center justify-around px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== localizedPath("/") && pathname.startsWith(item.path));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.path}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-zinc-400 hover:text-primary transition-colors relative"
          >
            <div className="relative p-1">
              <Icon className={cn("w-5.5 h-5.5 transition-transform duration-200", isActive && "text-primary scale-110")} />
              {!!item.badge && item.badge > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 flex items-center justify-center p-0 rounded-full text-[9px] bg-primary text-white font-bold border border-white">
                  {item.badge}
                </Badge>
              )}
            </div>
            {currentLocale === "tr" && (
              <span className={cn("text-[10px] font-bold mt-0.5 tracking-wide", isActive ? "text-primary font-black" : "text-zinc-500")}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
