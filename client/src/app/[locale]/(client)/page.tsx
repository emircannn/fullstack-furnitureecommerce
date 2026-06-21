"use client";

import { motion } from "framer-motion";
import { Star, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ProductCardSkeleton, CategoryCardSkeleton, SliderSkeleton } from "@/components/ui/skeleton";

// ─── Dynamic Imports (Code Splitting) ────────────────────────────────────────
// Slider ve ProductCard bileşenleri başlangıç bundle'dan ayrılır,
// yalnızca ihtiyaç duyulduğunda yüklenir (performance iyileştirmesi).
const Slider = dynamic(
  () => import("@/components/homepage/slider").then((m) => m.Slider),
  { loading: () => <SliderSkeleton />, ssr: false }
);

const ProductCard = dynamic(
  () => import("@/components/product/product-card").then((m) => m.ProductCard),
  { loading: () => <ProductCardSkeleton />, ssr: false }
);

import { useProducts, useCategories } from "@/hooks/use-api";


export default function HomePage() {
  const t = useTranslations();
  const params = useParams();
  
  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  // Canlı Veri İstekleri
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: allCategories = [], isLoading: categoriesLoading } = useCategories();
  
  // Sadece ilk 4 ana kategoriyi göster
  const categories = allCategories.slice(0, 4);

  return (
    <main className="flex-1 w-full bg-background overflow-hidden">
      {/* DINAMIK SLIDER */}
      <Slider />

      {/* ÖZELLİKLER (FEATURES SECTION) */}
      <section className="py-16 bg-white border-b border-border">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: t("homepage.freeDelivery"), desc: t("homepage.freeDeliveryDesc") },
              { icon: ShieldCheck, title: t("homepage.warranty"), desc: t("homepage.warrantyDesc") },
              { icon: Star, title: t("homepage.quality"), desc: t("homepage.qualityDesc") }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-8 rounded-3xl bg-gray-50 hover:shadow-xl transition-shadow duration-300 border border-transparent hover:border-primary/20"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HAFTANIN FIRSATLARI (FEATURED PRODUCTS) */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold text-sm tracking-wider uppercase block mb-2">{t("homepage.specialOffers")}</span>
              <h2 className="text-3xl md:text-5xl font-black text-secondary">{t("homepage.dealsOfTheWeek")}</h2>
            </div>
            <Link href={localizedPath("/kategorii")} className="flex items-center text-primary font-bold hover:text-primary-dark transition-colors group text-sm">
              {t("homepage.seeAllProducts")} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("homepage.noProducts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YAŞAM ALANLARI (FEATURED CATEGORIES) */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold text-sm tracking-wider uppercase block mb-2">{t("homepage.categories")}</span>
              <h2 className="text-3xl md:text-5xl font-black text-secondary">{t("homepage.livingSpaces")}</h2>
            </div>
            <Link href={localizedPath("/kategorii")} className="flex items-center text-primary font-bold hover:text-primary-dark transition-colors group text-sm">
              {t("homepage.seeAllCategories")} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("homepage.noCategories")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat: any, i: number) => {
                const catName = cat.name[currentLocale as "tr" | "ru" | "ky"] || cat.name["tr"];
                return (
                  <Link href={localizedPath(`/kategoriya/${cat.slug}`)} key={cat.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group relative h-[380px] rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
                    >
                      <Image
                        src={cat.image}
                        alt={catName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-750 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark/90 via-secondary-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-2xl font-bold text-white mb-2">{catName}</h3>
                        <div className="w-12 h-1 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
