"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/useAuthStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useUserOrders } from "@/hooks/use-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user) as any;
  const { items } = useFavoriteStore();
  const { data: orders = [] } = useUserOrders(user?.id || null);

  const stats = [
    { label: t("profile.statsTotalOrders"), value: orders.length.toString() },
    { label: t("profile.statsFavoriteProducts"), value: items.length.toString() },
    { label: t("profile.statsQuestionsAsked"), value: "0" },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary">{t("profile.title")}</h1>
        <p className="text-xs text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="rounded-3xl border border-border shadow-sm p-6 bg-white">
              <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">{stat.label}</span>
              <span className="text-2xl font-black text-secondary">{stat.value}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Profile Details Card */}
      <Card className="rounded-3xl border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-border p-6 bg-gray-50/50">
          <CardTitle className="text-lg font-black text-secondary flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" /> {t("profile.personalInfo")}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ad Soyad */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase block">{t("profile.fullName")}</span>
              <span className="text-sm font-semibold text-secondary block">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase block">{t("profile.email")}</span>
              <span className="text-sm font-semibold text-secondary flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-zinc-400" /> {user?.email}
              </span>
            </div>

            {/* Telefon */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase block">{t("profile.phone")}</span>
              <span className="text-sm font-semibold text-secondary flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-zinc-400" /> {user?.phone || t("profile.notSpecified")}
              </span>
            </div>

            {/* Üyelik Tarihi */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase block">{t("profile.membershipStatus")}</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full w-fit mt-1">
                <ShieldCheck className="w-4 h-4" /> {t("profile.activeAccount")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
