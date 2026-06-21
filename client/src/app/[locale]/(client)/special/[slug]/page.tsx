"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Clock, Percent, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

// Mock Campaign Data
const mockCampaigns: Record<string, any> = {
  "nevruz-ozel-firsatlari": {
    title: {
      tr: "Nevruz Özel Fırsatları",
      ru: "Специальные предложения на Новруз",
      ky: "Нооруз өзгөчө арзандатуулары"
    },
    subtitle: {
      tr: "Baharın gelişiyle yaşam alanlarınızı yenileyin! Tüm oturma grupları ve yemek masalarında %25'e varan indirimler.",
      ru: "Обновите свои жилые помещения с приходом весны! Скидки до 25% на все диваны и обеденные столы.",
      ky: "Жаздын келиши менен жашоо мейкиндигиңизди жаңылаңыз! Бардык дивандар жана тамактануучу столдордо 25% чейин арзандатуу."
    },
    banner: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    products: [
      {
        id: "p1",
        slug: "milano-luxury-oturma-grubu",
        categorySlug: "oturma-odasi",
        name: {
          tr: "Milano Luxury Oturma Grubu",
          ru: "Гостиный Гарнитур Milano Luxury",
          ky: "Milano Luxury Конок Бөлмө Эмереги"
        },
        price: 145000,
        discountPrice: 108750, // 25% off
        images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"],
        averageRating: 4.8,
        reviewCount: 18,
        stockQty: 5
      },
      {
        id: "p2",
        slug: "roma-masif-yemek-masasi",
        categorySlug: "yemek-odasi",
        name: {
          tr: "Roma Masif Yemek Masası",
          ru: "Обеденный Стол из Массива Roma",
          ky: "Roma Массивдүү Тамактануучу Столу"
        },
        price: 58000,
        discountPrice: 43500, // 25% off
        images: ["https://images.unsplash.com/photo-1617806118233-18e1c0945594?q=80&w=800&auto=format&fit=crop"],
        averageRating: 4.6,
        reviewCount: 9,
        stockQty: 8
      }
    ]
  }
};

export default function SpecialCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const slug = params?.slug as string;
  const segments = pathname.split("/");
  const currentLocale = segments[1] || "tr";

  const campaign = mockCampaigns[slug] || mockCampaigns["nevruz-ozel-firsatlari"];
  
  const title = campaign.title[currentLocale] || campaign.title.tr;
  const subtitle = campaign.subtitle[currentLocale] || campaign.subtitle.tr;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(campaign.endDate) - +new Date();
      let remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        remaining = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return remaining;
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [campaign.endDate]);

  return (
    <div className="py-16 bg-gray-50 font-sans min-h-screen">
      <div className="container-custom">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden h-[450px] mb-12 shadow-lg border border-border">
          <Image
            src={campaign.banner}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark/95 via-secondary/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center max-w-2xl text-white px-8 sm:px-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white uppercase self-start animate-bounce">
              <Percent className="w-4 h-4" /> Kampanya Rüzgarı
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-300 leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>
        </div>

        {/* Countdown Timer Block */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 max-w-3xl mx-auto -mt-24 relative z-10 mb-16 text-center space-y-6">
          <h3 className="font-bold text-xs uppercase text-zinc-400 tracking-widest flex items-center justify-center gap-2">
            <Clock className="w-4.5 h-4.5 text-primary" /> Kampanyanın Bitmesine Kalan Süre
          </h3>
          
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {[
              { label: "Gün", value: timeLeft.days },
              { label: "Saat", value: timeLeft.hours },
              { label: "Dakika", value: timeLeft.minutes },
              { label: "Saniye", value: timeLeft.seconds }
            ].map((unit, idx) => (
              <div key={idx} className="bg-zinc-50 p-4 rounded-2xl border border-border">
                <span className="text-2xl sm:text-3xl font-black text-secondary block">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Products */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-secondary">
              Fırsat Ürünleri
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Özel indirim fiyatlarıyla stoklarla sınırlı kampanya koleksiyonu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
            {campaign.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
