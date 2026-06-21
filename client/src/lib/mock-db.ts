// ============================================================
// Belenay Mobilya - Demo Mock Database
// client-side veri yönetimi. Veriler localStorage üzerinde saklanır.
// ============================================================

const STORAGE_KEY = "belenay_demo_db_v1";

export interface MockCategory {
  id: string;
  slug: string;
  name_tr: string;
  name_ru: string;
  name_ky: string;
  image: string;
  showInHeader: boolean;
  order: number;
  products?: any[];
}

export interface MockProduct {
  id: string;
  slug: string;
  name_tr: string;
  name_ru: string;
  name_ky: string;
  shortDesc_tr: string;
  shortDesc_ru: string;
  shortDesc_ky: string;
  description_tr: string;
  description_ru: string;
  description_ky: string;
  price: number;
  discountPrice: number | null;
  discountStart?: string | null;
  discountEnd?: string | null;
  isDiscountPermanent?: boolean;
  stockCode: string;
  stockQty: number;
  isPublished: boolean;
  categoryId: string;
  categories?: any[];
  images: Array<{ path: string; isPrimary: boolean; order: number }>;
  averageRating: number;
  reviewCount: number;
}

// ---- SEED DATA ----

const defaultSliders = [
  {
    id: "slide-1",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop",
    title_tr: "Yeni Sezon Koltuk Takımları",
    title_ru: "Диваны Нового Сезона",
    title_ky: "Жаңы Сезон Diвандары",
    subtitle_tr: "Evinize şıklık katan konforlu tasarımlar",
    subtitle_ru: "Комфортный дизайн, добавляющий элегантности вашему дому",
    subtitle_ky: "Үйүңүзгө көрк кошкон ыңгайлуу дизайндар",
    buttonText_tr: "Koleksiyonu İncele",
    buttonText_ru: "Смотреть Коллекцию",
    buttonText_ky: "Коллекцияны Kөрүү",
    buttonLink: "/oturma-odasi",
    buttonColor: "#e75f0d",
    textColor: "#ffffff",
    isActive: true,
  },
  {
    id: "slide-2",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop",
    title_tr: "Huzurlu Uykular İçin Yatak Odaları",
    title_ru: "Спальни для Спокойного Сна",
    title_ky: "Тынч Уйку үчүн Уктоочу Бөлмөлөр",
    subtitle_tr: "Estetik gardıroplar ve ergonomik karyolalar",
    subtitle_ru: "Эстетичные шкафы и эргономичные кровати",
    subtitle_ky: "Кооз шкафтар жана эргономикалык керебеттер",
    buttonText_tr: "Ürünleri Keşfet",
    buttonText_ru: "Исследовать Продукты",
    buttonText_ky: "Өнүмдөрдү İziлдөө",
    buttonLink: "/yatak-odasi",
    buttonColor: "#191833",
    textColor: "#ffffff",
    isActive: true,
  }
];

const defaultCategories: MockCategory[] = [
  {
    id: "cat-oturma",
    slug: "oturma-odasi",
    name_tr: "Oturma Odası",
    name_ru: "Гостиная",
    name_ky: "Конок Бөлмө",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 1,
  },
  {
    id: "cat-yatak",
    slug: "yatak-odasi",
    name_tr: "Yatak Odası",
    name_ru: "Спальня",
    name_ky: "Уктоочу Бөлмө",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 2,
  },
  {
    id: "cat-yemek",
    slug: "yemek-odasi",
    name_tr: "Yemek Odası",
    name_ru: "Столовая",
    name_ky: "Тамактануучу Бөлмө",
    image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 3,
  },
  {
    id: "cat-calisma",
    slug: "calisma-odasi",
    name_tr: "Çalışma Odası",
    name_ru: "Кабинет",
    name_ky: "İш Бөлмөсү",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 4,
  },
  {
    id: "cat-genc",
    slug: "genc-odasi",
    name_tr: "Genç Odası",
    name_ru: "Молодежная Комната",
    name_ky: "Өспүрүм Бөлмөсү",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 5,
  },
  {
    id: "cat-aksesuar",
    slug: "aksesuarlar",
    name_tr: "Aksesuarlar",
    name_ru: "Аксессуары",
    name_ky: "Аксессуарлар",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop",
    showInHeader: true,
    order: 6,
  }
];

