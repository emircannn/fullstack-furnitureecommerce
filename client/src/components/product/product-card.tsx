"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore, isDiscountActive } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner"; // Sonner is installed in package.json

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: Record<string, string>; // Çok dilli isim: { tr: "", ru: "", ky: "" }
    price: number;
    discountPrice?: number | null;
    discountStart?: string | Date | null;
    discountEnd?: string | Date | null;
    isDiscountPermanent?: boolean;
    images: string[];
    averageRating?: number;
    reviewCount?: number;
    stockQty?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  
  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path === "/" ? "" : path}`;
  };

  // Zustand Store
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();

  const isFav = isFavorite(product.id);
  const productName = product.name[currentLocale] || product.name["tr"];
  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop";

  // İndirim Yüzdesi Hesaplama
  const activeDiscount = isDiscountActive(product);
  const hasDiscount = activeDiscount && product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const activePrice = hasDiscount && product.discountPrice ? product.discountPrice : product.price;

    addItem({
      productId: product.id,
      name: productName,
      price: activePrice,
      originalPrice: product.price,
      image: primaryImage,
      quantity: 1
    });

    toast.success(t("productDetail.toastAddedToCart"), {
      description: t("productDetail.toastAddedToCartDesc", { quantity: 1, name: productName })
    });
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error(t("productDetail.toastLoginRequired"));
      setShowAuthModal(true, "login");
      return;
    }

    toggleFavorite(product.id);
    
    if (!isFav) {
      toast.success(t("productDetail.toastFavAdded"));
    } else {
      toast.info(t("productDetail.toastFavRemoved"));
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/20 flex flex-col h-full">
      {/* ÜRÜN GÖRSELİ */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Link href={localizedPath(`/tovar/${product.slug}`)} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* İndirim Etiketi */}
        {hasDiscount && (
          <Badge className="absolute top-4 left-4 bg-primary text-white font-bold px-2.5 py-1 text-xs rounded-full">
            -%{discountPercent} {t("cart.discount")}
          </Badge>
        )}

        {/* Favori Butonu */}
        <Button
          onClick={handleToggleFav}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-secondary shadow-sm hover:shadow transition-transform hover:scale-105 active:scale-95 duration-200",
            isFav && "text-destructive"
          )}
        >
          <Heart className="w-5 h-5" fill={isFav ? "currentColor" : "none"} />
        </Button>
      </div>

      {/* ÜRÜN BİLGİLERİ */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          {/* Değerlendirme Yıldızları */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i < Math.round(product.averageRating ?? 0)
                      ? "fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-semibold">
              ({product.reviewCount ?? 0})
            </span>
          </div>

          {/* Ürün İsmi */}
          <Link href={localizedPath(`/tovar/${product.slug}`)}>
            <h3 className="font-bold text-secondary text-base line-clamp-2 hover:text-primary transition-colors leading-snug">
              {productName}
            </h3>
          </Link>
        </div>

        {/* Fiyat ve Sepete Ekle Butonu */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-muted-foreground line-through font-medium">
                  {product.price.toLocaleString()} KGS
                </span>
                <span className="text-lg font-black text-primary">
                  {product.discountPrice?.toLocaleString()} KGS
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-secondary">
                {product.price.toLocaleString()} KGS
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            size="icon"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-105 active:scale-95 duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
