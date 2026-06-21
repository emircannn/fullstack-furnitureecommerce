"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategories } from "@/hooks/use-api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  
  // Zustand States
  const { items: cartItems, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();
  const { items: favItems } = useFavoriteStore();
  const { user, isAuthenticated, logout, setShowAuthModal } = useAuthStore();
  
  // API Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const displayCategories = categories.filter((cat: any) => cat.showInHeader).slice(0, 6);
  const headerCategories = displayCategories.length > 0 ? displayCategories : categories.slice(0, 5);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path === "/" ? "" : path}`;
  };

  // Scroll takibi (Header arkaplan değişimi için)
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-45 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/95 backdrop-blur-md py-3 border-gray-100 shadow-md"
          : "bg-white py-4 border-gray-100/80"
      )}
    >
      <div className="container-custom flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href={localizedPath("/")} className="flex items-center gap-2 shrink-0">
          <Image
            src="/assets/logo.svg"
            alt="Belenay Mobilya Logo"
            width={180}
            height={44}
            className="h-10 md:h-12 w-auto transition-transform hover:scale-102"
            priority
          />
        </Link>

        {/* ORTALANMIŞ ARAMA BARI */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder={t("common.search")}
              className="bg-zinc-100 border-zinc-200 text-secondary rounded-full pl-10 pr-4 h-10 w-full focus-visible:ring-primary/20 focus-visible:ring-2 focus-visible:border-primary placeholder:text-zinc-400 focus-visible:bg-white transition-all text-xs font-semibold"
            />
            <Search className="w-4 h-4 text-zinc-400 pointer-events-none" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* EYLEMLER / ARAÇLAR */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Mobil Arama Butonu tetikleyicisi (Arama input gizlenebilir) */}
          
          {/* Dil Seçici */}
          <LanguageSwitcher />

          {/* Desktop Only Actions (Favoriler, Sepet, Profil) */}
          <div className="hidden lg:flex items-center gap-2 md:gap-4">
            {/* Favoriler Butonu */}
            <Link href={localizedPath("/izbrannoe")}>
              <Button variant="ghost" size="icon" className="relative rounded-full text-secondary hover:bg-zinc-100 w-9 h-9">
                <Heart className="w-5 h-5" />
                {mounted && favItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px] bg-primary text-white font-bold border-2 border-white">
                    {favItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Sepet Çekmecesi (Sheet) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full text-secondary hover:bg-zinc-100 w-9 h-9">
                  <ShoppingBag className="w-5 h-5" />
                  {mounted && getTotalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px] bg-primary text-white font-bold border-2 border-white animate-pulse">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white text-secondary border-gray-150 w-full sm:max-w-md flex flex-col p-6">
                <SheetHeader className="border-b border-gray-100 pb-4">
                  <SheetTitle className="text-xl font-bold text-secondary flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    {t("cart.title")}
                  </SheetTitle>
                </SheetHeader>

                {/* Sepet Ürün Listesi */}
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-secondary">{t("cart.empty")}</h3>
                    <p className="text-xs text-muted-foreground mb-6">Koleksiyonlarimizi inceleyerek sepetinizi doldurmaya baslayabilirsiniz.</p>
                    <SheetClose asChild>
                      <Button className="rounded-full bg-primary hover:bg-primary-dark w-full cursor-pointer">{t("cart.continueShopping")}</Button>
                    </SheetClose>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                      {cartItems.map((item) => (
                        <div key={`${item.productId}-${item.variantId || ""}`} className="flex gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            {/* Miktar Secici */}
                            <div>
                              <h4 className="text-sm font-bold text-secondary line-clamp-1">{item.name}</h4>
                              <span className="text-xs text-primary font-bold">{item.price.toLocaleString()} KGS</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-zinc-100 rounded-full border border-zinc-200 px-1 py-0.5">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-secondary"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold px-2 text-secondary">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-secondary"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {/* Silme */}
                              <button
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="text-zinc-400 hover:text-destructive transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sepet Alt Toplam ve Checkout */}
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-zinc-500">{t("cart.subtotal")}</span>
                        <span className="text-lg font-extrabold text-secondary">{getTotalPrice().toLocaleString()} KGS</span>
                      </div>
                      <div className="flex gap-3">
                        <SheetClose asChild>
                          <Button variant="outline" className="flex-1 rounded-full border-zinc-200 text-secondary hover:bg-zinc-50">
                            {t("cart.continueShopping")}
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href={localizedPath("/korzina/odeme")} className="flex-1">
                            <Button className="w-full rounded-full bg-primary hover:bg-primary-dark cursor-pointer text-white">
                              {t("cart.checkout")}
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* Kullanıcı Menüsü */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-secondary hover:bg-zinc-100 w-9 h-9">
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white text-secondary border-gray-150 rounded-xl p-1 shadow-lg">
                {!mounted ? (
                  <DropdownMenuItem
                    onClick={() => setShowAuthModal(true, "login")}
                    className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 cursor-pointer w-full text-secondary font-medium"
                  >
                    {t("auth.login")}
                  </DropdownMenuItem>
                ) : isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="font-bold text-secondary px-3 py-2 text-sm">
                      {user?.firstName} {user?.lastName}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-100" />
                    <DropdownMenuItem asChild>
                      <Link href={localizedPath("/kabinet")} className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 cursor-pointer w-full text-secondary font-medium">
                        {t("nav.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={localizedPath("/moi-zakazy")} className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 cursor-pointer w-full text-secondary font-medium">
                        {t("nav.orders")}
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href={localizedPath("/admin")} className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 text-primary font-bold cursor-pointer w-full">
                          {t("nav.admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-zinc-100" />
                    <DropdownMenuItem onClick={logout} className="rounded-lg px-3 py-2 text-sm text-destructive hover:bg-rose-50/50 flex items-center gap-2 cursor-pointer w-full font-semibold">
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => setShowAuthModal(true, "login")}
                      className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 cursor-pointer w-full text-secondary font-medium"
                    >
                      {t("auth.login")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowAuthModal(true, "register")}
                      className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 cursor-pointer w-full text-secondary font-medium"
                    >
                      {t("auth.register")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ANA KATEGORİLER ALT BAR (DESKTOP) */}
      <div className="hidden lg:block border-t border-gray-100 mt-4 pt-3">
        <div className="container-custom flex justify-center">
          <ul className="flex items-center gap-8 h-7">
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <li key={idx} className="h-4 w-16 bg-zinc-200 animate-pulse rounded-full" />
              ))
            ) : (
              headerCategories.map((cat: any) => {
                const catName = cat.name[currentLocale as "tr" | "ru" | "ky"] || cat.name["tr"];
                const isActiveCat = pathname.includes(`/kategoriya/${cat.slug}`);
                return (
                  <li key={cat.id} className="relative group pb-2">
                    <Link
                      href={localizedPath(`/kategoriya/${cat.slug}`)}
                      className={cn(
                        "text-sm font-semibold tracking-wide transition-colors duration-200 block cursor-pointer",
                        isActiveCat ? "text-primary font-bold" : "text-secondary hover:text-primary"
                      )}
                    >
                      {catName}
                    </Link>
                    {/* ALT ANİMASYONLU ÇİZGİ */}
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                        isActiveCat ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
