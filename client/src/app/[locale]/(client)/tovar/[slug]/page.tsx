"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag, Star, HelpCircle, MessageSquare, Shield, Info, Minus, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, isDiscountActive } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useProductBySlug,
  useProductReviews,
  useProductQuestions,
  useCreateReview,
  useCreateQuestion,
  useSettings
} from "@/hooks/use-api";
import { useAuthStore } from "@/store/useAuthStore";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";

// Specs tab removed.


export default function ProductDetailPage() {
  const t = useTranslations();
  const params = useParams();
  
  const slug = params?.slug as string;
  const currentLocale = (params?.locale as string) || "tr";

  // Dynamic Query
  const { data: product, isLoading, error } = useProductBySlug(slug);

  // Reviews and Questions from DB
  const { data: dbReviews = [], refetch: refetchReviews } = useProductReviews(product?.id || null);
  const { data: dbQuestions = [], refetch: refetchQuestions } = useProductQuestions(product?.id || null);

  const [activeImage, setActiveImage] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<"desc" | "reviews" | "qa">("desc");

  // Modal States
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [showQuestionModal, setShowQuestionModal] = React.useState(false);
  const [newRating, setNewRating] = React.useState(5);
  const [newComment, setNewComment] = React.useState("");
  const [newQuestion, setNewQuestion] = React.useState("");

  // Zustand
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { user, isAuthenticated, setShowAuthModal } = useAuthStore() as any;

  // Settings
  const { data: settings = [] } = useSettings();
  const getSetting = (key: string, fallback: string) => {
    const found = settings.find((s: any) => s.key === key);
    return found ? found.value : fallback;
  };

  // Mutations
  const createReview = useCreateReview();
  const createQuestion = useCreateQuestion();

  // Countdown timer state & hook
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showTimer, setShowTimer] = React.useState(false);

  React.useEffect(() => {
    if (!product || !product.discountEnd || !product.discountPrice) {
      setShowTimer(false);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(product.discountEnd) - +new Date();
      if (difference <= 0) {
        setShowTimer(false);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
      setShowTimer(true);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product]);

  // Set initial active image when product data loads
  React.useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  // Set quantity based on stock
  React.useEffect(() => {
    if (product) {
      if (product.stockQty && product.stockQty > 0) {
        setQuantity(1);
      } else {
        setQuantity(0);
      }
    }
  }, [product]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-4">{t("common.notFound")}</p>
        </div>
      </div>
    );
  }

  const productName = product.name[currentLocale as 'tr' | 'ru' | 'ky'] || product.name["tr"];
  const productDesc = product.description[currentLocale as 'tr' | 'ru' | 'ky'] || product.description["tr"];
  const productShortDesc = product.shortDesc[currentLocale as 'tr' | 'ru' | 'ky'] || product.shortDesc["tr"];

  const isFav = isFavorite(product.id);
  const hasDiscount = isDiscountActive(product) && product.discountPrice && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? (product.discountPrice ?? product.price) : product.price;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: productName,
      price: finalPrice,
      originalPrice: product.price,
      image: product.images[0],
      quantity: quantity
    });

    toast.success(t("productDetail.toastAddedToCart"), {
      description: t("productDetail.toastAddedToCartDesc", { quantity, name: productName })
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error(t("productDetail.toastLoginRequired"));
      return;
    }
    if (!newComment.trim()) {
      toast.error(t("productDetail.toastWriteComment"));
      return;
    }
    createReview.mutate({
      productId: product.id,
      userId: user.id,
      rating: newRating,
      comment: newComment,
    }, {
      onSuccess: () => {
        toast.success(t("productDetail.toastReviewPending"));
        setNewComment("");
        setNewRating(5);
        setShowReviewModal(false);
        refetchReviews();
      },
      onError: () => {
        toast.error(t("productDetail.toastReviewError"));
      }
    });
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error(t("productDetail.toastLoginRequired"));
      return;
    }
    if (!newQuestion.trim()) {
      toast.error(t("productDetail.toastWriteQuestion"));
      return;
    }
    createQuestion.mutate({
      productId: product.id,
      userId: user.id,
      question: newQuestion,
    }, {
      onSuccess: () => {
        toast.success(t("productDetail.toastQuestionPending"));
        setNewQuestion("");
        setShowQuestionModal(false);
        refetchQuestions();
      },
      onError: () => {
        toast.error(t("productDetail.toastQuestionError"));
      }
    });
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Product Layout: Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-border shadow-sm">
              <Image
                src={activeImage || product.images[0]}
                alt={productName}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto py-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-24 aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 transition-all shrink-0",
                    (activeImage || product.images[0]) === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${productName} thumbnail ${idx}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-between py-2">
            <div className="space-y-6">
              {/* Badges & Rating */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  {product.stockQty && product.stockQty > 0 ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">{t("productDetail.inStock")}</Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20">{t("productDetail.outOfStock")}</Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-rose-50 text-rose-600 border border-rose-200">{t("productDetail.discounted")}</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.round(product.averageRating ?? 0) ? "fill-current" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{t("productDetail.reviewsCount", { count: dbReviews.length })}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-secondary leading-tight">
                  {productName}
                </h1>
                <p className="text-sm text-muted-foreground font-semibold">{t("productDetail.stockCode")} {product.stockCode || product.slug.toUpperCase()}</p>
                <p className="text-muted-foreground text-sm pt-2 leading-relaxed">
                  {productShortDesc}
                </p>
              </div>

              {/* Price */}
              <div className="bg-white p-6 rounded-3xl border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{t("productDetail.productPrice")}</p>
                  <div className="flex items-baseline gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl font-black text-primary">
                          {product.discountPrice?.toLocaleString()} KGS
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {product.price.toLocaleString()} KGS
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-secondary">
                        {product.price.toLocaleString()} KGS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground">{t("productDetail.warranty")}</span>
                </div>
              </div>

              {/* Countdown Timer */}
              {showTimer && (
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-3xl border border-orange-400 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 animate-pulse">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">{t("productDetail.limitedOffer")}</p>
                    <h4 className="text-sm font-bold text-white leading-tight">{t("productDetail.remainingTime")}</h4>
                  </div>
                  <div className="flex gap-2 text-center shrink-0">
                    {[
                      { label: t("productDetail.days"), value: timeLeft.days },
                      { label: t("productDetail.hours"), value: timeLeft.hours },
                      { label: t("productDetail.minutes"), value: timeLeft.minutes },
                      { label: t("productDetail.seconds"), value: timeLeft.seconds },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 min-w-[56px] border border-white/10">
                        <span className="block text-lg font-black tracking-tight leading-none mb-1">{String(item.value).padStart(2, "0")}</span>
                        <span className="block text-[9px] font-bold text-orange-100 uppercase tracking-wider">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                {product.stockQty && product.stockQty > 0 ? (
                  <div className="flex items-center bg-white rounded-full border border-border p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-secondary"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold px-4 text-base w-12 text-center select-none text-secondary">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQty ?? 99, q + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-secondary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center bg-gray-100 rounded-full border border-border p-1 opacity-60 cursor-not-allowed">
                    <button disabled className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold px-4 text-base w-12 text-center select-none text-gray-400">
                      0
                    </span>
                    <button disabled className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Add to Cart or WhatsApp Redirect */}
                {product.stockQty && product.stockQty > 0 ? (
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full bg-primary hover:bg-primary-dark text-white py-6 font-semibold flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {t("product.addToCart")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const whatsappPhone = getSetting("whatsapp_number", "996555180581");
                      let messageText = "";
                      if (currentLocale === "ru") {
                        messageText = `Здравствуйте! Я хотел бы получить информацию и сделать заказ на товар "${productName}" (Артикул: ${product.stockCode || product.slug.toUpperCase()}).`;
                      } else if (currentLocale === "ky") {
                        messageText = `Саламатсызбы! Мен "${productName}" (Артикул: ${product.stockCode || product.slug.toUpperCase()}) товары жөнүндө маалымат алып, заказ бергим келет.`;
                      } else {
                        messageText = `Merhaba, "${productName}" (Stok Kodu: ${product.stockCode || product.slug.toUpperCase()}) ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`;
                      }
                      const whatsappMessage = encodeURIComponent(messageText);
                      const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-semibold flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {t("productDetail.contactForOrder")}
                  </Button>
                )}

                {/* Favorite Toggle */}
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error(t("productDetail.toastLoginRequired"));
                      setShowAuthModal(true, "login");
                      return;
                    }
                    toggleFavorite(product.id);
                    toast.success(isFav ? t("productDetail.toastFavRemoved") : t("productDetail.toastFavAdded"));
                  }}
                  variant="outline"
                  className={cn(
                    "rounded-full border-border py-6 px-6 hover:bg-gray-50",
                    isFav && "text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                  )}
                >
                  <Heart className="w-5 h-5" fill={isFav ? "currentColor" : "none"} />
                </Button>

                {/* Share Button */}
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success(t("productDetail.toastCopied"), {
                        description: t("productDetail.toastCopiedDesc")
                      });
                    }
                  }}
                  variant="outline"
                  className="rounded-full border-border py-6 px-6 hover:bg-gray-50"
                  title="Paylaş"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Review & Question Direct Action Buttons */}
              <div className="flex items-center gap-4 border-t border-border pt-4">
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error(t("productDetail.toastLoginRequired"));
                      setShowAuthModal(true, "login");
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                  variant="outline"
                  className="flex-1 rounded-full border-border text-secondary hover:bg-zinc-50 font-bold"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                  {t("productDetail.writeReview")}
                </Button>
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error(t("productDetail.toastLoginRequired"));
                      setShowAuthModal(true, "login");
                      return;
                    }
                    setShowQuestionModal(true);
                  }}
                  variant="outline"
                  className="flex-1 rounded-full border-border text-secondary hover:bg-zinc-50 font-bold"
                >
                  <HelpCircle className="w-4 h-4 mr-2 text-primary" />
                  {t("productDetail.askQuestion")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs: Description, Specs, Reviews, Q&A */}
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
          {/* Tab Buttons */}
          <div className="flex border-b border-border bg-gray-50/50 overflow-x-auto">
            {[
              { key: "desc", label: t("productDetail.description"), icon: Info },
              { key: "reviews", label: t("productDetail.reviews", { count: dbReviews.length }), icon: MessageSquare },
              { key: "qa", label: t("productDetail.qa", { count: dbQuestions.length }), icon: HelpCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all white-space-nowrap",
                    activeTab === tab.key
                      ? "border-primary text-primary bg-white"
                      : "border-transparent text-muted-foreground hover:text-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="p-8">
            {activeTab === "desc" && (
              <div className="space-y-4">
                <div 
                  className="text-muted-foreground text-sm leading-relaxed html-content"
                  dangerouslySetInnerHTML={{ __html: productDesc }}
                />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-secondary">{t("productDetail.customerReviews")}</h4>
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error(t("productDetail.toastLoginRequired"));
                        setShowAuthModal(true, "login");
                        return;
                      }
                      setShowReviewModal(true);
                    }}
                    className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2"
                  >
                    {t("productDetail.writeReview")}
                  </Button>
                </div>
                {dbReviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">{t("productDetail.noReviews")}</p>
                ) : (
                  dbReviews.map((rev: any) => (
                    <div key={rev.id} className="p-6 rounded-2xl bg-gray-50 border border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-secondary">
                          {rev.user ? (rev.user.name || `${rev.user.firstName || ""} ${rev.user.lastName || ""}`.trim()) : "Müşteri"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rev.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3.5 h-3.5", i < rev.rating ? "fill-current" : "text-gray-200")} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "qa" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h4 className="font-bold text-secondary">{t("productDetail.qaTitle")}</h4>
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error(t("productDetail.toastLoginRequired"));
                        setShowAuthModal(true, "login");
                        return;
                      }
                      setShowQuestionModal(true);
                    }}
                    className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2"
                  >
                    {t("productDetail.askQuestion")}
                  </Button>
                </div>
                {dbQuestions.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">{t("productDetail.noQuestions")}</p>
                ) : (
                  dbQuestions.map((q: any) => (
                    <div key={q.id} className="p-6 rounded-2xl bg-gray-50 border border-border space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-primary uppercase tracking-wide">
                            {t("productDetail.questionLabel")} ({q.user ? (q.user.name || `${q.user.firstName || ""} ${q.user.lastName || ""}`.trim()) : "Müşteri"})
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(q.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-secondary">{q.question}</p>
                      </div>
                      {q.answer ? (
                        <div className="pl-4 border-l-2 border-primary space-y-1">
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{t("productDetail.answerBelenay")}</span>
                          <p className="text-sm text-muted-foreground">{q.answer}</p>
                        </div>
                      ) : (
                        <div className="pl-4 border-l-2 border-gray-300 space-y-1">
                          <p className="text-xs text-muted-foreground italic">{t("productDetail.noAnswer")}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-secondary mb-4">{t("productDetail.rateProduct")}</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t("productDetail.yourRating")}</label>
                <div className="flex gap-1.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewRating(i + 1)}
                      className="focus:outline-none cursor-pointer"
                    >
                      <Star className={cn("w-7 h-7 transition-colors", i < newRating ? "fill-current" : "text-gray-200")} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t("productDetail.yourComment")}</label>
                <textarea
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary resize-none"
                  placeholder={t("productDetail.commentPlaceholder")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createReview.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {createReview.isPending ? t("productDetail.sending") : t("productDetail.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-secondary mb-4">{t("productDetail.askQuestion")}</h3>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">{t("productDetail.yourQuestion")}</label>
                <textarea
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary text-secondary resize-none"
                  placeholder={t("productDetail.questionPlaceholder")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-secondary hover:bg-zinc-50 cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createQuestion.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold disabled:opacity-60 cursor-pointer"
                >
                  {createQuestion.isPending ? t("productDetail.sending") : t("productDetail.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
