"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2, Plus, Minus, Ticket, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore";
import { useValidateCoupon, useSettings } from "@/hooks/use-api";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export default function CartPage() {
  const t = useTranslations();
  const params = useParams();

  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  // Zustand
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    appliedCoupon,
    discountAmount,
    couponLabel,
    applyCoupon,
    removeCoupon,
    syncCartItems,
  } = useCartStore();

  // Coupon API
  const validateCoupon = useValidateCoupon();

  // Coupon State
  const [couponCode, setCouponCode] = React.useState(appliedCoupon || "");

  // Settings
  const { data: settings = [] } = useSettings();
  const minFreeShippingLimit = React.useMemo(() => {
    const found = settings.find((s: any) => s.key === "min_free_shipping_limit");
    return found?.value ? parseFloat(found.value) : 100000;
  }, [settings]);

  // Sync cart items on mount
  React.useEffect(() => {
    if (items.length === 0) return;
    const productIds = items.map((item) => item.productId).join(",");
    apiClient
      .get("/products", { params: { ids: productIds } })
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          syncCartItems(res.data.data, currentLocale);
          const updatedProducts = res.data.data;
          const newSubtotal = items.reduce((sum, item) => {
            const foundProduct = updatedProducts.find((p: any) => p.id === item.productId);
            const activePrice = foundProduct
              ? (foundProduct.discountPrice && foundProduct.discountPrice < foundProduct.price ? foundProduct.discountPrice : foundProduct.price)
              : item.price;
            return sum + activePrice * item.quantity;
          }, 0);

          if (appliedCoupon) {
            validateCoupon.mutate(
              { code: appliedCoupon, orderTotal: newSubtotal },
              {
                onSuccess: (data) => {
                  const label = data.type === "PERCENT" ? `%${data.value}` : `${data.value.toLocaleString()} KGS`;
                  applyCoupon(data.code, data.discountAmount, label);
                },
                onError: () => {
                  removeCoupon();
                  toast.error(t("cart.toastCouponRemoved"));
                }
              }
            );
          }
        }
      })
      .catch((err) => {
        console.error("Cart sync failed:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = getTotalPrice();
  const shipping = subtotal === 0 || subtotal > minFreeShippingLimit ? 0 : 2500; // Free shipping over limit, or 0 if cart is empty
  const total = subtotal - discountAmount + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    validateCoupon.mutate(
      { code: couponCode, orderTotal: subtotal },
      {
        onSuccess: (data) => {
          const label = data.type === "PERCENT" ? `%${data.value}` : `${data.value.toLocaleString()} KGS`;
          applyCoupon(data.code, data.discountAmount, label);
          toast.success(t("cart.toastCouponApplied", { label }));
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || t("cart.toastCouponInvalid");
          toast.error(message);
        },
      }
    );
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    toast.info(t("cart.toastCouponRemoved"));
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-secondary mb-2">
            {t("cart.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("cart.itemsCount", { count: items.length })}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 bg-white rounded-3xl border border-border min-h-[400px]">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">{t("cart.empty")}</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {t("cart.emptyDesc")}
            </p>
            <Link href={localizedPath("/kategorii")}>
              <Button className="rounded-full bg-primary hover:bg-primary-dark text-white px-8 py-6 h-auto text-base shadow-lg shadow-primary/20">
                {t("cart.startShopping")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-border p-6 md:p-8 space-y-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || ""}`}
                    className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-border last:border-0 last:pb-0"
                  >
                    {/* Image */}
                    <div className="relative w-full sm:w-28 aspect-square rounded-2xl overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-secondary line-clamp-2">
                            {item.name}
                          </h3>
                          {item.variantId && (
                            <span className="text-xs text-muted-foreground font-semibold">
                              {t("cart.variantLabel", { variant: item.variantId })}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            removeItem(item.productId, item.variantId);
                            toast.info(t("cart.toastRemoved"));
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-50 rounded-full border border-border p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-secondary"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold px-3 text-sm min-w-8 text-center select-none text-secondary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-secondary"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Info */}
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block font-medium">
                            {t("cart.unitPrice", { price: item.price.toLocaleString() })}
                          </span>
                          <span className="font-black text-lg text-secondary">{(item.price * item.quantity).toLocaleString()} KGS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center px-4">
                <Button
                  onClick={() => {
                    clearCart();
                    toast.info(t("cart.toastCleared"));
                  }}
                  variant="outline"
                  className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5"
                >
                  {t("cart.clearCart")}
                </Button>
                <Link href={localizedPath("/kategorii")}>
                  <Button variant="ghost" className="text-primary hover:text-primary-dark font-bold">
                    {t("cart.continueShopping")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cart Summary & Coupon */}
            <div className="space-y-6">
              {/* Coupon Form */}
              <Card className="p-6 rounded-3xl border border-border bg-white">
                <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" /> {t("cart.coupon")}
                </h3>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                    <span className="font-bold">{t("cart.couponApplied", { code: appliedCoupon })}</span>
                    <button onClick={handleRemoveCoupon} className="text-emerald-900 hover:underline font-semibold">{t("cart.remove")}</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      placeholder={t("cart.couponPlaceholder")}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                    />
                    <Button type="submit" className="rounded-xl bg-secondary hover:bg-primary text-white">{t("cart.apply")}</Button>
                  </form>
                )}
              </Card>

              {/* Order Summary */}
              <Card className="p-6 rounded-3xl border border-border bg-white space-y-6">
                <h3 className="font-bold text-lg text-secondary pb-3 border-b border-border">{t("cart.summary")}</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.subtotal")}</span>
                    <span className="font-bold text-secondary">{subtotal.toLocaleString()} KGS</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{t("cart.couponDiscount", { label: couponLabel })}</span>
                      <span className="font-bold">-{discountAmount.toLocaleString()} KGS</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("cart.shippingFee")}</span>
                    <span className="font-bold text-secondary">
                      {shipping === 0 ? t("cart.free") : `${shipping.toLocaleString()} KGS`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="font-bold text-secondary">{t("cart.totalAmount")}</span>
                  <span className="font-black text-2xl text-primary">{total.toLocaleString()} KGS</span>
                </div>

                <Link href={localizedPath("/korzina/odeme")}>
                  <Button className="w-full rounded-full bg-primary hover:bg-primary-dark text-white py-6 font-semibold flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20">
                    {t("cart.completeOrder")}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

