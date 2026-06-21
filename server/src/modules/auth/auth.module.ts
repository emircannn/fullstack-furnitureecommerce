// ============================================================
// Belenay Mobilya - Auth Modülü
// Kimlik doğrulama ve yetkilendirme için gerekli tüm
// bileşenleri bir araya toplar:
//   - JwtModule (access + refresh token üretimi)
//   - PassportModule (strategy entegrasyonu)
//   - Stratejiler: JWT, JwtRefresh, Google
//   - Guard'lar: JwtAuth, Admin, Roles
// ============================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

// ---- Stratejiler ----
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

// ---- Guard'lar ----
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RolesGuard } from './guards/roles.guard';

// ---- Redis Provider ----
// Redis istemcisini diğer modüllerden alır (AppModule'de tanımlı)
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    // Ortam değişkenleri
    ConfigModule,

    // TypeORM User and RefreshToken Repository
    TypeOrmModule.forFeature([User, RefreshToken]),

    // Passport kimlik doğrulama çerçevesi
    // Varsayılan strateji JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT modülü - access token için temel konfigürasyon
    // Refresh token için stratejide ayrıca yapılandırılır
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // Access token gizli anahtarı
        secret: configService.get<string>('jwt.access.secret'),
        signOptions: {
          // Access token geçerlilik süresi: 15 dakika
          expiresIn: configService.get<string>('jwt.access.expiresIn') ?? '15m',
        },
      }),
      inject: [ConfigService],
    }),

    // Redis modülü - blacklist ve token saklama için
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    // ---- Servisler ----
    AuthService,

    // ---- JWT Stratejileri ----
    // Access token doğrulama stratejisi
    JwtStrategy,
    // Refresh token doğrulama stratejisi
    JwtRefreshStrategy,
    // Google OAuth2 stratejisi
    GoogleStrategy,
    // Apple Sign-In stratejisi
    AppleStrategy,

    // ---- Guard'lar ----
    // JWT token doğrulama guard'ı
    JwtAuthGuard,
    // Admin rolü kontrol guard'ı
    AdminGuard,
    // Genel rol kontrol guard'ı
    RolesGuard,
  ],
  exports: [
    // Diğer modüllerin kullanabilmesi için export edilenler
    AuthService,
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    AdminGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
