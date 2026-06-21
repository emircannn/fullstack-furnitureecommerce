"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-api";

export default function CategoriesPage() {
  const t = useTranslations();
  const params = useParams();

  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider uppercase block mb-3">
            {t("categories.subtitle")}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6">
            {t("categories.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("categories.desc")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-[450px]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("homepage.noCategories")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category: any, index: number) => {
              const name = category.name[currentLocale as 'tr' | 'ru' | 'ky'] || category.name["tr"];
              const description = category.description[currentLocale as 'tr' | 'ru' | 'ky'] || category.description["tr"];
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border flex flex-col"
                >
                  <div className="relative h-64 w-full overflow-hidden bg-muted">
                    <Image
                      src={category.image}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-secondary/80 backdrop-blur-md text-white font-medium px-3 py-1 text-xs rounded-full">
                        {t("categories.productCount", { count: category.count })}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1 justify-between gap-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-secondary group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                    
                    <Link href={localizedPath(`/kategoriya/${category.slug}`)}>
                      <Button className="w-full rounded-full bg-secondary hover:bg-primary text-white border-0 transition-all font-semibold py-6">
                        {t("categories.viewCollection")}
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
