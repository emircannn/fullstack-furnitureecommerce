"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { login as loginApi } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "tr";
  
  const redirectUrl = searchParams.get("redirect") || `/${locale}`;

  const { setUser, setAccessToken, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await loginApi(data);
      
      // Adapt AuthUser type to BaseUser type expected by store
      const baseUser: any = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.name.split(" ")[0] || response.user.name,
        lastName: response.user.name.split(" ").slice(1).join(" ") || "",
        role: response.user.role === "admin" ? "admin" : "user",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(baseUser);
      setAccessToken(response.accessToken);
      
      toast.success("Giriş Başarılı", {
        description: `Tekrar hoş geldiniz, ${response.user.name}!`,
      });
      
      // Redirect based on user role and param
      if (response.user.role === "admin") {
        router.push(`/${locale}/admin`);
      } else {
        router.push(redirectUrl);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "E-posta veya şifre hatalı";
      toast.error("Giriş Başarısız", {
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
        className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl relative z-10"
      >
        <div className="text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
            <ShieldAlert className="w-10 h-10 text-primary animate-pulse" />
            <span className="text-2xl font-black tracking-wider text-secondary">
              BELENAY<span className="text-primary font-bold">MOBİLYA</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-secondary tracking-tight">
            {t("login")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-semibold">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/kayit${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="font-bold text-primary hover:text-primary-dark transition-colors underline"
            >
              {t("register")}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className={`block w-full pl-11 pr-4 py-3 border ${
                    errors.email ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  placeholder="isim@ornek.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  {t("password")}
                </label>
                <Link
                  href={`/${locale}/sifremi-unuttum`}
                  className="text-xs font-bold text-zinc-500 hover:text-primary transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-5 w-5" />
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-semibold text-rose-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded accent-primary border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-xs font-semibold text-muted-foreground cursor-pointer select-none"
            >
              {t("rememberMe")}
            </label>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary hover:bg-primary-dark text-white py-6 font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              {isLoading ? "Giriş yapılıyor..." : t("login")}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Social Logins */}
          <div className="space-y-4 pt-4 border-t border-gray-100 font-sans">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                VEYA ŞUNUNLA GİRİŞ YAP
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/google`;
                }}
                className="flex items-center justify-center gap-2 px-4 py-3.5 border border-gray-200 rounded-2xl text-sm font-bold text-secondary hover:bg-zinc-50 transition-colors cursor-pointer w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.51h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.26-2.08 3.57-5.14 3.57-8.75z" fill="#4285F4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.1A11.97 11.97 0 0 0 12 24z" fill="#34A853"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.27 14.29A7.18 7.18 0 0 1 4.9 12c0-.8.13-1.58.37-2.29V6.61H1.24a11.97 11.97 0 0 0 0 10.78l4.03-3.1z" fill="#FBBC05"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.93 11.93 0 0 0 12 0 11.97 11.97 0 0 0 1.24 6.61l4.03 3.1C6.22 6.86 8.87 4.75 12 4.75z" fill="#EA4335"/>
                </svg>
                Google ile Giriş Yap
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
