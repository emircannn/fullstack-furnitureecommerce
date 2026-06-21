"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { register as registerApi } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    phone: z.string().optional(),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    confirmPassword: z.string().min(8, "Şifre tekrarı en az 8 karakter olmalıdır"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler uyuşmuyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "tr";
  
  const redirectUrl = searchParams.get("redirect") || `/${locale}`;

  const { setUser, setAccessToken, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // API expects name as single string, so join firstName and lastName
      const name = `${data.firstName} ${data.lastName}`;
      const response = await registerApi({
        name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      const baseUser: any = {
        id: response.user.id,
        email: response.user.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "user",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(baseUser);
      setAccessToken(response.accessToken);

      toast.success("Kayıt Başarılı", {
        description: `Belenay Mobilya dünyasına hoş geldiniz, ${name}!`,
      });

      router.push(redirectUrl);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Kayıt olurken bir hata oluştu";
      toast.error("Kayıt Başarısız", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl relative z-10"
      >
        <div className="text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <ShieldAlert className="w-10 h-10 text-primary animate-pulse" />
            <span className="text-2xl font-black tracking-wider text-secondary">
              BELENAY<span className="text-primary font-bold">MOBİLYA</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-secondary tracking-tight">
            {t("register")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-semibold">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/giris${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="font-bold text-primary hover:text-primary-dark transition-colors underline"
            >
              {t("login")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name Field */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                {t("firstName")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  {...register("firstName")}
                  className={`block w-full pl-11 pr-4 py-3 border ${
                    errors.firstName ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  placeholder="Ahmet"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                {t("lastName")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  {...register("lastName")}
                  className={`block w-full pl-11 pr-4 py-3 border ${
                    errors.lastName ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  placeholder="Yılmaz"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
              {t("email")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="email"
                {...register("email")}
                className={`block w-full pl-11 pr-4 py-3 border ${
                  errors.email ? "border-rose-500" : "border-border"
                } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                placeholder="ahmet@ornek.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
              {t("phone")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                {...register("phone")}
                className="block w-full pl-11 pr-4 py-3 border border-border rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="+996 555 123 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Field */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`block w-full pl-11 pr-11 py-3 border ${
                    errors.password ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`block w-full pl-11 pr-11 py-3 border ${
                    errors.confirmPassword ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-secondary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary hover:bg-primary-dark text-white py-6 font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              {isLoading ? "Kaydolunuyor..." : t("register")}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
