"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { ProductCard } from "@/components/product/product-card";
import { useProducts } from "@/hooks/use-api";

export default function FavoritesPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  
  const { items: favoriteIds } = useFavoriteStore();

  // Tüm ürünleri çekip favorilere göre filtrele
  const { data: allProducts, isLoading } = useProducts();

  const favoriteProducts = React.useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p: any) => p && favoriteIds.includes(p.id));
  }, [allProducts, favoriteIds]);

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("profile.favoritesTitle")}</h1>
        <p className="text-xs text-muted-foreground">
          {favoriteIds.length > 0
            ? t("profile.favoritesCount", { count: favoriteIds.length })
            : t("profile.favoritesDesc")}
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Grid or Empty state */}
      {!isLoading && favoriteProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-border min-h-[400px] shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-secondary mb-2">{t("profile.favoritesEmptyTitle")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-6">
            {t("profile.favoritesEmptyDesc")}
          </p>
          
          <button
            onClick={() => router.push(`/${locale}/kategoriler`)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            {t("profile.exploreProducts")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        !isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {favoriteProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
