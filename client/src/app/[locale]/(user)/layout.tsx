"use client";

import React from "react";
import { User, ShoppingBag, Heart, Settings, LogOut, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";

  const { user, isAuthenticated, isLoading, logout, setShowAuthModal } = useAuthStore();

  // Redirect to home and open login modal if not authenticated
  React.useEffect(() => {
    if (pathname.includes("/vhod") || pathname.includes("/registraciya") || pathname.includes("/auth/callback")) {
      if (!pathname.includes("/auth/callback")) {
        router.replace(`/${locale}`);
        setTimeout(() => setShowAuthModal(true, pathname.includes("/registraciya") ? "register" : "login"), 150);
      }
      return;
    }

    if (!isLoading && !isAuthenticated) {
      toast.error(t("profile.toastLoginRequired"), {
        description: t("profile.toastLoginRequiredDesc"),
      });
      router.replace(`/${locale}`);
      setTimeout(() => setShowAuthModal(true, "login"), 150);
    }
  }, [isAuthenticated, isLoading, locale, pathname, router, setShowAuthModal, t]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t("profile.toastLogoutSuccess"), { description: t("profile.toastLogoutSuccessDesc") });
      router.push(`/${locale}/giris`);
    } catch {
      toast.error(t("profile.toastLogoutFailed"), { description: t("profile.toastLogoutFailedDesc") });
    }
  };

  const navItems = [
    { name: t("profile.myProfile"), icon: User, path: "/kabinet" },
    { name: t("profile.myOrders"), icon: ShoppingBag, path: "/moi-zakazy" },
    { name: t("profile.myFavorites"), icon: Heart, path: "/izbrannoe" },
    { name: t("profile.accountSettings"), icon: Settings, path: "/nastroiki" },
  ];

  const isAuthPage = pathname.includes("/vhod") || pathname.includes("/registraciya") || pathname.includes("/auth/callback");

  // If loading or checking auth, show a spinner
  if (isLoading && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Prevent flicker for unauthenticated users
  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  // Avoid using sidebar layout for login/register/callback pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen font-sans">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Sidebar */}
          <aside className="bg-white p-6 rounded-3xl border border-border h-fit space-y-6 shadow-sm">
            {/* User welcome card */}
            <div className="flex items-center gap-3 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-white text-base shadow-inner">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-400 uppercase block tracking-wider">{t("profile.sidebarTitle")}</span>
                <span className="text-base font-black text-secondary truncate block">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>

            {/* Return to Shopping */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-primary hover:bg-primary/5 transition-all font-bold text-sm cursor-pointer border border-primary/20 hover:border-primary/40 justify-center shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("profile.backToShopping")}</span>
            </Link>

            {/* Links */}
            <nav className="space-y-1.5">
              {navItems.map((item, idx) => {
                const itemFullPath = `/${locale}${item.path}`;
                const isActive = pathname === itemFullPath || pathname === item.path;

                return (
                  <Link
                    key={idx}
                    href={itemFullPath}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-sm cursor-pointer",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/15"
                        : "text-zinc-500 hover:text-secondary hover:bg-zinc-50"
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/5 transition-all font-bold text-sm cursor-pointer border border-transparent hover:border-rose-500/10"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>{t("profile.logout")}</span>
            </button>
          </aside>

          {/* User Content Area */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
