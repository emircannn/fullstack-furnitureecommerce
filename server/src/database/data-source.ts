// ============================================================
// Belenay Mobilya - TypeORM DataSource Tanımı
// CLI üzerinden migration işlemleri için kullanılır.
// NestJS'in TypeOrmModule yapılandırmasından bağımsızdır.
// Kullanım: npm run typeorm -- migration:generate src/database/migrations/MigrationName
// ============================================================

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// ---- Root'taki .env Dosyasını Yükle ----
// CLI ortamında process.env otomatik yüklenmez, bu yüzden elle yüklenir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ---- Entity İmportları ----
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Review } from '../modules/reviews/entities/review.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { Favorite } from '../modules/favorites/entities/favorite.entity';
import { BlogPost } from '../modules/blog/entities/blog-post.entity';
import { HomepageSection } from '../modules/homepage-design/entities/homepage-section.entity';
import { Slider } from '../modules/homepage-design/entities/slider.entity';
import { SpecialPage } from '../modules/special-pages/entities/special-page.entity';
import { SpecialPageProduct } from '../modules/special-pages/entities/special-page-product.entity';
import { Employee } from '../modules/accounting/entities/employee.entity';
import { Transaction } from '../modules/accounting/entities/transaction.entity';
import { InventoryItem } from '../modules/inventory/entities/inventory-item.entity';
import { Coupon } from '../modules/coupons/entities/coupon.entity';
import { Discount } from '../modules/discounts/entities/discount.entity';
import { Setting } from '../modules/settings/entities/setting.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { ContactMessage } from '../modules/contact/entities/contact.entity';

// ---- DataSource Tanımı ----
export const AppDataSource = new DataSource({
  type: 'mysql',

  // ---- Bağlantı Bilgileri ----
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'belenaymebel',

  // ---- Entity Listesi ----
  entities: [
    User,
    Category,
    Product,
    ProductImage,
    Order,
    OrderItem,
    Review,
    Question,
    Favorite,
    BlogPost,
    HomepageSection,
    Slider,
    SpecialPage,
    SpecialPageProduct,
    Employee,
    Transaction,
    InventoryItem,
    Coupon,
    Discount,
    Setting,
    RefreshToken,
    ContactMessage,
  ],

  // ---- Migration Konumları ----
  migrations: [path.resolve(__dirname, './migrations/**/*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',

  // ---- Üretim Güvenliği: Otomatik Senkronizasyon Kapalı ----
  synchronize: false,

  // ---- Günlük Ayarları ----
  logging: process.env.NODE_ENV === 'development',

  // ---- Karakter Seti ----
  charset: 'utf8mb4',
  timezone: '+06:00',
});
