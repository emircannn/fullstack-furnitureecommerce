"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShieldCheck, Users, Flame, Star, Award, Heart } from "lucide-react";

const content: Record<string, any> = {
  tr: {
    title: "Hakkımızda",
    subtitle: "Belenay Mobilya: Konforun, Kalitenin ve Estetiğin Buluştuğu Nokta",
    storyTitle: "Hikayemiz",
    storyText1: "Belenay Mobilya, kurulduğu günden bu yana yaşam alanlarınıza değer katmak, evlerinizi daha sıcak, konforlu ve estetik kılmak amacıyla çalışmaktadır. Klasik mobilya sanatının zarafetini modern üretim teknolojileriyle harmanlayarak, her biri bir sanat eseri titizliğinde tasarlanmış mobilyalar üretiyoruz.",
    storyText2: "Kırgızistan genelinde ve uluslararası pazarda edindiğimiz deneyimle, müşteri memnuniyetini en üst düzeyde tutmayı ilke ediniyoruz. Doğal ahşabın dayanıklılığını, el işçiliğinin benzersizliğini ve modern tasarımın sadeliğini tasarımlarımıza yansıtıyoruz.",
    missionTitle: "Misyonumuz",
    missionText: "Müşterilerimizin değişen yaşam alışkanlıklarına ve estetik arayışlarına uygun, çevre dostu, sürdürülebilir ve yüksek kaliteli mobilyalar tasarlayıp üreterek yaşam kalitelerini artırmak.",
    visionTitle: "Vizyonumuz",
    visionText: "Tasarım kalitemiz, yenilikçi yaklaşımımız ve premium ürün portföyümüz ile mobilya sektöründe küresel ölçekte tanınan, güven duyulan ve tercih edilen bir marka olmak.",
    valuesTitle: "Değerlerimiz",
    values: [
      { icon: ShieldCheck, title: "Maksimum Güvenlik & Kalite", desc: "Tüm hammaddelerimiz Avrupa kalite standartlarına uygun ve sertifikalıdır." },
      { icon: Users, title: "Müşteri Odaklılık", desc: "Müşterilerimizin taleplerine en hızlı ve en doğru çözümleri sunuyoruz." },
      { icon: Flame, title: "Tasarım Tutkusu", desc: "Her detayı özenle tasarlıyor, evlerinize ilham verici dokunuşlar katıyoruz." },
      { icon: Award, title: "5 Yıl Garanti", desc: "Ürünlerimizin arkasındayız. Her ürüne 5 yıla varan üretici garantisi sunuyoruz." },
    ]
  },
  ru: {
    title: "О нас",
    subtitle: "Belenay Mobilya: Где встречаются комфорт, качество и эстетика",
    storyTitle: "Наша история",
    storyText1: "С момента своего основания Belenay Mobilya стремится ценить ваши жилые пространства, делая ваши дома теплее, комфортнее и эстетичнее. Сочетая элегантность классического мебельного искусства с современными технологиями производства, мы производим мебель, спроектированную с тщательностью произведения искусства.",
    storyText2: "Имея опыт работы в Кыргызстане и на международном рынке, мы стремимся поддерживать удовлетворенность клиентов на самом высоком уровне. Мы отражаем долговечность натурального дерева, уникальность ручной работы и простоту современного дизайна в наших изделиях.",
    missionTitle: "Наша миссия",
    missionText: "Повышать качество жизни наших клиентов путем проектирования и производства экологически чистой, экологичной и высококачественной мебели, соответствующей их меняющимся жизненным привычкам и эстетическим поискам.",
    visionTitle: "Наше видение",
    visionText: "Быть всемирно признанным, надежным и предпочитаемым брендом в мебельной индустрии благодаря качеству дизайна, инновационному подходу и портфолио продуктов премиум-класса.",
    valuesTitle: "Наши ценности",
    values: [
      { icon: ShieldCheck, title: "Максимальная безопасность и качество", desc: "Все наше сырье сертифицировано и соответствует европейским стандартам качества." },
      { icon: Users, title: "Ориентированность на клиента", desc: "Мы предлагаем самые быстрые и точные решения для требований наших клиентов." },
      { icon: Flame, title: "Страсть к дизайну", desc: "Мы тщательно разрабатываем каждую деталь, добавляя вдохновляющие штрихи в ваши дома." },
      { icon: Award, title: "5 лет гарантии", desc: "Мы стоим за нашими продуктами. Мы предлагаем до 5 лет гарантии производителя на каждый продукт." },
    ]
  },
  ky: {
    title: "Биз жөнүндө",
    subtitle: "Belenay Mobilya: Ыңгайлуулук, сапат жана эстетиканын айкалышы",
    storyTitle: "Биздин тарыхыбыз",
    storyText1: "Belenay Mobilya негизделген күндөн тартып жашоо мейкиндигиңизге баа кошуу, үйлөрүңүздү жылуу, ыңгайлуу жана эстетикалык кылуу максатында иштеп келет. Классикалык эмерек өнөрүнүн көркөмдүгүн заманбап өндүрүш технологиялары менен айкалыштырып, ар бири көркөм чыгарма сыяктуу кылдаттык менен иштелип чыккан эмеректерди чыгарабыз.",
    storyText2: "Кыргызстан боюнча жана эл аралык рынокто топтогон тажрыйбабыз менен кардарлардын канааттануусун жогорку деңгээлде кармоону максат кылабыз. Табигый жыгачтын бышыктыгын, кол өнөрчүлүгүнүн өзгөчөлүгүн жана заманбап дизайндын жөнөкөйлүгүн эмеректерибизге чагылдырабыз.",
    missionTitle: "Биздин миссиябыз",
    missionText: "Кардарларыбыздын өзгөрүп жаткан жашоо адаттарына жана эстетикалык муктаждыктарына ылайыктуу, экологиялык жактан таза, туруктуу жана жогорку сапаттагы эмеректерди долбоорлоо жана чыгаруу менен алардын жашоо сапатын жогорулатуу.",
    visionTitle: "Биздин көз карашыбыз",
    visionText: "Биздин дизайндын сапаты, инновациялык мамилебиз жана премиум продукт портфелибиз менен эмерек тармагында дүйнөлүк деңгээлде таанылган, ишенимдүү жана артыкчылык берилген бренд болуу.",
    valuesTitle: "Биздин баалуулуктарыбыз",
    values: [
      { icon: ShieldCheck, title: "Максималдуу коопсуздук жана сапат", desc: "Биздин бардык чийки заттарыбыз европалык сапат стандарттарына ылайыктуу жана сертификатталган." },
      { icon: Users, title: "Кардарга багытталгандык", desc: "Биз кардарларыбыздын суроо-талаптарына эң тез жана эң туура чечимдерди сунуштайбыз." },
      { icon: Flame, title: "Дизайнга болгон кумарлануу", desc: "Биз ар бир деталды кылдаттык менен иштеп чыгабыз, үйүңүзгө дем берүүчү өзгөчөлүктөрдү кошобуз." },
      { icon: Award, title: "5 жылдык кепилдик", desc: "Биз өзүбүздүн продукцияларыбызга ишенебиз. Ар бир продуктуга 5 жылга чейин өндүрүүчүнүн кепилдигин беребиз." },
    ]
  }
};

export default function AboutPage() {
  const params = useParams();
  const currentLocale = (params?.locale as string) || "tr";
  
  const t = content[currentLocale] || content.tr;

  return (
    <div className="py-16 bg-gray-50 font-sans">
      <div className="container-custom">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden h-[400px] mb-16 shadow-lg border border-border">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
            alt="Belenay Mobilya Luxury Interior"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent" />
          <div className="absolute inset-y-0 left-0 pl-8 md:pl-16 flex flex-col justify-center max-w-2xl text-white">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black mb-4 leading-tight"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-medium text-orange-200"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-primary font-bold text-sm tracking-wider uppercase">{t.storyTitle}</span>
            <h2 className="text-3xl md:text-4xl font-black text-secondary leading-tight">
              Belenay Mobilya
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {t.storyText1}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {t.storyText2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md border border-border"
          >
            <Image
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop"
              alt="Story Image"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Mission & Vision cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-secondary mb-4">{t.missionTitle}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.missionText}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-secondary mb-4">{t.visionTitle}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t.visionText}</p>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold text-sm tracking-wider uppercase block mb-3">
            {t.valuesTitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-secondary">
            Bizi Biz Yapan İlkelerimiz
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.values.map((value: any, idx: number) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-secondary">{value.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
