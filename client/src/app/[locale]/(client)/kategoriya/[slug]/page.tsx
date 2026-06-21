"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CategoryPageSkeleton } from "@/components/ui/skeleton";
import { useProducts, useCategoryBySlug } from "@/hooks/use-api";

export default function CategoryDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const slug = params?.slug as string;
  const currentLocale = (params?.locale as string) || "tr";

  // Read subcategories from URL ?subcategories=slug1,slug2
  const subcategoriesParam = searchParams.get("subcategories");
  const selectedSubcategories = React.useMemo(() => {
    return subcategoriesParam ? subcategoriesParam.split(",") : [];
  }, [subcategoriesParam]);

  const categoryQueryValue = selectedSubcategories.length > 0 ? selectedSubcategories.join(",") : slug;

  // Category and Product Queries
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug);
  const { data: apiProducts = [], isLoading: productsLoading } = useProducts({ category: categoryQueryValue });

  const handleSubcategoryToggle = (subSlug: string) => {
    let nextSubcategories = [...selectedSubcategories];
    if (nextSubcategories.includes(subSlug)) {
      nextSubcategories = nextSubcategories.filter((s) => s !== subSlug);
    } else {
      nextSubcategories.push(subSlug);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextSubcategories.length > 0) {
      nextParams.set("subcategories", nextSubcategories.join(","));
    } else {
      nextParams.delete("subcategories");
    }

    router.push(`${window.location.pathname}?${nextParams.toString()}`);
  };

  // Filter & Sort State
  const [sortBy, setSortBy] = React.useState<"price-asc" | "price-desc" | "rating">("price-asc");
  const [onlyInStock, setOnlyInStock] = React.useState(false);
  const [maxPrice, setMaxPrice] = React.useState(250000);

  // Dynamic max price calculation
  const dynamicMaxPrice = React.useMemo(() => {
    if (apiProducts.length === 0) return 250000;
    const maxVal = Math.max(...apiProducts.map((p: any) => {
      const activePrice = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
      return activePrice;
    }));
    return Math.ceil(maxVal / 5000) * 5000 || 250000;
  }, [apiProducts]);

  // Sync maxPrice when dynamicMaxPrice finishes loading
  React.useEffect(() => {
    if (dynamicMaxPrice) {
      setMaxPrice(dynamicMaxPrice);
    }
  }, [dynamicMaxPrice]);

  // Filtered & Sorted Products
  const products = React.useMemo(() => {
    let result = [...apiProducts];

    // Filter by stock
    if (onlyInStock) {
      result = result.filter((p: any) => p.stockQty && p.stockQty > 0);
    }

    // Filter by price
    result = result.filter((p: any) => {
      const activePrice = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
      return activePrice <= maxPrice;
    });

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a: any, b: any) => {
        const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
        const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a: any, b: any) => {
        const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
        const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
        return priceB - priceA;
      });
    } else if (sortBy === "rating") {
      result.sort((a: any, b: any) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    }

    return result;
  }, [apiProducts, sortBy, onlyInStock, maxPrice]);

  const categoryName = category?.name[currentLocale as "tr" | "ru" | "ky"] || category?.name["tr"] || "Koleksiyon";

  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  if (categoryLoading || productsLoading) {
    return <CategoryPageSkeleton />;
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-secondary mb-2">
            {categoryName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("categoryDetail.totalProductsFound", { count: products.length })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-border h-fit space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-secondary">{t("categoryDetail.filter")}</h3>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-secondary">{t("categoryDetail.maxPrice")}</h4>
              <input
                type="range"
                min="0"
                max={dynamicMaxPrice}
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary bg-gray-200 rounded-lg appearance-none h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>0 KGS</span>
                <span className="text-primary font-bold">{maxPrice.toLocaleString()} KGS</span>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="stock-only"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded accent-primary border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="stock-only" className="text-sm font-medium text-secondary cursor-pointer select-none">
                {t("categoryDetail.stockOnly")}
              </label>
            </div>

            {/* Subcategories Filter */}
            {category?.children && category.children.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="font-semibold text-sm text-secondary">{t("categoryDetail.subcategories")}</h4>
                <div className="flex flex-col gap-2.5">
                  {category.children.map((sub: any) => {
                    const subName = sub.name[currentLocale as "tr" | "ru" | "ky"] || sub.name["tr"];
                    const isChecked = selectedSubcategories.includes(sub.slug);
                    return (
                      <div key={sub.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`sub-${sub.slug}`}
                            checked={isChecked}
                            onChange={() => handleSubcategoryToggle(sub.slug)}
                            className="w-4 h-4 rounded accent-primary border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <label htmlFor={`sub-${sub.slug}`} className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors cursor-pointer select-none">
                            {subName}
                          </label>
                        </div>
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full font-bold">
                          {sub.count || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sorting Dropdown */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="font-semibold text-sm text-secondary flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" /> {t("categoryDetail.sort")}
              </h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-border bg-white text-sm font-medium text-secondary focus:border-primary focus:ring-primary outline-none"
              >
                <option value="price-asc">{t("categoryDetail.sortPriceAsc")}</option>
                <option value="price-desc">{t("categoryDetail.sortPriceDesc")}</option>
                <option value="rating">{t("categoryDetail.sortRating")}</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-border min-h-[400px]">
                <p className="text-muted-foreground mb-4">{t("categoryDetail.noProductsFound")}</p>
                <Button onClick={() => { setMaxPrice(dynamicMaxPrice); setOnlyInStock(false); }} className="rounded-full bg-primary hover:bg-primary-dark">
                  {t("categoryDetail.resetFilters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