const defaultProducts: MockProduct[] = [
  {
    id: "prod-1",
    slug: "belenay-avangard-koltuk-takimi",
    name_tr: "Belenay Avangard Koltuk Takımı",
    name_ru: "Авангардный Диванный Гарнитур Belenay",
    name_ky: "Belenay Авангард Диван Топтому",
    shortDesc_tr: "Lüks ve estetiğin mükemmel birleşimi.",
    shortDesc_ru: "Превосходное сочетание роскоши и эстетики.",
    shortDesc_ky: "Байлыктын жана кооздуктун эң сонун айкалышы.",
    description_tr: "Altın varak detayları ve birinci sınıf nubuk kumaşıyla salonunuza saray havası katacak özel tasarım avangard koltuk takımı.",
    description_ru: "Дизайнерский авангардный диванный гарнитур с золотыми деталями и первоклассной нубуковой тканью придаст вашей гостиной королевскую атмосферу.",
    description_ky: "Алтын жалатылган деталдары жана биринчи класстагы нубук кездемеси менен конок бөлмөңүзгə падышалык маанай тартууlay турган өзгөчө дизайн диван топтому.",
    price: 85000,
    discountPrice: 79000,
    isDiscountPermanent: true,
    stockCode: "BLN-AVN-01",
    stockQty: 5,
    isPublished: true,
    categoryId: "cat-oturma",
    images: [
      { path: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800", isPrimary: true, order: 0 },
      { path: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800", isPrimary: false, order: 1 }
    ],
    averageRating: 5.0,
    reviewCount: 2
  },
  {
    id: "prod-2",
    slug: "loft-kose-koltuk",
    name_tr: "Loft Köşe Koltuk",
    name_ru: "Угловой Диван Loft",
    name_ky: "Loft Бурчтук Diваны",
    shortDesc_tr: "Modern salonlar için fonksiyonel köşe koltuk.",
    shortDesc_ru: "Функциональный угловой диван для современных гостиных.",
    shortDesc_ky: "Заmanбап конок бөлмөлөр үчүн функционалдуу бурчтук диван.",
    description_tr: "Geniş oturma alanı, modüler yapısı ve yatak olabilme özelliğiyle loft köşe koltuk konfor ve şıklığı bir arada sunar.",
    description_ru: "Угловой диван Loft предлагает комфорт и стиль благодаря просторной зоне отдыха, модульной структуре и возможности трансформации в кровать.",
    description_ky: "Кенен отургуч аянты, модулдук түзүлүшү жана kereбетке айлануу өзгөчөлүгү менен Loft бурчтук диваны ыңгайлуулукту жана кооздукту сунуштайт.",
    price: 49000,
    discountPrice: null,
    stockCode: "BLN-LFT-KOS",
    stockQty: 8,
    isPublished: true,
    categoryId: "cat-oturma",
    images: [
      { path: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800", isPrimary: true, order: 0 }
    ],
    averageRating: 4.5,
    reviewCount: 3
  },
  {
    id: "prod-3",
    slug: "mabel-yatak-odasi-takimi",
    name_tr: "Mabel Yatak Odası Takımı",
    name_ru: "Спальный Гарнитур Mabel",
    name_ky: "Mabel Уктоочу Бөлмө Топтому",
    shortDesc_tr: "Sade ve şık çizgilerle yatak odanızda huzur.",
    shortDesc_ru: "Покой в вашей спальне с простыми и элегантными линиями.",
    shortDesc_ky: "Уктоочу бөлмөңүздө жөнөкөй жана назик сызыктар менен тынчтык.",
    description_tr: "Gardırop (sürgülü kapak), bazalı karyola, iki adet komodin ve aynalı şifonyerden oluşan Mabel takımı, yatak odanıza ferahlık getirecek.",
    description_ru: "Гарнитур Mabel, состоящий из шкафа-купе, кровати с подъемным механизмом, двух прикроватных тумбочек и комода с зеркалом, принесет свежесть в вашу спальню.",
    description_ky: "Шкаф-купе, көтөрүлүүчү керебет, эки тумбочка жана күзгүлүү комоддон турган Mabel топтому уктоoчу бөлмөңүзгө кенендик алып кеlet.",
    price: 95000,
    discountPrice: 89000,
    isDiscountPermanent: false,
    discountStart: "2026-06-01",
    discountEnd: "2026-08-31",
    stockCode: "BLN-MBL-YTK",
    stockQty: 3,
    isPublished: true,
    categoryId: "cat-yatak",
    images: [
      { path: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800", isPrimary: true, order: 0 }
    ],
    averageRating: 4.8,
    reviewCount: 4
  },
  {
    id: "prod-4",
    slug: "hazel-ahsap-yemek-masasi",
    name_tr: "Hazel Ahşap Yemek Masası",
    name_ru: "Деревянный Обеденный Стол Hazel",
    name_ky: "Hazel Жыгач Тамактануучу Столу",
    shortDesc_tr: "Doğal ahşap dokusu ve metal ayakların uyumu.",
    shortDesc_ru: "Гармония текстуры натурального дерева и металлических ножек.",
    shortDesc_ky: "Табигый жыгач текстурасы менен metal буттардын шайкештиги.",
    description_tr: "Meşe kaplama dayanıklı üst tabla and elektrostatik toz boyalı sağlam metal ayaklar ile tasarlanmış 6 kişilik lüks yemek masası.",
    description_ru: "Роскошный 6-местный обеденный стол с прочной дубовой столешницей и устойчивыми металлическими ножками с порошковым покрытием.",
    description_ky: "Эмен менен капталган бышык үстөл бети жана порошок менен сырdalган металл буттары бар 6 кишилик люкс тамактануучу стол.",
    price: 24000,
    discountPrice: 19900,
    isDiscountPermanent: true,
    stockCode: "BLN-HZL-YMK",
    stockQty: 15,
    isPublished: true,
    categoryId: "cat-yemek",
    images: [
      { path: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800", isPrimary: true, order: 0 }
    ],
    averageRating: 4.7,
    reviewCount: 6
  },
  {
    id: "prod-5",
    slug: "ergonomik-calisma-masasi",
    name_tr: "Ergonomik Çalışma Masası",
    name_ru: "Эргономичный Письменный Стол",
    name_ky: "Эргономикалык Жазуу Столу",
    shortDesc_tr: "Verimli çalışma alanları için tasarlandı.",
    shortDesc_ru: "Разработано для эффективных рабочих зон.",
    shortDesc_ky: "Натыйжалуу иш мейкиндиги үчүн иштелип чыккан.",
    description_tr: "Geniş masa tablası, entegre kablo kanalı ve üç çekmeceli kesonuyla evden çalışanlar ve öğrenciler için en konforlu deneyimi sunar.",
    description_ru: "Обеспечивает максимальный комфорт для удаленных работников и студентов благодаря просторной столешнице, кабель-каналу и тумбе с тремя ящиками.",
    description_ky: "Кенен үстөл бети, кабель өткөргүчү жана üç суурмалуу тумбочкасы менен үйдөн иштегендерге жана студенттерге эң ыңгайлуу шарт түзөт.",
    price: 15000,
    discountPrice: null,
    stockCode: "BLN-ERG-MAS",
    stockQty: 22,
    isPublished: true,
    categoryId: "cat-calisma",
    images: [
      { path: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800", isPrimary: true, order: 0 }
    ],
    averageRating: 4.2,
    reviewCount: 5
  },
  {
    id: "prod-6",
    slug: "dekoratif-bronz-ayna",
    name_tr: "Dekoratif Bronz Ayna",
    name_ru: "Декоративное Бронзовое Зеркало",
    name_ky: "Декоративдүү Бронза Күзгүсү",
    shortDesc_tr: "Salonunuzun havasını değiştirecek şık ayna.",
    shortDesc_ru: "Стильное зеркало, которое изменит атмосферу вашей гостиной.",
    shortDesc_ky: "Конок бөлмөңүздүн маанайын өзгөrtө турган стилдүү күзгү.",
    description_tr: "Asimetrik kesim bronz renkli ayna ve mat siyah boyalı çelik çerçeve tasarımı ile evinizin her köşesine zarafet katacak dekoratif parça.",
    description_ru: "Декоративное зеркало асимметричной формы бронзового оттенка в матовой черной стальной раме добавит изысканности любому уголку вашего дома.",
    description_ky: "Асимметриялык формадагы бронза түстөгү күзгү жана күңүрт кара болот алкак дизайны менен үйүңүздүн каалаган бурчуна көрк кошо турган жасалга.",
    price: 8500,
    discountPrice: 6900,
    isDiscountPermanent: true,
    stockCode: "BLN-DKR-AYN",
    stockQty: 30,
    isPublished: true,
    categoryId: "cat-aksesuar",
    images: [
      { path: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800", isPrimary: true, order: 0 }
    ],
    averageRating: 4.9,
    reviewCount: 8
  }
];

const defaultBlogPosts = [
  {
    id: "blog-1",
    slug: "2026-ev-dekorasyon-trendleri",
    title_tr: "2026 Ev Dekorasyon Trendleri: Doğallık ve Teknoloji Bir Arada",
    title_ru: "Тенденции Домашнего Декора 2026 года: Природа и Технологии",
    title_ky: "2026 Үй жасалгалоо тренддери: Табигыйлык жана Технология",
    excerpt_tr: "Bu yıl evlerimizde ahşap dokuların sıcaklığını akıllı mobilyalarla birleştiriyoruz.",
    excerpt_ru: "В этом году мы сочетаем тепло деревянных текстур с умной мебелью в наших домах.",
    excerpt_ky: "Бул жылы биз үйлөрүбүздө жыгач текстурасынын жылуулугун акылдуу эмеректер менен айкалыштырабыз.",
    content_tr: "Ev dekorasyonunda yeni bir çağ başlıyor. Sürdürülebilirlik odağında, doğal meşe ve ceviz kaplamalar, ev otomasyon sistemlerine entegre çalışma ve dinlenme köşeleriyle buluşuyor. Pastel tonların hakim olacağı 2026 sezonunda minimalizm ama aynı zamanda konfor en önemli önceliğimiz olacak...",
    content_ru: "Начинается новая эра в декоре дома. Особое внимание уделяется экологичности: натуральный шпон дуба и ореха сочетается с рабочими уголками и зонами отдыха, интегрированными в системы домашней автоматизации. В сезоне 2026 года, где будут преобладать пастельные тона, минимализм и в то же время комфорт станут нашими важнейшими приоритетами...",
    content_ky: "Үй жасалгасында жаңы доор башталууда. Табигый эмен жана жаңгак каптамалары үй автоматизация системаларына интеграцияланган жумуш жана эс алуу бурчтары менен айкалышат. Пастелдик тондор басымдуулук кыла турган 2026-жылдын сезонунда минимализм жана ошоll эле учурда ыңгайлуулук эң негизги артыкчылык болуп калат...",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
    publishedAt: "2026-06-15T12:00:00Z",
    createdAt: "2026-06-15T12:00:00Z",
    isPublished: true,
  },
  {
    id: "blog-2",
    slug: "ahsap-mobilya-bakimi-nasil-yapilir",
    title_tr: "Ahşap Mobilya Bakımı Nasıl Yapılır? Püf Noktaları",
    title_ru: "Как ухаживать за деревянной мебелью? Советы и хитрости",
    title_ky: "Жыгач эмеректи кантип күтүү керек? Маанилүү кеңештер",
    excerpt_tr: "Ahşap mobilyalarınızın ömrünü uzatacak doğal bakım tüyoları ve temizlik rehberi.",
    excerpt_ru: "Советы по натуральному уходу и руководство по очистке, которые продлят срок службы вашей деревянной мебели.",
    excerpt_ky: "Жыгач эмерегиңizдин өмүрүн узарта турган табигый күтүү кеңешteri ve тазалоо колдонмосу.",
    content_tr: "Ahşap mobilyalar yaşayan elementlerdir. Kimyasal temizleyiciler yerine nemli bez ve zeytinyağı karışımı kullanarak cilasını koruyabilir, doğrudan güneş ışığından uzak tutarak çatlamaların önüne geçebilirsiniz. Yılda bir kez yapacağınız doğal balmumu bakımı mobilyalarınızı ilk günkü parlaklığına kavuşturur...",
    content_ru: "Деревянная мебель — это живые элементы. Вместо химических чистящих средств можно использовать смесь влажной ткани и оливкового масла для защиты ее лака, а также держать ее вдали от прямых солнечных лучей для предотвращения растрескивания. Натуральный уход с воском раз в год вернет вашей мебели первоначальный блеск...",
    content_ky: "Жыгач эмеректер тирүү элементтер болуп саналат. Химиялык тазалоочу каражаттардин ордуна нымдуу чүпүрөк жана зайтун майынын аралашмасын колдонуп, анын боёgun сактап каla аласыз. Ошондой ele жарака ketпеши үчүн күн нурунан алыс кармоо керек. Жылына бир жолу табигый аары мому менен күтүү эмерегиңizди биринчи күнкүдөй жаркыратат...",
    image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800",
    publishedAt: "2026-05-20T10:00:00Z",
    createdAt: "2026-05-20T10:00:00Z",
    isPublished: true,
  }
];

const defaultCoupons = [
  { id: "coup-1", code: "WELCOME10", type: "percentage", value: 10, isActive: true },
  { id: "coup-2", code: "SUMMER500", type: "fixed", value: 500, isActive: true },
  { id: "coup-3", code: "ADMIN100", type: "percentage", value: 100, isActive: false }
];

const defaultDiscounts = [
  { id: "disc-1", name: "Yaz Kampanyası", type: "percentage", value: 15, categoryId: "cat-oturma", isActive: true },
  { id: "disc-2", name: "Aksesuar Fırsatı", type: "fixed", value: 500, categoryId: "cat-aksesuar", isActive: true }
];

const defaultReviews = [
  { id: "rev-1", productId: "prod-1", userId: "user-cust", userName: "Aleksey Smirnov", rating: 5, comment: "Harika bir takım, kumaş kalitesi inanılmaz güzel! Çok teşekkürler.", isApproved: true, createdAt: "2026-06-10T14:30:00Z" },
  { id: "rev-2", productId: "prod-1", userId: "user-guest", userName: "Eliza K.", rating: 5, comment: "Очень довольна покупкой. Выглядит богато и стильно.", isApproved: true, createdAt: "2026-06-12T09:15:00Z" },
  { id: "rev-3", productId: "prod-2", userId: "user-cust", userName: "Ahmet Y.", rating: 4, comment: "Koltuk gayet rahat ve fonksiyonel. Kurulumu da kolay yapıldı.", isApproved: true, createdAt: "2026-06-18T16:00:00Z" },
  { id: "rev-4", productId: "prod-4", userId: "user-cust", userName: "Mariya P.", rating: 5, comment: "Замечательный деревянный стол. Очень прочный и красивый.", isApproved: false, createdAt: "2026-06-20T11:45:00Z" }
];

const defaultQuestions = [
  { id: "q-1", productId: "prod-1", userId: "user-cust", userName: "Dmitry N.", question: "Koltuk takımının başka renk seçenekleri var mı?", answer: "Evet, gri ve vizon renk seçenekleri de mevcuttur. Detaylar için whatsapp hattımızdan ulaşabilirsiniz.", createdAt: "2026-06-11T10:00:00Z" },
  { id: "q-2", productId: "prod-3", userId: "user-cust", userName: "Bünyamin T.", question: "Yatak odası bazalı mı yoksa normal karyola mı?", answer: "Takımımız standart olarak kendinden bazalı (sandıklı) yatak kasası ile gelmektedir.", createdAt: "2026-06-14T08:20:00Z" },
  { id: "q-3", productId: "prod-4", userId: "user-guest", userName: "Saltanat K.", question: "Стол раздвижной или нет?", answer: null, createdAt: "2026-06-21T13:10:00Z" }
];

const defaultSettings = [
  { key: "phone", value: "+996 555 123 456" },
  { key: "address", value: "Bishkek, Kyrgyzstan, Chuy Ave 123" },
  { key: "email", value: "info@belenaymobilya.com" },
  { key: "instagram", value: "https://instagram.com/belenaymobilya" },
  { key: "facebook", value: "https://facebook.com/belenaymobilya" },
  { key: "working_hours", value: "Pazartesi - Cumartesi: 09:00 - 19:00" },
  { key: "shipping_cost", value: "1500" },
  { key: "free_shipping_limit", value: "30000" }
];

const defaultUsers = [
  { id: "1", email: "admin@belenay.com", firstName: "Belenay", lastName: "Admin", role: "admin", phone: "+905555555555", gender: "other" },
  { id: "user-cust", email: "user@belenay.com", firstName: "Ali", lastName: "Veli", role: "customer", phone: "+996777111222", gender: "male" }
];

const defaultAccountingEmployees = [
  { id: "emp-1", name: "Murat Ustabaşı", role: "Ahşap Ustası", salary: 35000, phone: "+996 555 999 888", isActive: true },
  { id: "emp-2", name: "Gizem Yılmaz", role: "İç Mimar", salary: 40000, phone: "+996 555 777 666", isActive: true },
  { id: "emp-3", name: "Aslanbek K.", role: "Sevkiyat Sorumlusu", salary: 28000, phone: "+996 555 555 444", isActive: true }
];

const defaultAccounting = [
  { id: "acc-1", type: "income", category: "sales", amount: 120000, description: "Avangard Koltuk Takımı Satışı", date: "2026-06-18" },
  { id: "acc-2", type: "expense", category: "salary", amount: 40000, description: "Gizem Y. Maaş Ödemesi", date: "2026-06-15" },
  { id: "acc-3", type: "expense", category: "material", amount: 25000, description: "Ceviz Kereste Alımı", date: "2026-06-12" },
  { id: "acc-4", type: "income", category: "sales", amount: 49000, description: "Loft Köşe Koltuk Satışı", date: "2026-06-20" }
];

const defaultContactMessages = [
  { id: "msg-1", name: "Zuhra A.", email: "zuhra@mail.ru", subject: "Bayilik Hakkında", message: "Belenay Mobilya ürünlerini Oş şehrinde satmak istiyoruz. Bayilik şartlarınızı iletebilir misiniz?", createdAt: "2026-06-19T15:20:00Z" },
  { id: "msg-2", name: "Kamil Bey", email: "kamil@gmail.com", subject: "Özel Ölçü Sipariş", message: "Loft Köşe koltuğu 320x240 cm ölçülerinde yapabilir misiniz? Fiyat farkı ne kadar olur?", createdAt: "2026-06-21T09:40:00Z" }
];

const defaultSpecialPages = [
  { id: "sp-1", slug: "about-us", title_tr: "Hakkımızda", title_ru: "О нас", title_ky: "Биз жөнүндө", content_tr: "Belenay Mobilya uzun yıllardır yüksek kaliteli ahşap ve döşemeli mobilyalar üretmektedir...", content_ru: "Belenay Mobilya производит качественную деревянную и мягкую мебель на протяжении многих лет...", content_ky: "Belenay Mobilya көп жылдар бою жогорку сапаттагы жыгач жана жумшак эмеректерди чыгарып келет...", isActive: true },
  { id: "sp-2", slug: "privacy-policy", title_tr: "Gizlilik Politikası", title_ru: "Политика конфиденциальности", title_ky: "Купуялык саясаты", content_tr: "Kişisel verileriniz bizimle güvendedir...", content_ru: "Ваши персональные данные в безопасности с нами...", content_ky: "Сиздин купуя маалыматыңыз биз менен коопсуз...", isActive: true }
];

const defaultOrders = [
  {
    id: "ord-1",
    status: "COMPLETED",
    totalAmount: 85000,
    address: "Bishkek, Kievskaya Str. 45, App 12",
    phone: "+996 555 111 222",
    receiptPath: "",
    adminNote: "Müşteriye teslim edildi, kurulum tamamlandı.",
    couponCode: "WELCOME10",
    discountAmount: 8500,
    createdAt: "2026-06-10T14:30:00Z",
    updatedAt: "2026-06-11T12:00:00Z",
    userId: "user-cust",
    user: { name: "Ali Veli", email: "user@belenay.com" },
    orderItems: [
      { id: "oi-1", productId: "prod-1", qty: 1, price: 85000, productName_tr: "Belenay Avangard Koltuk Takımı", productName_ru: "Авангардный Диванный Гарнитур Belenay", productName_ky: "Belenay Авангард Диван Топтому" }
    ]
  },
  {
    id: "ord-2",
    status: "PENDING_APPROVAL",
    totalAmount: 24000,
    address: "Karakol, Lenin Str. 188",
    phone: "+996 700 888 999",
    receiptPath: "/uploads/receipt-placeholder.jpg",
    adminNote: "",
    couponCode: null,
    discountAmount: 0,
    createdAt: "2026-06-21T10:00:00Z",
    updatedAt: "2026-06-21T10:00:00Z",
    userId: "user-guest",
    user: { name: "Kanat B.", email: "kanat@gmail.com" },
    orderItems: [
      { id: "oi-2", productId: "prod-4", qty: 1, price: 24000, productName_tr: "Hazel Ahşap Yemek Masası", productName_ru: "Деревянный Обеденный Стол Hazel", productName_ky: "Hazel Жыгач Тамактануучу Столу" }
    ]
  }
];

// ---- INITIALIZE DATABASE ----

export function getDb(): MockDBData {
  if (typeof window === "undefined") {
    return getSeedData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seed = getSeedData();
    saveDb(seed);
    return seed;
  }
  try {
    return JSON.parse(stored);
  } catch {
    const seed = getSeedData();
    saveDb(seed);
    return seed;
  }
}

export function saveDb(data: MockDBData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function getSeedData(): MockDBData {
  return {
    sliders: defaultSliders,
    categories: defaultCategories,
    products: defaultProducts,
    blogPosts: defaultBlogPosts,
    orders: defaultOrders,
    coupons: defaultCoupons,
    discounts: defaultDiscounts,
    reviews: defaultReviews,
    questions: defaultQuestions,
    settings: defaultSettings,
    users: defaultUsers,
    accounting: defaultAccounting,
    accountingEmployees: defaultAccountingEmployees,
    contact: defaultContactMessages,
    specialPages: defaultSpecialPages,
    favorites: [],
    cart: []
  };
}

export interface MockDBData {
  sliders: any[];
  categories: any[];
  products: any[];
  blogPosts: any[];
  orders: any[];
  coupons: any[];
  discounts: any[];
  reviews: any[];
  questions: any[];
  settings: any[];
  users: any[];
  accounting: any[];
  accountingEmployees: any[];
  contact: any[];
  specialPages: any[];
  favorites: any[];
  cart: any[];
}
