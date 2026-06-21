process.env.TZ = 'Asia/Bishkek';

// ============================================================
// Belenay Mobilya - NestJS Uygulama Giriş Noktası
// Port 3001 üzerinde çalışır. CORS, Helmet güvenlik başlıkları,
// Swagger API dokümantasyonu, global guards/interceptors/filters
// ve cookie-parser burada yapılandırılır.
// ============================================================

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // ---- NestJS Uygulaması Oluşturma ----
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ---- Güvenlik: Helmet HTTP Başlıkları ----
  // XSS, clickjacking ve diğer saldırılara karşı koruma
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io', '*.googleapis.com'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          fontSrc: [`'self'`, 'data:'],
        },
      },
    }),
  );

  // ---- Sıkıştırma Middleware ----
  // Yanıt boyutunu küçülterek performansı artırır
  app.use(compression());

  // ---- Cookie Parser Middleware ----
  // HttpOnly cookie ile refresh token okumak için gereklidir
  app.use(cookieParser());

  // ---- CORS Ayarları ----
  // Sadece izin verilen origin'lerden gelen isteklere izin verir
  app.enableCors({
    origin: [
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Requested-With'],
    // Cookie'lerin cross-origin isteklerde gönderilmesine izin ver
    credentials: true,
  });

  // ---- Global API Öneki ----
  app.setGlobalPrefix('api');

  // ---- Reflector (Guard'lar için gerekli) ----
  const reflector = app.get(Reflector);

  // ---- Global Guard: Throttler (Rate Limiting) ----
  // app.module.ts içinde APP_GUARD olarak kaydedilecek

  // ---- Global Doğrulama Pipeline'ı ----
  app.useGlobalPipes(
    new ValidationPipe({
      // Bilinmeyen alanları otomatik olarak çıkar
      whitelist: true,
      // Bilinmeyen alanlar varsa hata fırlat
      forbidNonWhitelisted: true,
      // Plain nesneleri DTO'ya dönüştür
      transform: true,
      transformOptions: {
        // Örtük dönüşümlere izin ver (string -> number vb.)
        enableImplicitConversion: true,
      },
      // Production'da hata mesaj detaylarını gizle
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // ---- Global İnterceptorlar ----
  // İstek/yanıt loglama
  app.useGlobalInterceptors(new LoggingInterceptor());
  // Standart yanıt formatı sarmalama
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // ---- Global Exception Filter ----
  // Tüm hataları standart formata dönüştürür
  app.useGlobalFilters(new HttpExceptionFilter());

  // ---- Swagger API Dokümantasyonu (Sadece geliştirme ortamında) ----
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Belenay Mobilya API')
      .setDescription('Belenay Mobilya e-ticaret platformu REST API dokümantasyonu')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT access token giriniz',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('refreshToken', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly refresh token cookie',
      })
      .addTag('Auth', 'Kimlik doğrulama işlemleri')
      .addTag('Users', 'Kullanıcı yönetimi')
      .addTag('Products', 'Ürün yönetimi')
      .addTag('Categories', 'Kategori yönetimi')
      .addTag('Orders', 'Sipariş yönetimi')
      .addTag('Cart', 'Sepet işlemleri')
      .addTag('Reviews', 'Ürün yorumları')
      .addTag('Blog', 'Blog yönetimi')
      .addTag('Dashboard', 'Yönetim paneli')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log('Swagger UI: http://localhost:3001/api/docs');
  }

  // ---- Port Dinleme ----
  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`🚀 Belenay API sunucusu başlatıldı: http://localhost:${port}/api`);
  logger.log(`📋 Ortam: ${process.env.NODE_ENV ?? 'development'}`);
  logger.log(`🔒 JWT Auth + Rate Limiting + Helmet aktif`);
}

// Uygulamayı başlat
bootstrap().catch((error) => {
  console.error('Uygulama başlatılamadı:', error);
  process.exit(1);
});
