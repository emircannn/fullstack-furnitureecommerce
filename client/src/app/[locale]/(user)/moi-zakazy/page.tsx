"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Package, Clock, CheckCircle, Truck, XCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserOrders } from "@/hooks/use-api";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslations } from "next-intl";

// Sipariş durumları için renkler ve ikonlar
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING_APPROVAL: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  PREPARING: {
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  SHIPPED: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  COMPLETED: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  const t = useTranslations();

  const user = useAuthStore((state) => state.user) as any;
  const { data: orders, isLoading } = useUserOrders(user?.id || null);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 font-sans">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("orders.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("orders.loading")}</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="space-y-8 font-sans">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("orders.title")}</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-border min-h-[400px] shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-secondary mb-2">{t("orders.loginRequired")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-6">
            {t("orders.loginRequiredDesc")}
          </p>
          <button
            onClick={() => router.push(`/${locale}/giris`)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            {t("orders.loginBtn")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-8 font-sans">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("orders.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("profile.subtitle")}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-border min-h-[400px] shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-secondary mb-2">{t("orders.emptyTitle")}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mb-6">
            {t("orders.emptyDesc")}
          </p>
          <button
            onClick={() => router.push(`/${locale}/kategoriler`)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            {t("orders.startShopping")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("orders.title")}</h1>
        <p className="text-xs text-muted-foreground">
          {t("orders.totalCount", { count: orders.length })}
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order: any, index: number) => {
          const config = statusConfig[order.status] || statusConfig.PENDING_APPROVAL;
          const orderDate = new Date(order.createdAt).toLocaleDateString(
            locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : "ky-KG",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          );

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5 md:p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {t("orders.orderNo")} <span className="font-bold text-secondary">{order.id.slice(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{orderDate}</p>
                    </div>
                  </div>

                  <Badge className={`${config.color} border px-3 py-1 text-xs font-bold flex items-center gap-1.5 w-fit`}>
                    {config.icon}
                    {t(`orders.status.${order.status}`)}
                  </Badge>
                </div>

                {/* Items Summary */}
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground truncate max-w-[60%]">
                        {item.productName?.[locale] || item.productName?.tr || "Ürün"} × {item.qty}
                      </span>
                      <span className="font-bold text-secondary whitespace-nowrap">
                        {(item.price * item.qty).toLocaleString()} KGS
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      {t("orders.moreProducts", { count: order.items.length - 3 })}
                    </p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="mt-4 pt-4 border-t border-border/60 text-xs space-y-1.5 bg-zinc-50/50 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{t("cart.subtotal")}</span>
                    <span>{(order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.qty, 0)).toLocaleString()} KGS</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>{t("cart.couponDiscount", { label: order.couponCode || "" })}</span>
                      <span>-{Number(order.discountAmount).toLocaleString()} KGS</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{t("cart.shippingFee")}</span>
                    <span>
                      {(order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.qty, 0) > 100000)
                        ? t("cart.free")
                        : "2,500 KGS"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-border text-sm">
                    <span className="font-bold text-secondary">{t("cart.totalAmount")}</span>
                    <span className="font-black text-primary">{order.totalAmount.toLocaleString()} KGS</span>
                  </div>
                </div>

                {/* Admin Note */}
                {order.adminNote && (
                  <div className="mt-3 p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl text-xs text-amber-800">
                    <span className="font-bold">{t("orders.note")} </span>
                    {order.adminNote}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
