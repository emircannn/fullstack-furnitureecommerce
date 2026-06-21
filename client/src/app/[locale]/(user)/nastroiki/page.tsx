"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Settings, Shield, User as UserIcon, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

type ProfileSettingsData = {
  firstName: string;
  lastName: string;
  phone?: string;
};

export default function SettingsPage() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user) as any;
  const setUser = useAuthStore((state) => state.setUser);

  const profileSettingsSchema = React.useMemo(() => {
    return z.object({
      firstName: z.string().min(2, t("profile.validationFirstName")),
      lastName: z.string().min(2, t("profile.validationLastName")),
      phone: z.string().optional(),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileSettingsData) => {
    if (!user) return;
    
    try {
      const response = await apiClient.patch(`/users/${user.id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
      });

      const updatedUser = response.data?.data;
      if (updatedUser) {
        setUser(updatedUser);
        toast.success(t("profile.toastUpdateSuccess"), {
          description: t("profile.toastUpdateSuccessDesc"),
        });
      }
    } catch (err: any) {
      toast.error(t("common.error"), {
        description: err?.response?.data?.message || t("common.error"),
      });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("profile.settingsTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("profile.settingsSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Details Card */}
        <Card className="rounded-3xl border border-border shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-border p-6 bg-gray-50/50">
            <CardTitle className="text-lg font-black text-secondary flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" /> {t("profile.updateInfo")}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">{t("profile.firstName")}</label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={`block w-full px-4 py-3 border ${
                      errors.firstName ? "border-rose-500" : "border-border"
                    } rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">{t("profile.lastName")}</label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={`block w-full px-4 py-3 border ${
                      errors.lastName ? "border-rose-500" : "border-border"
                    } rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">{t("profile.phone")}</label>
                <input
                  type="text"
                  {...register("phone")}
                  className="block w-full px-4 py-3 border border-border rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="+996 555 123 456"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 rounded-2xl bg-primary hover:bg-primary-dark text-white py-6 font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {isSubmitting ? t("profile.saving") : t("profile.saveSettings")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security / Password Info Card */}
        <Card className="rounded-3xl border border-border shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-border p-6 bg-gray-50/50">
            <CardTitle className="text-lg font-black text-secondary flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> {t("profile.securitySettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="text-xs text-muted-foreground">{t("profile.securityDesc")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Talep Alındı", { description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." })}
              className="rounded-2xl border-border font-bold text-xs hover:bg-zinc-50 cursor-pointer"
            >
              {t("profile.sendResetEmail")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
