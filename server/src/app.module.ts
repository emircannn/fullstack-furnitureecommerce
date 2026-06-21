// ============================================================
// Belenay Mobilya - App.module.ts - Redis Module eklendi
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Yapılandırma dosyaları
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

// Feature modülleri
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { BlogModule } from './modules/blog/blog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HomepageDesignModule } from './modules/homepage-design/homepage-design.module';
import { SpecialPagesModule } from './modules/special-pages/special-pages.module';
import { UploadModule } from './modules/upload/upload.module';
import { ContactModule } from './modules/contact/contact.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CartModule } from './modules/cart/cart.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

// ---- Ana Uygulama Modülü ----
@Module({
  imports: [
    // ---- Ortam Değişkenleri Modülü ----
    ConfigModule.forRoot({
      isGlobal: true, // Tüm modüllerde erişilebilir
      envFilePath: ['../.env', '../../.env', '.env'], // Root .env dosyasını oku
      load: [databaseConfig, redisConfig, jwtConfig],
      cache: true, // Performans için önbellekle
    }),

    // ---- Veritabanı Bağlantısı (TypeORM + MySQL) ----
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        // Entity'leri otomatik bul
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Geliştirme ortamında şema senkronizasyonu (ÜRETIMDE KULLANMA!)
        synchronize: process.env.NODE_ENV === 'development',
        // Migration geçmişini kaydet
        migrationsTableName: 'migrations',
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        // Sorgu günlüğü (sadece geliştirme)
        logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
        // Bağlantı havuzu ayarları
        extra: {
          connectionLimit: 10,
          connectTimeout: 60000,
        },
        charset: 'utf8mb4',
        timezone: '+06:00',
      }),
      inject: [ConfigService],
    }),

    // ---- Hız Sınırlayıcı (Rate Limiting) ----
    // Global limit: 1 dakikada 100 istek
    // Login endpoint'i ayrıca @Throttle({ default: { limit: 5, ttl: 60000 } }) ile sınırlandırılır
    ThrottlerModule.forRoot([
      {
        // Genel API limiti: 1 dakikada 100 istek
        name: 'default',
        ttl: 60000,   // 1 dakika (milisaniye)
        limit: 100,
      },
      {
        // Uzun vadeli: 1 saatte 1000 istek
        name: 'long',
        ttl: 3600000, // 1 saat (milisaniye)
        limit: 1000,
      },
    ]),

    // ---- Olay Yayıcı (Event Emitter) ----
    EventEmitterModule.forRoot({
      // Wildcard olay dinlemeye izin ver
      wildcard: false,
      // Hata yönetimi
      ignoreErrors: false,
    }),

    // ---- Görev Zamanlayıcı (Cron Jobs) ----
    ScheduleModule.forRoot(),

    // ---- Statik Dosya Sunumu ----
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // ---- Redis Modülü (Global - tüm modüllerde REDIS_CLIENT inject edilebilir) ----
    RedisModule,

    // ---- Kimlik Doğrulama Modülü ----
    // JWT stratejileri, guard'lar ve OAuth burada
    AuthModule,
    UploadModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    QuestionsModule,
    BlogModule,
    InventoryModule,
    CouponsModule,
    DiscountsModule,
    AccountingModule,
    SettingsModule,
    HomepageDesignModule,
    SpecialPagesModule,
    ContactModule,
    DashboardModule,
    CartModule,
    FavoritesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
