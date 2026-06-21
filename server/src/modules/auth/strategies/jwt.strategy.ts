// ============================================================
// Belenay Mobilya - JWT Access Token Stratejisi
// Authorization header'daki Bearer token'ı doğrular.
// Geçerli token varsa payload'u request.user'a atar.
// @Public() decorator'ı ile korumasız endpoint'ler tanımlanır.
// ============================================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Token'ı Authorization: Bearer <token> header'ından çıkar
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Süresi dolmuş token'ları reddet
      ignoreExpiration: false,
      // Access token gizli anahtarı
      secretOrKey: configService.get<string>('jwt.access.secret'),
    });
  }

  /**
   * Token doğrulandıktan sonra çağrılır.
   * Blacklist kontrolü yapılır, kullanıcı bilgileri döndürülür.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Token blacklist'te mi kontrol et (logout yapılmış token'lar)
    const isBlacklisted = await this.authService.isTokenBlacklisted(payload.jti ?? '');
    if (isBlacklisted) {
      throw new UnauthorizedException('Token geçersiz kılınmış, lütfen tekrar giriş yapınız');
    }

    // Doğrulanmış payload'u request.user'a ata
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
