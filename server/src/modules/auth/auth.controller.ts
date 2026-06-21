// ============================================================
// Belenay Mobilya - Auth Controller
// Kimlik doğrulama endpoint'leri:
//   POST /api/auth/register   - Yeni kayıt
//   POST /api/auth/login      - Giriş (throttle: 5/dk)
//   POST /api/auth/refresh    - Token yenileme
//   POST /api/auth/logout     - Çıkış
//   GET  /api/auth/google     - Google OAuth başlat
//   GET  /api/auth/google/callback - Google callback
//   GET  /api/auth/me         - Mevcut kullanıcı bilgisi
// Refresh token HttpOnly cookie olarak set edilir.
// ============================================================

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

// ---- Refresh token cookie ayarları ----
const REFRESH_COOKIE_OPTIONS = {
  // JavaScript'in cookie'ye erişimini engeller (XSS koruması)
  httpOnly: true,
  // Sadece HTTPS üzerinden gönder (production'da)
  secure: process.env.NODE_ENV === 'production',
  // CSRF saldırılarına karşı koruma
  sameSite: 'lax' as const,
  // 7 gün geçerli (milisaniye)
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // Cookie path'i
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ================================================================
  // KAYIT
  // ================================================================

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla kaydedildi' })
  @ApiResponse({ status: 409, description: 'Bu e-posta zaten kullanılmaktadır' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, tokens } = await this.authService.register(registerDto);

    // Refresh token'ı HttpOnly cookie olarak set et
    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      user,
      // Sadece access token body'de döner
      accessToken: tokens.accessToken,
    };
  }

  // ================================================================
  // GİRİŞ (Rate limit: 5 istek/dakika)
  // ================================================================

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  // Giriş endpoint'i için sıkı rate limiting (brute force koruması)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Email ve şifre ile giriş' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Başarıyla giriş yapıldı' })
  @ApiResponse({ status: 401, description: 'Hatalı email veya şifre' })
  @ApiResponse({ status: 429, description: 'Çok fazla istek, lütfen bekleyiniz' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, tokens } = await this.authService.login(loginDto);

    // Refresh token'ı HttpOnly cookie olarak set et
    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      user,
      accessToken: tokens.accessToken,
    };
  }

  // ================================================================
  // TOKEN YENİLEME
  // ================================================================

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh token ile yeni access token al' })
  @ApiResponse({ status: 200, description: 'Token başarıyla yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token' })
  async refresh(
    @Req() request: Request & { user: JwtPayload & { refreshToken: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sub: userId, refreshToken } = request.user;

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    // Yeni refresh token'ı cookie olarak set et (token rotation)
    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      accessToken: tokens.accessToken,
    };
  }

  // ================================================================
  // ÇIKIŞ
  // ================================================================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Çıkış yap (token geçersizleştirilir)' })
  @ApiResponse({ status: 200, description: 'Başarıyla çıkış yapıldı' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Authorization header'dan access token'ı al
    const accessToken = request.headers.authorization?.replace('Bearer ', '') ?? '';

    // Logout işlemini gerçekleştir (blacklist + refresh token silme)
    await this.authService.logout(user.sub, accessToken);

    // Refresh token cookie'sini temizle
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Başarıyla çıkış yapıldı' };
  }

  // ================================================================
  // GOOGLE OAuth - Başlat
  // ================================================================

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 ile giriş başlat' })
  @ApiResponse({ status: 302, description: 'Google giriş sayfasına yönlendirildi' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleAuth(@Req() _req: Request) {
    // Passport google strategy bu noktada Google'a yönlendirir
    // Bu metod body ile hiçbir şey döndürmez
  }

  // ================================================================
  // GOOGLE OAuth - Callback
  // ================================================================

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback - giriş tamamla' })
  async googleAuthCallback(
    @Req() request: Request & { user: OAuthCallbackDto },
    @Res() response: Response,
  ) {
    const { user, tokens } = await this.authService.googleAuth(request.user);

    // Refresh token cookie olarak set et
    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    // Kullanıcıyı frontend'e yönlendir (access token query param olarak)
    // Production'da daha güvenli bir yöntem kullanılmalıdır
    const frontendUrl =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000';
    response.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }

  // ================================================================
  // APPLE Sign-In - Başlat
  // ================================================================

  @Get('apple')
  @Public()
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple Sign-In ile giriş başlat' })
  @ApiResponse({ status: 302, description: 'Apple giriş sayfasına yönlendirildi' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appleAuth(@Req() _req: Request) {
    // Passport apple strategy bu noktada Apple'a yönlendirir
  }

  // ================================================================
  // APPLE Sign-In - Callback
  // ================================================================

  @Post('apple/callback')
  @Public()
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple Sign-In callback - giriş tamamla' })
  async appleAuthCallback(
    @Req() request: Request & { user: OAuthCallbackDto },
    @Res() response: Response,
  ) {
    const { user, tokens } = await this.authService.appleAuth(request.user);

    // Refresh token'ı cookie olarak set et
    response.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    const frontendUrl =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000';
    response.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}`,
    );
  }

  // ================================================================
  // MEVCUt KULLANICI BİLGİSİ
  // ================================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Giriş yapan kullanıcının bilgilerini al' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bilgileri' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getMe(@CurrentUser() user: JwtPayload) {
    // JWT payload'dan kullanıcı bilgileri döndürülür
    // Detaylı bilgi için UsersService'e delegate edilebilir
    return {
      id: user.sub,
      email: user.email,
      role: user.role,
    };
  }
}
