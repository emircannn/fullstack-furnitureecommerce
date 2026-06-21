import { AppDataSource } from './data-source';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/enums/user-role.enum';
import { Gender } from '../modules/users/enums/gender.enum';
import { AuthProvider } from '../modules/users/enums/auth-provider.enum';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { Slider } from '../modules/homepage-design/entities/slider.entity';
import { BlogPost } from '../modules/blog/entities/blog-post.entity';
import { Setting } from '../modules/settings/entities/setting.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  console.log('Database connected successfully.');

  console.log('Synchronizing database schema (wiping existing data)...');
  await AppDataSource.synchronize(true);
  console.log('Database schema synchronized.');

  // ==========================================
  // 1. SEED USERS
  // ==========================================
  console.log('Seeding users...');
  const userRepository = AppDataSource.getRepository(User);
  
  const adminPasswordHash = await bcrypt.hash('BelenayAdmin2026', 12);
  const customerPasswordHash = await bcrypt.hash('BelenayCustomer2026', 12);
  const emircanPasswordHash = await bcrypt.hash('22454035230', 12);

  const admin = userRepository.create({
    name: 'Belenay Admin',
    email: 'admin@belenay.com',
    phone: '+996555123456',
    gender: Gender.MALE,
    passwordHash: adminPasswordHash,
    provider: AuthProvider.LOCAL,
    role: UserRole.ADMIN,
    isActive: true,
  });

  const customer = userRepository.create({
    name: 'Deniz Müşteri',
    email: 'customer@belenay.com',
    phone: '+996700987654',
    gender: Gender.FEMALE,
    passwordHash: customerPasswordHash,
    provider: AuthProvider.LOCAL,
    role: UserRole.CUSTOMER,
    isActive: true,
  });

  const emircanUser = userRepository.create({
    name: 'Yaşar Emircan',
    email: 'yasar.emircann@gmail.com',
    phone: '+996555224540',
    gender: Gender.MALE,
    passwordHash: emircanPasswordHash,
    provider: AuthProvider.LOCAL,
    role: UserRole.CUSTOMER,
    isActive: true,
  });

  await userRepository.save([admin, customer, emircanUser]);
  console.log('Users seeded.');

  // ==========================================
  // 2. SEED CATEGORIES
  // ==========================================
  console.log('Seeding categories...');
  const categoryRepository = AppDataSource.getTreeRepository(Category);

  const catOturma = categoryRepository.create({
    name_tr: 'Oturma Odası',
    name_ru: 'Гостиная',
    name_ky: 'Конок бөлмөсү',
    slug: 'oturma-odasi',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    showInHeader: true,
    order: 1,
  });

  const catYatak = categoryRepository.create({
    name_tr: 'Yatak Odası',
    name_ru: 'Спальня',
    name_ky: 'Уктоочу бөлмө',
    slug: 'yatak-odasi',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop',
    showInHeader: true,
    order: 2,
  });

  const catYemek = categoryRepository.create({
    name_tr: 'Yemek Odası',
    name_ru: 'Столовая',
    name_ky: 'Тамактануучу бөлмö',
    slug: 'yemek-odasi',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?q=80&w=800&auto=format&fit=crop',
    showInHeader: true,
    order: 3,
  });

  const catCalisma = categoryRepository.create({
    name_tr: 'Çalışma Odası',
    name_ru: 'Рабочий кабинет',
    name_ky: 'Иш бөлмөсү',
    slug: 'calisma-odasi',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop',
    showInHeader: true,
    order: 4,
  });

  const catGenc = categoryRepository.create({
    name_tr: 'Genç Odası',
    name_ru: 'Молодежная комната',
    name_ky: 'Өспүрүмдөр бөлмөсү',
    slug: 'genc-odasi',
    image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=800&auto=format&fit=crop',
    showInHeader: false,
    order: 5,
  });

  const catAksesuar = categoryRepository.create({
    name_tr: 'Aksesuarlar',
    name_ru: 'Аксессуары',
    name_ky: 'Аксессуарлар',
    slug: 'aksesuarlar',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    showInHeader: false,
    order: 6,
  });

  const savedCategories = await categoryRepository.save([
    catOturma,
    catYatak,
    catYemek,
    catCalisma,
    catGenc,
    catAksesuar,
  ]);
  console.log('Categories seeded.');

  const categoryMap = new Map<string, Category>();
  savedCategories.forEach(cat => categoryMap.set(cat.slug, cat));

  // ==========================================
  // 3. SEED PRODUCTS & IMAGES
  // ==========================================
  console.log('Seeding products...');
  const productRepository = AppDataSource.getRepository(Product);
  const productImageRepository = AppDataSource.getRepository(ProductImage);

  const productData = [
    {
      slug: 'milano-luxury-oturma-grubu',
      name_tr: 'Milano Luxury Oturma Grubu',
      name_ru: 'Гостиный Гарнитур Milano Luxury',
      name_ky: 'Milano Luxury Конок Бөлмө Эмереги',
      shortDesc_tr: 'Lüks chesterfield tasarımı, yüksek dansiteli sünger ve kadife kumaş seçeneği.',
      shortDesc_ru: 'Роскошный дизайн честерфилд, высокоплотный поролон и бархатная обивка.',
      shortDesc_ky: 'Люкс честерфилд дизайны, жогорку тыгыздыктагы көбүк жана баркыт кездеме.',
      description_tr: 'Milano Koltuk Takımı, klasik chesterfield ruhunu modern çizgilerle buluşturuyor. El işçiliği kapitone detayları, gürgen ağacından üretilen sağlam iskeleti ve leke tutmayan ithal kadife kumaşı ile salonunuza şıklık katacak.',
      description_ru: 'Диван Milano сочетает в себе классический дух честерфилда и современные линии. Стеганые вручную детали, прочный каркас из граба и грязеотталкивающая импортная бархатная ткань придадут элегантность вашей гостиной.',
      description_ky: 'Milano диван топтому классикалык честерфилд рухун заманбап сызыктар менен айкалыштырат. Колдон тигилген капитоне деталдары, бук жыгачынан жасалган бекем каркасы жана так түшпөгөн импорттук баркыт кездемеси конок бөлмөңүзгө көрк кошот.',
      price: 145000,
      discountPrice: 129000,
      stockCode: 'BLN-MIL-LUX-01',
      stockQty: 5,
      categories: ['oturma-odasi'],
      images: [
        { path: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 },
        { path: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=800&auto=format&fit=crop', isPrimary: false, order: 2 },
        { path: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', isPrimary: false, order: 3 }
      ]
    },
    {
      slug: 'roma-masif-yemek-masasi',
      name_tr: 'Roma Masif Yemek Masası',
      name_ru: 'Обеденный Стол из Массива Roma',
      name_ky: 'Roma Массивдүү Тамактануучу Столу',
      shortDesc_tr: 'Doğal ahşap dokusu, metal ayaklı modern tasarım.',
      shortDesc_ru: 'Натуральная текстура дерева, современный дизайн на металлических ножках.',
      shortDesc_ky: 'Табигый жыгач фактурасы, металл буттуу заманбап дизайн.',
      description_tr: 'Roma Yemek Masası, %100 masif meşe ağacından üretilmiştir. Doğal kenar bitişleri ve endüstriyel metal ayak tasarımı ile salonunuza modern bir hava katacaktır.',
      description_ru: 'Обеденный стол Roma изготовлен из 100% массива дуба. Благодаря краям с естественным контуром и дизайну из промышленного металла, он придаст современный вид вашей гостиной.',
      description_ky: 'Roma тамактануучу столу 100% массивдүү эмен жыгачынан жасалган. Табигый четтери жана өнөр жайлык металл буттары конок бөлмөңүзгө заманбап маанай тартуулайт.',
      price: 58000,
      discountPrice: null,
      stockCode: 'BLN-ROM-MAS-02',
      stockQty: 8,
      categories: ['yemek-odasi'],
      images: [
        { path: 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 },
        { path: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=800&auto=format&fit=crop', isPrimary: false, order: 2 }
      ]
    },
    {
      slug: 'sofia-premium-yatak-odasi',
      name_tr: 'Sofia Premium Yatak Odası Takımı',
      name_ru: 'Спальный Гарнитур Sofia Premium',
      name_ky: 'Sofia Premium Уктоочу Bөлмө Топтому',
      shortDesc_tr: 'Estetik gardıroplar, şık yatak başlıkları ve komodinler.',
      shortDesc_ru: 'Эстетичные шкафы, стильные изголовья кроватей и тумбочки.',
      shortDesc_ky: 'Эстетикалык шкафтар, стилдүү керебет баштары жана тумбочкалар.',
      description_tr: 'Sofia Premium Yatak Odası, şıklık ve konforu bir arada sunan özel tasarımıyla yatak odanızı saray yavrusuna dönüştürür. Soft renkleri ve ince detay işçiliğiyle göz kamaştırır.',
      description_ru: 'Спальня Sofia Premium превратит вашу спальню в мини-дворец благодаря особому дизайну, предлагающему одновременно элегантность и комфорт. Она ослепляет своими мягкими цветами и тонким мастерством.',
      description_ky: 'Sofia Premium уктоочу бөлмөсү уктоочу бөлмөңүздү жарашыктуулугу жана ыңгайлуулугу менен чакан сарайга айлантат. Ал жумшак түстөрү жана кылдат иштетилген деталдары менен көздү өзүнө тартат.',
      price: 195000,
      discountPrice: 175000,
      stockCode: 'BLN-SOF-PRE-03',
      stockQty: 3,
      categories: ['yatak-odasi'],
      images: [
        { path: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 }
      ]
    },
    {
      slug: 'prada-modern-calisma-masasi',
      name_tr: 'Prada Modern Çalışma Masası',
      name_ru: 'Письменный Стол Prada Modern',
      name_ky: 'Prada Заманбап Жазуу Столу',
      shortDesc_tr: 'Ergonomik çalışma alanı ve kitaplık rafları.',
      shortDesc_ru: 'Эргономичная рабочая зона и книжные полки.',
      shortDesc_ky: 'Эргономикалык жумушчу орун жана китеп текчелери.',
      description_tr: 'Prada Çalışma Masası, hem evden çalışanlar hem de öğrenciler için son derece kullanışlı, şık ve geniş bir çalışma ortamı sunar. Rafları sayesinde dosyalarınızı kolayca organize edebilirsiniz.',
      description_ru: 'Письменный стол Prada предлагает чрезвычайно полезную, стильную и просторную рабочую среду как для тех, кто работает на дому, так и для студентов. Благодаря его полкам вы сможете легко упорядочить свои документы.',
      description_ky: 'Prada жазуу столу үйдөн иштегендер үчүн да, студенттер үчүн да абdan пайдалуу, стилдүү жана кенен жумушчу шартты сунуштайт. Текчелеринин жардамы менен документтериңизди оңой иреттей аласыз.',
      price: 24000,
      discountPrice: null,
      stockCode: 'BLN-PRA-MOD-04',
      stockQty: 12,
      categories: ['calisma-odasi'],
      images: [
        { path: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 }
      ]
    },
    {
      slug: 'chesterfield-deri-koltuk',
      name_tr: 'Chesterfield Deri Koltuk',
      name_ru: 'Кожаный Диван Chesterfield',
      name_ky: 'Тери Диван Chesterfield',
      shortDesc_tr: 'Hakiki deri kaplama, kapitone el işçiliği.',
      shortDesc_ru: 'Обивка из натуральной кожи, ручная стежка.',
      shortDesc_ky: 'Чыныгы булгаары капталган, кол менен тигилген капитоне.',
      description_tr: 'Klasik Chesterfield tasarımının hakiki İtalyan derisiyle buluştuğu bu berjer ve koltuk serisi, ofisinize veya salonunuza ağırlık ve prestij katacaktır. Yıllar geçtikçe değerlenen özel deri dokusuna sahiptir.',
      description_ru: 'Эта серия кресел и диванов, в которой классический дизайн Chesterfield сочетается с натуральной итальянской кожей, придаст солидность и престиж вашему офису или гостиной. Она обладает особой текстурой кожи, которая ценится с годами.',
      description_ky: 'Классикалык Chesterfield дизайны чыныгы италиялык териси менен айкалышкан бул кресло жана дивандар кеңсесиңизге же конок бөлмөңүзгə кадыр-барк кошот. Жыл өткөн сайын баалуулугу арткан өзгөчө тери фактурасына ээ.',
      price: 85000,
      discountPrice: null,
      stockCode: 'BLN-CHE-DER-05',
      stockQty: 2,
      categories: ['oturma-odasi'],
      images: [
        { path: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 }
      ]
    },
    {
      slug: 'minimalist-kitaplik',
      name_tr: 'Minimalist Kitaplık',
      name_ru: 'Минималистичный Книжный Шкаф',
      name_ky: 'Минималисттик Китеп текчеси',
      shortDesc_tr: 'Ahşap raflar, metal siyah iskelet.',
      shortDesc_ru: 'Деревянные полки, черный металлический каркас.',
      shortDesc_ky: 'Жыгач текчелер, кара металл каркас.',
      description_tr: 'Minimal tasarımıyla hem şık hem de az yer kaplayan kitaplık modelimiz, dayanıklı fırın boyalı demir iskeleti ve kaliteli masif ahşap raflarıyla uzun ömürlü bir kullanım vaat ediyor.',
      description_ru: 'Наша модель книжного шкафа, которая благодаря своему минималистичному дизайну является стильной и занимает мало места, гарантирует долгий срок службы благодаря прочному окрашенному металлическому каркасу и полкам из массива дерева.',
      description_ky: 'Жөнөкөй дизайны менен кооз жана аз орун ээлеген бул китеп текчеси бышык сырдалган темир каркасы жана сапаттуу жыгач текчелери менен узак убакытка колдонууга кепилдик берет.',
      price: 18000,
      discountPrice: 15500,
      stockCode: 'BLN-MIN-KIT-06',
      stockQty: 15,
      categories: ['calisma-odasi', 'aksesuarlar'],
      images: [
        { path: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800&auto=format&fit=crop', isPrimary: true, order: 1 }
      ]
    }
  ];

  for (const item of productData) {
    const cats = item.categories.map(slug => categoryMap.get(slug)).filter(Boolean) as Category[];
    
    const prod = productRepository.create({
      slug: item.slug,
      name_tr: item.name_tr,
      name_ru: item.name_ru,
      name_ky: item.name_ky,
      shortDesc_tr: item.shortDesc_tr,
      shortDesc_ru: item.shortDesc_ru,
      shortDesc_ky: item.shortDesc_ky,
      description_tr: item.description_tr,
      description_ru: item.description_ru,
      description_ky: item.description_ky,
      price: item.price,
      discountPrice: item.discountPrice,
      stockCode: item.stockCode,
      stockQty: item.stockQty,
      categories: cats,
      averageRating: 5.0,
      reviewCount: 0,
      viewCount: 15,
    });

    const savedProd = await productRepository.save(prod);

    for (const img of item.images) {
      const prodImg = productImageRepository.create({
        path: img.path,
        isPrimary: img.isPrimary,
        order: img.order,
        productId: savedProd.id,
      });
      await productImageRepository.save(prodImg);
    }
  }

  console.log('Products and images seeded.');

  // ==========================================
  // 4. SEED SLIDERS
  // ==========================================
  console.log('Seeding sliders...');
  const sliderRepository = AppDataSource.getRepository(Slider);

  const slide1 = sliderRepository.create({
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    title_tr: 'Lüks Yaşam Alanları',
    title_ru: 'Роскошные Гостиные',
    title_ky: 'Люкс Жашоо Аянттары',
    subtitle_tr: 'Evinize değer katan modern tasarımlar ve İtalyan işçiliği.',
    subtitle_ru: 'Современный дизайн и итальянское мастерство, повышающие ценность вашего дома.',
    subtitle_ky: 'Үйүңүзгө маани кошкон заманбап дизайн жана италиялык чеберчилик.',
    buttonText_tr: 'Koleksiyonu İncele',
    buttonText_ru: 'Смотреть Коллекцию',
    buttonText_ky: 'Коллекцияны Көрүү',
    buttonLink: '/special/nevruz-ozel-firsatlari',
    buttonColor: '#e75f0d',
    textColor: '#ffffff',
    order: 1,
    isActive: true,
  });

  const slide2 = sliderRepository.create({
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop',
    title_tr: 'Rahat ve Estetik Yatak Odaları',
    title_ru: 'Уютные и Эстетичные Спальни',
    title_ky: 'Ыңгайлуу жана Эстетикалык Уктоочу Bөлмөлөр',
    subtitle_tr: 'Günün yorgunluğunu unutturacak konforlu ve şık çözümler.',
    subtitle_ru: 'Комфортные и стильные решения, которые заставят вас забыть об усталости дня.',
    subtitle_ky: 'Күндүн чарчоосун унуттура турган ыңгайлуу жана кооз чечимдер.',
    buttonText_tr: 'Keşfet',
    buttonText_ru: 'Исследовать',
    buttonText_ky: 'Изилдөө',
    buttonLink: '/kategori/yatak-odasi',
    buttonColor: '#191833',
    textColor: '#ffffff',
    order: 2,
    isActive: true,
  });

  await sliderRepository.save([slide1, slide2]);
  console.log('Sliders seeded.');

  // ==========================================
  // 5. SEED BLOG POSTS
  // ==========================================
  console.log('Seeding blog posts...');
  const blogRepository = AppDataSource.getRepository(BlogPost);

  const post1 = blogRepository.create({
    slug: '2026-mobilya-trendleri-ve-dekorasyon-onerileri',
    title_tr: '2026 Mobilya Trendleri ve Dekorasyon Önerileri',
    title_ru: 'Тенденции мебели 2026 года и советы по декору',
    title_ky: '2026 Эмерек Тренддери жана Декорация Сунуштары',
    excerpt_tr: 'Yeni yılda evlerinizde sadelik, doğallık ve fonksiyonellik ön planda. İşte 2026\'nın öne çıkan dekorasyon trendleri.',
    excerpt_ru: 'В новом году в ваших домах на первом месте простота, естественность и функциональность. Вот выдающиеся тренды декора 2026 года.',
    excerpt_ky: 'Жаңы жылда үйлөрүңүздө жөнөкөйлүк, табигыйлык жана функционалдуулук биринчи орунда. Бул жерде 2026-жылдын көрүнүктүү жасалгалоо тенденциялары.',
    content_tr: '2026 yılı, ev dekorasyonunda büyük bir zihniyet değişimini beraberinde getiriyor. Hızlı tüketim ve geçici çözümler yerini, kalıcı, sürdürülebilir ve ruha dokunan tasarımlara bırakıyor. İşte bu yıl evlerinizde sıkça göreceğiniz ana dekorasyon trendleri:\n\n### 1. Organik Formlar ve Yuvarlak Hatlar\nKöşeli ve keskin hatlı mobilyalar yerini kıvrımlı, organik formlara bırakıyor. Yuvarlak hatlı koltuklar, dairesel yemek masaları ve kavisli sehpalar, evinizde daha sıcak ve kucaklayıcı bir enerji yaratıyor.\n\n### 2. Sürdürülebilir ve Doğal Malzemeler\nDoğaya dönüş hareketi dekorasyonda da etkisini artırarak devam ettiriyor. %100 masif ahşap, mermer detaylar ve keten dokular 2026\'nın vazgeçilmezleri.',
    content_ru: '2026 год несет с собой серьезные изменения в менталитете домашнего декора. Быстрое потребление и временные решения уступают место долговечным, устойчивым и душевным конструкциям.\n\n### 1. Органические формы и округлые линии\nМебель с угловатыми и резкими линиями уступает место плавным, органичным формам. Закругленные диваны, круглые обеденные столы и журнальные столики создают более теплую и манящую энергию.\n\n### 2. Экологичные и натуральные материалы\nДвижение «назад к природе» продолжает усиливать свое влияние в декоре. 100% массив дерева, мраморные детали и льняная текстура — среди незаменимых вещей 2026 года.',
    content_ky: '2026-жыл үй жасалгалоодо чоң өзгөрүүлөрдү алып келет. Тез керектөө жана убактылуу чечимдер туруктуу, экологиялык таза жана жан дүйнөгө жагымдуу долбоорлорго орун берет.\n\n### 1. Органикалык формалар жана тегерек сызыктар\nБурчтуу жана курч сызыктуу эмеректер өз ордун ийилген, органикалык формаларга бошотуп берет. Тегерек дивандар, тегерек тамактануучу столдор үйүңүздө жылуу жана жагымдуу энергияны жаратат.\n\n### 2. Туруктуу жана табигый материалдар\nЖаратылышка кайтуу кыймылы жасалгалоодо да өз таасирин күчөтүүдө. 100% массивдүү жыгач, мрамор деталдары жана зыгыр буласынан жасалган текстуралар 2026-жылдын алмаштырылгыс нерселеринен.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    isPublished: true,
    publishedAt: new Date(),
  });

  const post2 = blogRepository.create({
    slug: 'masif-ahsap-mobilya-bakimi-nasil-yapilir',
    title_tr: 'Masif Ahşap Mobilya Bakımı Nasıl Yapılmalı?',
    title_ru: 'Как ухаживать за мебелью из массива дерева?',
    title_ky: 'Массивдүү Жыгач Эмеректерин Күнүмдüк Багуу Кандай Болушу Керек?',
    excerpt_tr: 'Doğal meşe ve gürgen ahşap mobilyalarınızın ömrünü uzatacak pratik temizlik ve bakım ipuçları bu rehberde.',
    excerpt_ru: 'Практичные советы по очистке и уходу, которые продлят жизнь вашей деревянной мебели из натурального дуба и граба.',
    excerpt_ky: 'Табигый эмен жана бук жыгач эмеректериңиздин өмүрүн узартуучу практикалык тазалоо жана багуу кеңештери ушул колдонмодо.',
    content_tr: 'Masif ahşap mobilyalar, evlerimize doğallık, sıcaklık ve prestij kazandırır. Ancak onların bu eşsiz güzelliğini nesiller boyu koruması için düzenli ve doğru bakıma ihtiyaçları vardır. İşte masif ahşap mobilyalarınızı korumanın yolları:\n\n### 1. Nem ve Sıcaklık Dengesini Koruyun\nAhşap, yaşayan organik bir malzemedir ve ortamdaki nem değişimlerine tepki verir. Mobilyalarınızı doğrudan güneş ışığından ve kalorifer peteklerinden uzak tutun.\n\n### 2. Temizlikte Kimyasallardan Kaçının\nÇamaşır suyu, alkol bazlı temizleyiciler ve tiner içeren solüsyonlar masif ahşabın cilasına kalıcı hasar verir. Temizlik için sadece hafif nemlendirilmiş mikrofiber bez kullanın.',
    content_ru: 'Мебель из массива дерева приносит в наши дома естественность, тепло и престиж. Однако для того, чтобы они сохраняли эту неповторимую красоту на протяжении поколений, за ними требуется правильный регулярный уход.\n\n### 1. Поддерживайте баланс влажности и температуры\nДерево — это живой органический материал, реагирующий на изменения влажности в помещении. Держите мебель вдали от прямых солнечных лучей и радиаторов отопления.\n\n### 2. Избегайте использования химических средств при чистке\nРастворы, содержащие отбеливатель, чистящие средства на спиртовой основе и растворители, наносят непоправимый вред отделке.',
    content_ky: 'Массивдүү жыгач эмеректер үйлөрүбүзгө табигыйлыкты, жылуулукту жана кадыр-баркты алып келет. Бирок, алардын бул кайталангыс сулуулугун муундан-муунга сактап калуу үчүн кам көрүү керек.\n\n### 1. Нымдуулук жана температура балансын сактаңыз\nЖыгач - тирүү органикалык материал жана айлана-чөйрөнүн нымдуулук өзгөрүүсünө жооп берет. Эмеректериңизди тике тийген күндүн нурунан алыс кармаңыз.\n\n### 2. Тазалоодо химиялык заттардан алыс болуңуз\nАгарткыч, спирт негизиндеги тазалагычтар жана суюлтуучу заттар массивдүү жыгачтын сыртына зыян келтирет. Жеңил нымдалган кездеме колдонуңуз.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop',
    isPublished: true,
    publishedAt: new Date(),
  });

  await blogRepository.save([post1, post2]);
  console.log('Blog posts seeded.');

  // ==========================================
  // 6. SEED SETTINGS
  // ==========================================
  console.log('Seeding settings...');
  const settingRepository = AppDataSource.getRepository(Setting);
  await settingRepository.save([
    { key: 'site_name', value: 'Belenay Mobilya' },
    { key: 'site_phone', value: '+996 555 180 581' },
    { key: 'site_email', value: 'info@belenaymobilya.com' },
    { key: 'site_address', value: 'Bishkek, Kırgızistan (Belenay Showroom)' },
    { key: 'whatsapp_number', value: '996555180581' },
    { key: 'facebook_url', value: 'https://facebook.com/belenaymobilya' },
    { key: 'instagram_url', value: 'https://instagram.com/belenaymobilya' },
    { key: 'twitter_url', value: '' },
    { key: 'bank_transfer_name', value: 'Demir Bank Kyrgyzstan' },
    { key: 'bank_transfer_holder', value: 'Belenay Mobilya Ltd.' },
    { key: 'bank_transfer_iban', value: 'KG12345678901234567890' },
    { key: 'payment_qr_code', value: '' },
  ]);
  console.log('Settings seeded.');

  console.log('All seed data completed successfully.');
  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
