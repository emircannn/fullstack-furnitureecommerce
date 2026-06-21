"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBlogPostBySlug } from "@/hooks/use-api";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const slug = params?.slug as string;
  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  // Query blog post from backend API
  const { data: post, isLoading, error } = useBlogPostBySlug(slug);

  const [isLiked, setIsLiked] = React.useState(false);

  if (isLoading) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-4">Blog yazısı bulunamadı.</p>
          <Link href={localizedPath("/blog")}>
            <Button className="rounded-full bg-primary hover:bg-primary-dark">
              Blog Listesine Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const postTitle = post.title[currentLocale as "tr" | "ru" | "ky"] || post.title["tr"];
  const postContent = post.content[currentLocale as "tr" | "ru" | "ky"] || post.content["tr"];
  const postExcerpt = post.excerpt[currentLocale as "tr" | "ru" | "ky"] || post.excerpt["tr"];
  const postCategory = post.category[currentLocale as "tr" | "ru" | "ky"] || post.category["tr"];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Bağlantı kopyalandı!", {
        description: "Blog yazısının adresi panoya kopyalandı."
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Beğeni kaldırıldı" : "Blog yazısı beğenildi!");
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>

        {/* Article Header */}
        <div className="space-y-6 mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
            {postCategory}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-secondary leading-tight">
            {postTitle}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed font-medium">
            {postExcerpt}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-6 text-xs text-muted-foreground font-semibold flex-wrap">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> {post.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {post.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {post.readTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                variant="ghost"
                size="icon"
                className={`w-9 h-9 rounded-full ${isLiked ? "text-rose-500 bg-rose-50" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50"}`}
              >
                <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
              </Button>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-border shadow-md mb-12">
          <Image
            src={post.image}
            alt={postTitle}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <article className="prose prose-lg prose-primary max-w-none bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-sm">
          <div className="space-y-6 text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
            {postContent}
          </div>
        </article>
      </div>
    </div>
  );
}
