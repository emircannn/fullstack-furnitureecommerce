"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { login as loginApi } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  const { setUser, setAccessToken, setLoading, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const response = await loginApi({ email, password });

      if (response.user.role !== "admin") {
        toast.error("Bu alana erişim izniniz yok.");
        setLoading(false);
        return;
      }

      // Adapt to BaseUser type
      const baseUser: any = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.name.split(" ")[0] || response.user.name,
        lastName: response.user.name.split(" ").slice(1).join(" ") || "",
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(baseUser);
      setAccessToken(response.accessToken);

      toast.success("Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...");
      const adminPath = locale === "tr" ? "/admin" : `/${locale}/admin`;
      router.push(adminPath);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "E-posta veya şifre hatalı.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <div className="mb-1">
                <Image
                  src="/assets/logo.svg"
                  alt="Belenay Mobilya"
                  width={140}
                  height={36}
                  className="h-8 w-auto brightness-0 invert mx-auto"
                />
              </div>
              <p className="text-zinc-400 text-sm mt-2">Yönetim Paneli</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Giriş Yap</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Yönetim paneline erişmek için kimlik bilgilerinizi girin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@belenay.com"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-primary/60 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-primary/60 transition-all duration-200"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-primary to-orange-400 hover:from-primary/90 hover:to-orange-400/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
            <ShieldAlert className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-[11px] text-zinc-500">
              Bu alan yalnızca yetkili yöneticiler içindir. Tüm giriş denemeleri
              kaydedilmektedir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          © {new Date().getFullYear()} Belenay Mobilya · Tüm hakları saklıdır
        </p>
      </motion.div>
    </div>
  );
}
