"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { MapPin, Phone, Mail, Clock, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useSettings } from "@/hooks/use-api";

const contactSchema = z.object({
  name: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().optional(),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const content: Record<string, any> = {
  tr: {
    title: "İletişim",
    subtitle: "Bizimle İletişime Geçin",
    desc: "Sorularınız, iş ortaklığı talepleriniz veya önerileriniz için form doldurabilir ya da doğrudan iletişim kanallarımızdan bize ulaşabilirsiniz.",
    addressTitle: "Adresimiz",
    addressText: "Bishkek, Kırgızistan (Belenay Mobilya Showroom)",
    phoneTitle: "Telefon",
    emailTitle: "E-posta",
    hoursTitle: "Çalışma Saatleri",
    hoursText: "Hafta İçi: 09:00 - 19:00 / Pazar: 10:00 - 17:00",
    formName: "Ad Soyad",
    formEmail: "E-posta Adresi",
    formPhone: "Telefon Numarası",
    formMessage: "Mesajınız",
    formSubmit: "Gönder",
    successMsg: "Mesajınız iletildi",
    successDesc: "En kısa sürede tarafınıza dönüş yapılacaktır.",
  },
  ru: {
    title: "Контакты",
    subtitle: "Свяжитесь с нами",
    desc: "Для вопросов, предложений или партнерства заполните форму или свяжитесь напрямую с нами через каналы коммуникации.",
    addressTitle: "Наш адрес",
    addressText: "Бишкек, Кыргызстан (Шоурум Belenay Mobilya)",
    phoneTitle: "Телефон",
    emailTitle: "Эл. почта",
    hoursTitle: "Рабочие часы",
    hoursText: "Будни: 09:00 - 19:00 / Воскресенье: 10:00 - 17:00",
    formName: "Имя Фамилия",
    formEmail: "Адрес эл. почты",
    formPhone: "Номер телефона",
    formMessage: "Ваше сообщение",
    formSubmit: "Отправить",
    successMsg: "Сообщение отправлено",
    successDesc: "Мы свяжемся с вами в ближайшее время.",
  },
  ky: {
    title: "Байланыш",
    subtitle: "Биз менен байланышыңыз",
    desc: "Суроолоруңуз, сунуштарыңыз же өнөктөштүк боюнча форманы толтуруңуз же түз байланыш каналдарыбыз аркылуу байланышыңыз.",
    addressTitle: "Биздин дарек",
    addressText: "Бишкек, Кыргызстан (Belenay Mobilya көргөзмө залы)",
    phoneTitle: "Телефон",
    emailTitle: "Электрондук почта",
    hoursTitle: "Жумуш убактысы",
    hoursText: "Иш күндөрү: 09:00 - 19:00 / Жекшемби: 10:00 - 17:00",
    formName: "Аты-жөнү",
    formEmail: "Электрондук дарек",
    formPhone: "Телефон номери",
    formMessage: "Сиздин билдирүүңүз",
    formSubmit: "Жөнөтүү",
    successMsg: "Билдирүүңүз жөнөтүлдү",
    successDesc: "Биз сиз менен мүмкүн болушунча тезирээк байланышабыз.",
  }
};

export default function ContactPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  
  const t = content[locale] || content.tr;

  const { data: settings = [] } = useSettings();
  const getSetting = (key: string, fallback: string) => {
    const found = settings.find((s: any) => s.key === key);
    return found ? found.value : fallback;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await apiClient.post("/contact", data);
      toast.success(t.successMsg, {
        description: t.successDesc,
      });
      reset();
    } catch (err: any) {
      toast.error("Hata", {
        description: err?.response?.data?.message || "Mesajınız gönderilirken bir hata oluştu.",
      });
    }
  };

  return (
    <div className="py-16 bg-gray-50 font-sans">
      <div className="container-custom">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold text-sm tracking-wider uppercase block"
          >
            {t.title}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-secondary"
          >
            {t.subtitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm leading-relaxed"
          >
            {t.desc}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Info cards */}
          <div className="space-y-6">
            {/* Address */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-3xl border border-border flex gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-secondary">{t.addressTitle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getSetting("site_address", t.addressText)}
                </p>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border border-border flex gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-secondary">{t.phoneTitle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                  {getSetting("site_phone", "+996 555 180 581")}
                </p>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-border flex gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-secondary">{t.emailTitle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  {getSetting("site_email", "info@belenaymobilya.com")}
                </p>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl border border-border flex gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-secondary">{t.hoursTitle}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.hoursText}</p>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-sm"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                    {t.formName}
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`block w-full px-4 py-3 border ${
                      errors.name ? "border-rose-500" : "border-border"
                    } rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                    placeholder="Ahmet Yılmaz"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                    {t.formEmail}
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`block w-full px-4 py-3 border ${
                      errors.email ? "border-rose-500" : "border-border"
                    } rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
                    placeholder="ahmet@ornek.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs font-semibold text-rose-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                  {t.formPhone}
                </label>
                <input
                  type="text"
                  {...register("phone")}
                  className="block w-full px-4 py-3 border border-border rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="+996 555 123 456"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                  {t.formMessage}
                </label>
                <textarea
                  rows={5}
                  {...register("message")}
                  className={`block w-full px-4 py-3 border ${
                    errors.message ? "border-rose-500" : "border-border"
                  } rounded-2xl bg-zinc-50 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none`}
                  placeholder="Mesajınızı giriniz..."
                />
                {errors.message && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">{errors.message.message}</p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 rounded-2xl bg-primary hover:bg-primary-dark text-white py-6 font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {isSubmitting ? "Gönderiliyor..." : t.formSubmit}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
