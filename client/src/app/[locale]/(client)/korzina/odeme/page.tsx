"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CreditCard, QrCode, FileText, CheckCircle, ArrowLeft, Send, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCartStore } from "@/store/useCartStore";
import { useCreateOrder, useSettings, useValidateCoupon } from "@/hooks/use-api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function CheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();

  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path}`;
  };

  // Auth
  const user = useAuthStore((state) => state.user) as any;

  // Zustand
  const {
    items,
    getTotalPrice,
    clearCart,
    appliedCoupon,
    discountAmount,
    couponLabel,
    applyCoupon,
    removeCoupon,
    syncCartItems,
  } = useCartStore();

  // API Mutation
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();

  // Settings Query
  const { data: settings = [] } = useSettings();
  const getSetting = (key: string, fallback: string) => {
    const found = settings.find((s: any) => s.key === key);
    return found ? found.value : fallback;
  };

  // Mounted
  const [mounted, setMounted] = React.useState(false);

  // Form State
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("Bishkek");
  const [address, setAddress] = React.useState("");
  const [addressLink, setAddressLink] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"bank" | "qr">("qr");
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [couponCodeInput, setCouponCodeInput] = React.useState(appliedCoupon || "");

  const minFreeShippingLimit = React.useMemo(() => {
    const found = settings.find((s: any) => s.key === "min_free_shipping_limit");
    return found?.value ? parseFloat(found.value) : 100000;
  }, [settings]);

  const subtotal = getTotalPrice();
  const originalSubtotal = items.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity, 0);
  const productDiscount = items.reduce((sum, item) => sum + ((item.originalPrice ?? item.price) - item.price) * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal > minFreeShippingLimit ? 0 : 2500;
  const total = subtotal - discountAmount + shipping;

  const formatPhone = (val: string) => {
    let clean = val.replace(/\D/g, "");
    if (clean.startsWith("996")) {
      clean = clean.slice(3);
    } else if (clean.startsWith("0")) {
      clean = clean.slice(1);
    }
    clean = clean.slice(0, 9);
    let result = "+996";
    if (clean.length > 0) {
      result += " " + clean.substring(0, 3);
    }
    if (clean.length > 3) {
      result += " " + clean.substring(3, 6);
    }
    if (clean.length > 6) {
      result += " " + clean.substring(6, 9);
    }
    return result;
  };

  // Sync cart items on mount and check coupon
  React.useEffect(() => {
    setMounted(true);
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

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    validateCoupon.mutate(
      { code: couponCodeInput, orderTotal: subtotal },
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

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    removeCoupon();
    setCouponCodeInput("");
    toast.info(t("cart.toastCouponRemoved"));
  };

  // Block accessing checkout page with empty cart
  React.useEffect(() => {
    if (mounted && items.length === 0 && !isSuccess) {
      toast.error(t("cart.empty"));
      router.replace(localizedPath("/korzina"));
    }
  }, [mounted, items.length, isSuccess, router, currentLocale]);

  // Pre-fill name and phone if user is logged in
  React.useEffect(() => {
    const name = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "";
    if (name && !fullName) {
      setFullName(name);
    }
    if (user?.phone && !phone) {
      setPhone(formatPhone(user.phone));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      toast.success(t("checkout.toastReceiptAdded"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("checkout.toastLoginRequired"));
      router.push(localizedPath("/vhod"));
      return;
    }

    if (!fullName || !phone || !address) {
      toast.error(t("checkout.toastFillDetails"));
      return;
    }

    if (phone.length < 16) {
      toast.error(t("checkout.toastInvalidPhone"));
      return;
    }

    if (!receiptFile) {
      toast.error(t("checkout.toastUploadReceipt"));
      return;
    }

    // Build FormData for multipart upload
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("address", `${city}, ${address}`);
    if (addressLink) {
      formData.append("addressLink", addressLink);
    }
    formData.append("phone", phone);
    formData.append("totalAmount", total.toString());
    formData.append("receipt", receiptFile);
    if (appliedCoupon) {
      formData.append("couponCode", appliedCoupon);
    }

    // Serialize cart items
    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    }));
    formData.append("items", JSON.stringify(orderItems));

    createOrder.mutate(formData, {
      onSuccess: () => {
        setIsSuccess(true);
        clearCart();
        toast.success(t("checkout.toastOrderSuccess"));
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || t("common.error");
        toast.error(message);
      },
    });
  };

  if (!mounted) {
    return (
      <div className="py-24 bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="py-24 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <Card className="p-8 md:p-10 rounded-3xl border border-border bg-white flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-secondary mb-4">{t("checkout.orderSuccess")}</h1>
            <p className="text-muted-foreground text-sm mb-8">
              {t("checkout.orderSuccessDesc")}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Link href={localizedPath("/moi-zakazy")} className="w-full">
                <Button className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-white py-6 font-semibold">
                  {t("checkout.viewOrders")}
                </Button>
              </Link>
              <Link href={localizedPath("/")} className="w-full">
                <Button variant="outline" className="w-full rounded-full py-6 font-semibold border-border">
                  {t("checkout.backToHome")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container-custom">
        <div className="mb-12">
          <Link href={localizedPath("/korzina")} className="flex items-center gap-2 text-muted-foreground hover:text-secondary font-semibold text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("checkout.backToCart")}
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-secondary">
            {t("checkout.title")}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <Card className="p-6 md:p-8 rounded-3xl border border-border bg-white space-y-6">
              <h3 className="font-bold text-lg text-secondary pb-3 border-b border-border">{t("checkout.deliveryAddress")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("checkout.fullName")}</label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("checkout.fullNamePlaceholder")}
                    className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("checkout.phone")}</label>
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder={t("checkout.phonePlaceholder")}
                    className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("checkout.city")}</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium text-secondary focus:border-primary focus:ring-primary outline-none h-[42px]"
                  >
                    <option value="Bishkek">{t("checkout.cityBishkek")}</option>
                    <option value="Osh" disabled>{t("checkout.cityOshDisabled")}</option>
                    <option value="Jalal-Abad" disabled>{t("checkout.cityJalalAbadDisabled")}</option>
                    <option value="Karakol" disabled>{t("checkout.cityKarakolDisabled")}</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("checkout.detailedAddress")}</label>
                  <Input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("checkout.detailedAddressPlaceholder")}
                    className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Address Link Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("checkout.addressLink")}</label>
                <Input
                  value={addressLink}
                  onChange={(e) => setAddressLink(e.target.value)}
                  placeholder={t("checkout.addressLinkPlaceholder")}
                  className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                />
              </div>
            </Card>

            {/* Payment Method Selector */}
            <Card className="p-6 md:p-8 rounded-3xl border border-border bg-white space-y-6">
              <h3 className="font-bold text-lg text-secondary pb-3 border-b border-border">{t("checkout.paymentMethod")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod("qr")}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:bg-gray-50/50",
                    paymentMethod === "qr" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-secondary">{t("checkout.qrPayment")}</h4>
                    <p className="text-xs text-muted-foreground">{t("checkout.qrPaymentDesc")}</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod("bank")}
                  className={cn(
                    "p-6 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all hover:bg-gray-50/50",
                    paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-secondary">{t("checkout.bankPayment")}</h4>
                    <p className="text-xs text-muted-foreground">{t("checkout.bankPaymentDesc")}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Container */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-border space-y-4">
                {paymentMethod === "qr" ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-40 h-40 bg-white border border-border rounded-2xl flex flex-col items-center justify-center relative p-2 shrink-0">
                      {getSetting("payment_qr_code", "") ? (
                        <Image
                          src={getSetting("payment_qr_code", "")}
                          alt="QR Code"
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <QrCode className="w-full h-full text-secondary" />
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="font-bold text-secondary">{t("checkout.easyPaymentQr")}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("checkout.easyPaymentQrDesc")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-bold text-secondary">{t("checkout.bankDetails")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-border">
                        <p className="text-muted-foreground mb-1">{t("checkout.bankName")}</p>
                        <p className="font-bold text-secondary">{getSetting("bank_transfer_name", "Demir Bank Kyrgyzstan")}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-border">
                        <p className="text-muted-foreground mb-1">{t("checkout.accountHolder")}</p>
                        <p className="font-bold text-secondary">{getSetting("bank_transfer_holder", "Belenay Mobilya Ltd.")}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-border md:col-span-2">
                        <p className="text-muted-foreground mb-1">{t("checkout.accountNumber")}</p>
                        <p className="font-bold text-secondary tracking-widest text-sm">{getSetting("bank_transfer_iban", "KG12345678901234567890")}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-secondary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> {t("checkout.uploadReceipt")}
                </h4>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 hover:bg-gray-50/50 cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {receiptPreview ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted">
                        <Image src={receiptPreview} alt="Receipt preview" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary">{receiptFile?.name}</p>
                        <p className="text-xs text-muted-foreground">{t("checkout.uploadPlaceholder")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Send className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-bold text-secondary">{t("checkout.uploadPlaceholder")}</p>
                      <p className="text-xs text-muted-foreground">{t("checkout.uploadFormats")}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Summary */}
          <div className="space-y-6">
            {/* Coupon Card */}
            <Card className="p-6 rounded-3xl border border-border bg-white">
              <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" /> {t("cart.coupon")}
              </h3>
              {appliedCoupon ? (
                <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                  <span className="font-bold">{t("cart.couponApplied", { code: appliedCoupon })}</span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-emerald-900 hover:underline font-semibold">{t("cart.remove")}</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={t("cart.couponPlaceholder")}
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="rounded-xl border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  <Button type="button" onClick={handleApplyCoupon} className="rounded-xl bg-secondary hover:bg-primary text-white">{t("cart.apply")}</Button>
                </div>
              )}
            </Card>

            <Card className="p-6 rounded-3xl border border-border bg-white space-y-6">
              <h3 className="font-bold text-lg text-secondary pb-3 border-b border-border">{t("checkout.yourOrder")}</h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ""}`} className="flex gap-3 text-sm">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-secondary truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-semibold">{item.quantity} x {item.price.toLocaleString()} KGS</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.subtotalOriginal")}</span>
                  <span className="font-bold text-secondary">{originalSubtotal.toLocaleString()} KGS</span>
                </div>
                {productDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>{t("checkout.productDiscount")}</span>
                    <span className="font-bold">-{productDiscount.toLocaleString()} KGS</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground pt-1 border-t border-zinc-100">
                  <span>{t("checkout.subtotal")}</span>
                  <span className="font-bold text-secondary">{subtotal.toLocaleString()} KGS</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{t("cart.couponDiscount", { label: couponLabel })}</span>
                    <span className="font-bold">-{discountAmount.toLocaleString()} KGS</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.shippingFee")}</span>
                  <span className="font-bold text-secondary">
                    {shipping === 0 ? t("cart.free") : `${shipping.toLocaleString()} KGS`}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold text-secondary">{t("checkout.totalPayment")}</span>
                  <span className="font-black text-xl text-primary">{total.toLocaleString()} KGS</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createOrder.isPending}
                className="w-full rounded-full bg-primary hover:bg-primary-dark text-white py-6 font-semibold flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20"
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("checkout.submittingOrder")}
                  </>
                ) : (
                  t("checkout.submitOrder")
                )}
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
