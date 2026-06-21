"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSliders } from "@/hooks/use-api";

interface Slide {
  id: string;
  image: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonText: Record<string, string>;
  buttonLink: string;
  buttonColor?: string;
  textColor?: string;
}

interface SliderProps {
  slides?: Slide[];
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop",
    title: {
      tr: "Lüks Yaşam Alanları",
      ru: "Роскошные Гостиные",
      ky: "Люкс Жашоо Аянттары"
    },
    subtitle: {
      tr: "Evinize değer katan modern tasarımlar ve İtalyan işçiliği.",
      ru: "Современный дизайн и итальянское мастерство, повышающие ценность вашего дома.",
      ky: "Үйüңүзгө маани кошкон заманбап дизайн жана италиялык чеберчилик."
    },
    buttonText: {
      tr: "Koleksiyonu İncele",
      ru: "Смоtreть Коллекцию",
      ky: "Коллекцияны Көрүү"
    },
    buttonLink: "/special/nevruz-ozel-firsatlari",
    buttonColor: "#e75f0d",
    textColor: "#ffffff"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop",
    title: {
      tr: "Rahat ve Estetik Yatak Odaları",
      ru: "Уютные и Эстетичные Спальни",
      ky: "Ыңгайлуу жана Estetikaлык Уктоочу Бөлмөлөр"
    },
    subtitle: {
      tr: "Günün yorgunluğunu unutturacak konforlu ve şık çözümler.",
      ru: "Комфортные и стильные решения, которые заставят вас забыть об усталости дня.",
      ky: "Күндүн чарчоосун унуттура турган ыңгайлуу жана кооз чечимдер."
    },
    buttonText: {
      tr: "Keşfet",
      ru: "Исследовать",
      ky: "Изилдөө"
    },
    buttonLink: "/kategoriya/yatak-odasi",
    buttonColor: "#191833",
    textColor: "#ffffff"
  }
];

export function Slider({ slides: customSlides }: SliderProps) {
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";
  
  const { data: apiSlides } = useSliders();
  const slides = customSlides || (apiSlides && apiSlides.length > 0 ? apiSlides : defaultSlides);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0); // -1: left, 1: right

  const handleNext = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Autoplay
  React.useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, handleNext]);

  const handlePrev = React.useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
    }
  };

  const activeSlide = slides[currentIndex];
  const activeTitle = activeSlide.title[currentLocale] || activeSlide.title["tr"];
  const activeSubtitle = activeSlide.subtitle[currentLocale] || activeSlide.subtitle["tr"];
  const activeBtnText = activeSlide.buttonText[currentLocale] || activeSlide.buttonText["tr"];

  return (
    <section className="relative h-[calc(100vh-77px)] lg:h-[calc(100vh-135px)] min-h-[500px] w-full overflow-hidden bg-secondary">
      {/* Slayt Görselleri ve İçeriği */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Arka plan görseli */}
            <Image
              src={activeSlide.image}
              alt={activeTitle}
              fill
              priority
              className="object-cover"
            />
            {/* Overlay Karartma */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark/95 via-secondary/60 to-transparent" />
            
            {/* Slayt Metin İçeriği */}
            <div className="container-custom relative z-10 w-full h-full flex items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={contentVariants}
                className="max-w-2xl text-white space-y-6"
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.15]">
                  {activeTitle}
                </h2>
                <p className="text-base md:text-lg text-white/80 font-light max-w-lg leading-relaxed">
                  {activeSubtitle}
                </p>
                <div className="pt-4">
                  <Link href={`/${currentLocale}${activeSlide.buttonLink}`}>
                    <Button
                      style={{ backgroundColor: activeSlide.buttonColor }}
                      className="rounded-full text-white font-bold px-8 py-6 h-auto text-base hover:scale-105 transition-transform group shadow-lg"
                    >
                      {activeBtnText}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gezinme Okları */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-primary text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-primary text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slayt İndikatörleri */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={cn(
              "w-8 h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              index === currentIndex ? "bg-primary w-12" : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}
