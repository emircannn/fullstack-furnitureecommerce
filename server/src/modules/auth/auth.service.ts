// ============================================================
// Belenay Mobilya - Auth Service
// Kayıt, giriş, OAuth, token yenileme ve çıkış işlemlerini
// gerçekleştirir. Redis blacklist ve token rotation içerir.
// Bcrypt ile şifre hash (12 rounds), JWT çifti üretimi yapılır.
// ============================================================

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from './enums/role.enum';
import { Provider } from './enums/provider.enum';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { AuthProvider } from '../users/enums/auth-provider.enum';

// ---- Bcrypt salt rounds sabiti ----
const BCRYPT_SALT_ROUNDS = 12;

// ---- Token süre sabitleri ----
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 gün (saniye)
const BLACKLIST_TTL_SECONDS = 15 * 60; // 15 dakika (access token ömrü)

// ---- Token çifti arayüzü ----
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ---- Kullanıcı yanıt arayüzü ----
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  provider: Provider;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Redis kapalıyken kullanılacak in-memory blacklist
  private readonly memoryBlacklist = new Set<string>();

  constructor(
    // Redis istemcisi (ioredis) - blacklist için (opsiyonel)
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,

    // JWT servis - token üretimi ve doğrulama
    private readonly jwtService: JwtService,

    // Yapılandırma servisi - gizli anahtarlar
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // ================================================================
  // KAYIT (REGISTER)
  // ================================================================

  /**
   * Yeni kullanıcı kaydı oluşturur.
   * Şifreyi bcrypt ile 12 rounds hash'ler.
   * Email benzersizliğini kontrol eder.
   */
  async register(dto: RegisterDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    // E-posta zaten kayıtlı mı kontrol et
    const existingUser = await this.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılmaktadır');
    }

    // Şifreyi güvenli şekilde hash'le (12 rounds)
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    try {
      // Yeni kullanıcı oluştur
      const userEntity = this.userRepository.create({
        name: dto.name,
        email: dto.email,
        passwordHash: hashedPassword,
        provider: AuthProvider.LOCAL,
        role: UserRole.CUSTOMER,
        isActive: true,
      } as any) as unknown as User;

      const savedUser = await this.userRepository.save(userEntity);

      const newUser: AuthUser = {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: Role.CUSTOMER,
        provider: Provider.LOCAL,
      };

      // Token çiftini üret
      const tokens = await this.generateTokens(newUser.id, newUser.role, newUser.email);

      // Refresh token'ı veritabanına kaydet (hash'lenmiş)
      await this.saveRefreshToken(newUser.id, tokens.refreshToken);

      this.logger.log(`Yeni kullanıcı kaydedildi: ${dto.email}`);
      return { user: newUser, tokens };
    } catch (error) {
      this.logger.error(`Kayıt hatası: ${dto.email}`, error);
      throw new InternalServerErrorException('Kullanıcı oluşturulurken bir hata oluştu');
    }
  }

  // ================================================================
  // GİRİŞ (LOGIN)
  // ================================================================

  /**
   * Email ve şifre ile kullanıcı girişi yapar.
   * Şifreyi bcrypt ile karşılaştırır.
   */
  async login(dto: LoginDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    // Kullanıcıyı email ile bul
    const user = await this.findUserByEmail(dto.email);
    if (!user) {
      // Timing saldırısını önlemek için sahte hash karşılaştırması yap
      await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Kullanıcının yerel hesabı var mı kontrol et
    if (user.provider.toLowerCase() !== Provider.LOCAL.toLowerCase()) {
      throw new BadRequestException(
        `Bu hesap ${user.provider} ile bağlantılıdır. Lütfen ${user.provider} ile giriş yapınız`,
      );
    }

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(dto.password, user.hashedPassword ?? '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Token çiftini üret
    const tokens = await this.generateTokens(user.id, user.role, user.email);

    // Refresh token'ı veritabanına kaydet
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Kullanıcı giriş yaptı: ${dto.email}`);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider,
      },
      tokens,
    };
  }

  // ================================================================
  // GOOGLE OAuth
  // ================================================================

  /**
   * Google OAuth2 callback'inden gelen bilgilerle kullanıcı
   * bul veya oluştur (find-or-create pattern).
   */
  async googleAuth(dto: OAuthCallbackDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    // Google providerId ile kullanıcıyı ara
    let user = await this.findUserByProviderId(dto.provider, dto.providerId);

    if (!user) {
      // Email ile de ara (farklı provider ile kayıtlı olabilir)
      const existingByEmail = await this.findUserByEmail(dto.email);

      if (existingByEmail) {
        // Mevcut hesaba Google bağla
        const dbUser = await this.userRepository.findOne({ where: { id: existingByEmail.id } });
        if (dbUser) {
          dbUser.provider = AuthProvider.GOOGLE;
          dbUser.providerId = dto.providerId;
          await this.userRepository.save(dbUser);
        }
        user = {
          ...existingByEmail,
          provider: Provider.GOOGLE,
        };
      } else {
        // Yeni kullanıcı oluştur
        const userEntity = this.userRepository.create({
          name: dto.name,
          email: dto.email,
          provider: AuthProvider.GOOGLE,
          providerId: dto.providerId,
          role: UserRole.CUSTOMER,
          isActive: true,
        } as any) as unknown as User;
        const savedUser = await this.userRepository.save(userEntity);
        user = {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          role: Role.CUSTOMER,
          provider: Provider.GOOGLE,
        };
      }
    }

    // Token çiftini üret
    const tokens = await this.generateTokens(user.id, user.role, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Google OAuth girişi: ${dto.email}`);
    return { user, tokens };
  }

  // ================================================================
  // APPLE Sign-In
  // ================================================================

  /**
   * Apple callback'inden gelen bilgilerle kullanıcı bul veya oluştur.
   */
  async appleAuth(dto: OAuthCallbackDto): Promise<{ user: AuthUser; tokens: TokenPair }> {
    let user = await this.findUserByProviderId(dto.provider, dto.providerId);

    if (!user) {
      const existingByEmail = await this.findUserByEmail(dto.email);

      if (existingByEmail) {
        const dbUser = await this.userRepository.findOne({ where: { id: existingByEmail.id } });
        if (dbUser) {
          dbUser.provider = AuthProvider.APPLE;
          dbUser.providerId = dto.providerId;
          await this.userRepository.save(dbUser);
        }
        user = {
          ...existingByEmail,
          provider: Provider.APPLE,
        };
      } else {
        const userEntity = this.userRepository.create({
          name: dto.name,
          email: dto.email,
          provider: AuthProvider.APPLE,
          providerId: dto.providerId,
          role: UserRole.CUSTOMER,
          isActive: true,
        } as any) as unknown as User;
        const savedUser = await this.userRepository.save(userEntity);
        user = {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          role: Role.CUSTOMER,
          provider: Provider.APPLE,
        };
      }
    }

    const tokens = await this.generateTokens(user.id, user.role, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Apple Sign-In girişi: ${dto.email}`);
    return { user, tokens };
  }

  // ================================================================
  // TOKEN YENİLEME (REFRESH)
  // ================================================================

  /**
   * Refresh token ile yeni access + refresh token çifti üretir.
   * Token rotation: eski refresh token geçersizleştirilir.
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<TokenPair> {
    // Veritabanındaki hash'lenmiş refresh token'ı al
    const storedHash = await this.getStoredRefreshTokenHash(userId);
    if (!storedHash) {
      throw new UnauthorizedException('Geçersiz refresh token, lütfen tekrar giriş yapınız');
    }

    // Gelen token ile saklanan hash'i karşılaştır
    const isValid = await bcrypt.compare(refreshToken, storedHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token geçersiz veya kullanılmış');
    }

    // Kullanıcıyı bul
    const user = await this.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Yeni token çifti üret (token rotation)
    const tokens = await this.generateTokens(user.id, user.role, user.email);

    // Eski refresh token'ı geçersizleştir, yenisini kaydet
    await this.saveRefreshToken(userId, tokens.refreshToken);

    this.logger.log(`Token yenilendi: ${userId}`);
    return tokens;
  }

  // ================================================================
  // ÇIKIŞ (LOGOUT)
  // ================================================================

  /**
   * Kullanıcı çıkışında:
   * 1. Refresh token'ı veritabanından siler
   * 2. Access token'ı Redis veya in-memory blacklist'e ekler
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    // Refresh token'ı veritabanından sil
    await this.removeRefreshToken(userId);

    // Access token'ı blacklist'e ekle
    if (accessToken) {
      try {
        // Token'ın kalan ömrünü hesapla
        const decoded = this.jwtService.decode(accessToken) as JwtPayload & { exp: number; jti: string };
        const jti = decoded?.jti;

        if (jti) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;

          if (ttl > 0) {
            try {
              // Redis'e blacklist anahtarı olarak eklemeyi dene
              const blacklistKey = `blacklist:token:${jti}`;
              await this.redisClient.setex(blacklistKey, ttl, '1');
            } catch (redisError: any) {
              this.logger.warn(`Redis'e blacklist eklenemedi, in-memory kullanılıyor: ${redisError.message}`);
              // Fallback: in-memory set
              this.memoryBlacklist.add(jti);
              // Süresi dolduğunda in-memory setten temizle
              setTimeout(() => {
                this.memoryBlacklist.delete(jti);
              }, ttl * 1000);
            }
          }
        }
      } catch (error) {
        // Token decode edilemese de çıkışa devam et
        this.logger.warn(`Logout sırasında token decode hatası: ${userId}`);
      }
    }

    this.logger.log(`Kullanıcı çıkış yaptı: ${userId}`);
  }

  // ================================================================
  // TOKEN ÜRETİMİ
  // ================================================================

  /**
   * Access token (15 dk) ve refresh token (7 gün) çifti üretir.
   * Her token'a benzersiz JTI (JWT ID) atanır.
   */
  async generateTokens(userId: string, role: Role, email: string): Promise<TokenPair> {
    // Benzersiz token kimliği (blacklist için)
    const jti = uuidv4();

    // JWT payload
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      jti,
    };

    // Access token ve refresh token'ı paralel üret
    const [accessToken, refreshToken] = await Promise.all([
      // Access token - 15 dakika
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.access.secret'),
        expiresIn: this.configService.get<string>('jwt.access.expiresIn') ?? ACCESS_TOKEN_TTL,
      }),
      // Refresh token - 7 gün
      this.jwtService.signAsync(
        { sub: userId, email, role, jti: uuidv4() },
        {
          secret: this.configService.get<string>('jwt.refresh.secret'),
          expiresIn: this.configService.get<string>('jwt.refresh.expiresIn') ?? REFRESH_TOKEN_TTL,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // ================================================================
  // REFRESH TOKEN SAKLAMA
  // ================================================================

  /**
   * Refresh token'ı bcrypt ile hash'leyerek VERİTABANINA kaydeder.
   * Redis bağlantı hatalarından etkilenmez.
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // Önce kullanıcının eski token'larını temizle (token rotation)
      await this.refreshTokenRepository.delete({ userId });

      // Refresh token'ı bcrypt ile hash'le
      const hash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli

      const tokenEntity = this.refreshTokenRepository.create({
        userId,
        token: hash,
        expiresAt,
        isRevoked: false,
      });

      await this.refreshTokenRepository.save(tokenEntity);
    } catch (error: any) {
      this.logger.error(`Refresh token veritabanına kaydedilirken hata: ${error.message}`);
      throw new InternalServerErrorException('Giriş işlemi gerçekleştirilemedi');
    }
  }

  // ================================================================
  // BLACKLİST KONTROLÜ
  // ================================================================

  /**
   * Verilen JTI'nin blacklist'te olup olmadığını kontrol eder.
   * Redis down ise in-memory blacklist kontrolü yapar.
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    if (!jti) return false;

    // Önce in-memory blacklist'te var mı kontrol et
    if (this.memoryBlacklist.has(jti)) {
      return true;
    }

    // Redis bağlantısını kontrol ederek sorgula
    try {
      const key = `blacklist:token:${jti}`;
      const value = await this.redisClient.get(key);
      return value !== null;
    } catch (redisError: any) {
      this.logger.debug(`Redis'ten blacklist okunamadı, in-memory fallback kullanılıyor: ${redisError.message}`);
      return false;
    }
  }

  // ================================================================
  // ÖZEL YARDIMCI METODLAR
  // ================================================================

  /**
   * Email ile kullanıcı bul (veritabanından sorgulanır)
   */
  private async findUserByEmail(email: string): Promise<(AuthUser & { hashedPassword?: string }) | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as any,
      provider: user.provider.toLowerCase() as any,
      hashedPassword: user.passwordHash ?? undefined,
    };
  }

  /**
   * ID ile kullanıcı bul
   */
  private async findUserById(id: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as any,
      provider: user.provider.toLowerCase() as any,
    };
  }

  /**
   * OAuth providerId ile kullanıcı bul
   */
  private async findUserByProviderId(provider: Provider, providerId: string): Promise<AuthUser | null> {
    const user = await this.userRepository.findOne({
      where: { provider: provider.toUpperCase() as any, providerId },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase() as any,
      provider: user.provider.toLowerCase() as any,
    };
  }

  /**
   * Kullanıcının sakladığı refresh token hash'ini VERİTABANINDAN al
   */
  private async getStoredRefreshTokenHash(userId: string): Promise<string | null> {
    try {
      const tokenEntity = await this.refreshTokenRepository.findOne({
        where: { userId, isRevoked: false },
        order: { createdAt: 'DESC' },
      });
      return tokenEntity ? tokenEntity.token : null;
    } catch (error: any) {
      this.logger.error(`Refresh token veritabanından alınırken hata: ${error.message}`);
      return null;
    }
  }

  /**
   * Kullanıcının refresh token'ını VERİTABANINDAN sil
   */
  private async removeRefreshToken(userId: string): Promise<void> {
    try {
      await this.refreshTokenRepository.delete({ userId });
    } catch (error: any) {
      this.logger.error(`Refresh token veritabanından silinirken hata: ${error.message}`);
    }
  }
}
