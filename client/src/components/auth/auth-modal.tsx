"use client";

import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { login as loginApi, register as registerApi, loginWithGoogle, loginWithApple } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

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

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authModalMode, setUser, setAccessToken } = useAuthStore();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const t = useTranslations("auth");

  // Sync mode with store when modal opens
  React.useEffect(() => {
    if (showAuthModal) {
      setMode(authModalMode);
    }
  }, [showAuthModal, authModalMode]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Reset forms on mode change
  React.useEffect(() => {
    resetLoginForm();
    resetRegisterForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode, resetLoginForm, resetRegisterForm]);

  if (!showAuthModal) return null;

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await loginApi(data);
      
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
      
      toast.success(t("loginSuccess"), {
        description: t("loginSuccessDesc", { name: response.user.name }),
      });
      
      setShowAuthModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t("loginFailedDesc");
      toast.error(t("loginFailed"), {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
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

      toast.success(t("registerSuccess"), {
        description: t("registerSuccessDesc", { name }),
      });

      setShowAuthModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t("registerFailedDesc");
      toast.error(t("registerFailed"), {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      {/* Background close overlay */}
      <div className="absolute inset-0 cursor-default" onClick={() => setShowAuthModal(false)} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 relative z-10 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-secondary transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <Image
              src="/assets/logo.svg"
              alt="Belenay Mobilya"
              width={160}
              height={40}
              className="h-10 w-auto mx-auto"
              priority
            />
          </div>
          <h2 className="text-xl font-black text-secondary tracking-tight">
            {mode === "login" ? t("login") : t("register")}
          </h2>
        </div>

        {/* Toggle Mode Tab */}
        <div className="flex bg-zinc-100 rounded-2xl p-1 relative w-full mb-6 select-none">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
              mode === "login" ? "text-secondary font-black" : "text-zinc-500"
            }`}
          >
            {t("login")}
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
              mode === "register" ? "text-secondary font-black" : "text-zinc-500"
            }`}
          >
            {t("register")}
          </button>
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm transition-all duration-300"
            style={{
              left: mode === "login" ? "4px" : "calc(50% + 2px)",
              width: "calc(50% - 6px)",
            }}
          />
        </div>

        {/* Forms Container */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {mode === "login" ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit(onLogin)}>
              {/* Email Field */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                  {t("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    {...registerLogin("email")}
                    className={`block w-full pl-10 pr-4 py-2.5 border ${
                      loginErrors.email ? "border-rose-500" : "border-zinc-200"
                    } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                    placeholder="isim@ornek.com"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500">{loginErrors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                  {t("password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...registerLogin("password")}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      loginErrors.password ? "border-rose-500" : "border-zinc-200"
                    } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-secondary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500">{loginErrors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white py-5 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-primary/10 transition-all cursor-pointer"
                >
                  {isLoading ? t("loadingLogin") : t("login")}
                  {!isLoading && <ArrowRight className="w-4.5 h-4.5" />}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleRegisterSubmit(onRegister)}>
              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                    {t("firstName")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      {...registerRegister("firstName")}
                      className={`block w-full pl-9 pr-3 py-2.5 border ${
                        registerErrors.firstName ? "border-rose-500" : "border-zinc-200"
                      } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                      placeholder="Ahmet"
                    />
                  </div>
                  {registerErrors.firstName && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{registerErrors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                    {t("lastName")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      {...registerRegister("lastName")}
                      className={`block w-full pl-9 pr-3 py-2.5 border ${
                        registerErrors.lastName ? "border-rose-500" : "border-zinc-200"
                      } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                      placeholder="Yılmaz"
                    />
                  </div>
                  {registerErrors.lastName && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{registerErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                  {t("email")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    {...registerRegister("email")}
                    className={`block w-full pl-9 pr-3 py-2.5 border ${
                      registerErrors.email ? "border-rose-500" : "border-zinc-200"
                    } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                    placeholder="ahmet@ornek.com"
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-500">{registerErrors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                  {t("phone")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    {...registerRegister("phone")}
                    className="block w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm"
                    placeholder="+996 555 123 456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...registerRegister("password")}
                      className={`block w-full pl-9 pr-9 py-2.5 border ${
                        registerErrors.password ? "border-rose-500" : "border-zinc-200"
                      } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-secondary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{registerErrors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerRegister("confirmPassword")}
                      className={`block w-full pl-9 pr-9 py-2.5 border ${
                        registerErrors.confirmPassword ? "border-rose-500" : "border-zinc-200"
                      } rounded-2xl bg-zinc-50 text-secondary placeholder-zinc-400 focus:outline-none focus:border-primary transition-all text-xs sm:text-sm`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-secondary transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{registerErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white py-5 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-primary/10 transition-all cursor-pointer"
                >
                  {isLoading ? t("loadingRegister") : t("register")}
                  {!isLoading && <ArrowRight className="w-4.5 h-4.5" />}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* OAuth Buttons Section */}
        <div className="pt-4 border-t border-zinc-100 space-y-3 mt-4">
          <div className="relative flex py-1 items-center select-none">
            <div className="flex-grow border-t border-zinc-100"></div>
            <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">veya</span>
            <div className="flex-grow border-t border-zinc-100"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-zinc-200 hover:border-zinc-300 rounded-2xl text-xs sm:text-sm font-bold text-secondary bg-white hover:bg-zinc-50 transition-colors cursor-pointer w-full"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google ile Giriş Yap
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
