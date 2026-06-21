"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, ChevronRight, Search } from "lucide-react";
import { useBlogPosts } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { BlogListSkeleton } from "@/components/ui/skeleton";

export default function BlogListPage() {
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const categoryKeys = ["ALL", "Trendler", "Rehber", "Dekorasyon"];
  const categoryLabels: Record<string, Record<string, string>> = {
    ALL: { tr: "Hepsi", ru: "Все", ky: "Баары" },
    Trendler: { tr: "Trendler", ru: "Тенденции", ky: "Trend'ler" },
    Rehber: { tr: "Rehber", ru: "Руководство", ky: "Колдонмолор" },
    Dekorasyon: { tr: "Dekorasyon", ru: "Декорация", ky: "Декор" }
  };

  const { data: posts = [], isLoading } = useBlogPosts();

  const handleCategoryChange = (catKey: string) => {
    setSelectedCategory(catKey);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post: any) => {
      const title = post.title[currentLocale as "tr" | "ru" | "ky"] || post.title["tr"] || "";
      const excerpt = post.excerpt[currentLocale as "tr" | "ru" | "ky"] || post.excerpt["tr"] || "";
      
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "ALL" || 
                              post.category["tr"] === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory, currentLocale]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, currentPage]);

  // Featured post is the first one
  const featuredPost = posts[0];
  const featuredTitle = featuredPost ? (featuredPost.title[currentLocale as "tr" | "ru" | "ky"] || featuredPost.title["tr"]) : "";
  const featuredExcerpt = featuredPost ? (featuredPost.excerpt[currentLocale as "tr" | "ru" | "ky"] || featuredPost.excerpt["tr"]) : "";

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50 min-h-screen">
        <div className="container-custom">
          <BlogListSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 font-sans min-h-screen">
      <div className="container-custom">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-primary font-bold text-sm tracking-wider uppercase block">
            Belenay Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-secondary">
            Yaşam Alanları İçin Fikirler & İpuçları
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ev dekorasyonu, mobilya bakımı, renk uyumları ve son trendlerle ilgili ilham verici içeriklerimizi inceleyin.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && selectedCategory === "ALL" && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 mb-16 grid grid-cols-1 lg:grid-cols-2"
          >
            <div className="relative min-h-[300px] lg:h-full">
              <Image
                src={featuredPost.image}
                alt={featuredTitle}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
                  {featuredPost.category[currentLocale as "tr" | "ru" | "ky"] || featuredPost.category["tr"]}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-secondary leading-tight">
                  {featuredTitle}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {featuredExcerpt}
                </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex items-center gap-6 text-xs text-muted-foreground font-semibold flex-wrap">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> {featuredPost.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {featuredPost.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {featuredPost.readTime}</span>
                </div>

                <Link href={localizedPath(`/blog/${featuredPost.slug}`)}>
                  <span className="inline-flex items-center text-primary font-bold hover:text-primary-dark cursor-pointer text-sm group">
                    Devamını Oku <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter and Search controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          {/* Categories Tab list */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categoryKeys.map((catKey) => {
              const label = categoryLabels[catKey]?.[currentLocale] || categoryLabels[catKey]?.tr || catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === catKey
                      ? "bg-primary text-white shadow-md shadow-primary/10 scale-105"
                      : "bg-white text-secondary border border-border hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Bloglarda ara..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border bg-white text-sm text-secondary placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-border">
            <p className="text-muted-foreground">Aradığınız kriterlere uygun blog yazısı bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post: any, index: number) => {
              const title = post.title[currentLocale as "tr" | "ru" | "ky"] || post.title["tr"];
              const excerpt = post.excerpt[currentLocale as "tr" | "ru" | "ky"] || post.excerpt["tr"];
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <Image
                      src={post.image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-secondary/80 backdrop-blur-md text-white font-medium px-3 py-1 text-xs rounded-full uppercase">
                        {post.category[currentLocale as "tr" | "ru" | "ky"] || post.category["tr"]}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {post.readTime}</span>
                      </div>

                      <h3 className="text-xl font-bold text-secondary hover:text-primary transition-colors line-clamp-2">
                        <Link href={localizedPath(`/blog/${post.slug}`)}>{title}</Link>
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold text-secondary flex items-center gap-1"><User className="w-3.5 h-3.5 text-primary" /> {post.author}</span>
                      <Link href={localizedPath(`/blog/${post.slug}`)}>
                        <span className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark cursor-pointer group">
                          Devamını Oku <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-white text-secondary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-white text-secondary border border-border hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-white text-secondary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
