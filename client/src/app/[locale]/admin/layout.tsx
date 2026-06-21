"use client";

import React from "react";
import {
  LayoutDashboard, ShoppingBag, FolderTree, Users, Settings, LogOut,
  Bell, Package, Star, HelpCircle, BarChart3, Tag, Percent,
  Wallet, FileText, Home, BookOpen, Menu, X, ChevronRight, ShieldAlert,
  Loader2, Mail
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const menuGroups = [
  {
    label: "Genel",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    label: "Satış & Sipariş",
    items: [
      { name: "Siparişler", icon: ShoppingBag, path: "/admin/orders" },
      { name: "Kuponlar", icon: Tag, path: "/admin/coupons" },
      { name: "İndirimler", icon: Percent, path: "/admin/discounts" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { name: "Ürünler", icon: Package, path: "/admin/products" },
      { name: "Kategoriler", icon: FolderTree, path: "/admin/categories" },
      { name: "Envanter", icon: BarChart3, path: "/admin/inventory" },
    ],
  },
  {
    label: "İçerik",
    items: [
      { name: "Blog", icon: BookOpen, path: "/admin/blog" },
      { name: "Anasayfa Tasarımı", icon: Home, path: "/admin/homepage" },
      { name: "Özel Sayfalar", icon: FileText, path: "/admin/special-pages" },
    ],
  },
  {
    label: "Kullanıcılar",
    items: [
      { name: "Kullanıcılar", icon: Users, path: "/admin/users" },
      { name: "Yorumlar", icon: Star, path: "/admin/reviews" },
      { name: "Sorular", icon: HelpCircle, path: "/admin/questions" },
      { name: "Mesajlar", icon: Mail, path: "/admin/messages" },
    ],
  },
  {
    label: "Finans",
    items: [
      { name: "Muhasebe", icon: Wallet, path: "/admin/accounting" },
    ],
  },
  {
    label: "Sistem",
    items: [
      { name: "Ayarlar", icon: Settings, path: "/admin/settings" },
    ],
  },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const { user, logout, isLoading } = useAuthStore();

  React.useEffect(() => {
    setIsMounted(true);
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  React.useEffect(() => {
    if (!isMounted || !hydrated || pathname.includes("/admin/login")) {
      return;
    }
    if (!isLoading && (!user || user.role !== "admin")) {
      toast.error("Yönetici Yetkisi Gerekiyor", {
        description: "Lütfen yönetici hesabınızla giriş yapın.",
      });
      router.replace(`/${locale}/admin/login`);
    }
  }, [user, isLoading, pathname, locale, router, isMounted, hydrated]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Başarıyla çıkış yapıldı");
      router.push(`/${locale}/admin/login`);
    } catch {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  if ((isLoading || !isMounted || !hydrated) && !pathname.includes("/admin/login")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Prevent flicker
  if (!pathname.includes("/admin/login") && (!isMounted || !hydrated || !user || user.role !== "admin")) {
    return null;
  }
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    const fullPath = locale === "tr" ? path : `/${locale}${path}`;
    return pathname === fullPath || (path !== "/admin" && pathname.startsWith(fullPath));
  };

  const currentPageName = () => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (isActive(item.path)) return item.name;
      }
    }
    return "Yönetim Paneli";
  };

  const getHref = (path: string) => locale === "tr" ? path : `/${locale}${path}`;

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-secondary text-white flex flex-col h-full shadow-2xl z-20 border-r border-white/5 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Brand */}
        <div className={cn("p-4 border-b border-white/5 flex items-center", sidebarOpen ? "justify-between" : "justify-center")}>
          {sidebarOpen ? (
            <Link href={getHref("/admin")} className="flex items-center gap-2">
              <Image src="/assets/logo.svg" alt="Belenay" width={110} height={28} className="h-7 w-auto brightness-0 invert" />
            </Link>
          ) : (
            <ShieldAlert className="w-7 h-7 text-primary" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-3 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={getHref(item.path)}
                      title={!sidebarOpen ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group text-sm font-semibold",
                        active
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-zinc-400 hover:text-white hover:bg-white/5",
                        !sidebarOpen && "justify-center px-0"
                      )}
                    >
                      <item.icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-white" : "text-zinc-400 group-hover:text-white")} />
                      {sidebarOpen && <span>{item.name}</span>}
                      {sidebarOpen && active && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Yönetici"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email || "admin@belenay.com"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Çıkış Yap" : undefined}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent transition-all duration-200 text-sm font-bold cursor-pointer",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-secondary">{currentPageName()}</h2>
            <p className="text-xs text-zinc-400">Belenay Mobilya Yönetim Sistemi</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-zinc-400 hover:text-secondary hover:bg-zinc-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
            </button>
            <span className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-zinc-500 hidden sm:block">Çevrimiçi</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
          {children}
        </div>
      </main>
    </div>
  );
}
