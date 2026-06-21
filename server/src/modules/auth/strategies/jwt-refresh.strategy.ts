// ============================================================
// Belenay Mobilya - JWT Refresh Token Stratejisi
// HttpOnly cookie'den refresh token'ı okur ve doğrular.
// Token rotation için kullanılır: geçerli refresh token
// varsa yeni access + refresh token çifti üretilir.
// ============================================================

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Refresh token'ı HttpOnly cookie'den çıkar
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Önce cookie'den oku
          const cookieToken = request?.cookies?.refreshToken;
          if (cookieToken) return cookieToken;

          // Cookie yoksa Authorization header'dan dene (mobil istemciler için)
          const authHeader = request?.headers?.authorization;
          if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }

          return null;
        },
      ]),
      // Süresi dolmuş token'ları reddet
      ignoreExpiration: false,
      // Refresh token gizli anahtarı (access'ten farklı!)
      secretOrKey: configService.get<string>('jwt.refresh.secret'),
      // Ham token'a erişim için request'i ilet
      passReqToCallback: true,
    });
  }

  /**
   * Refresh token doğrulandıktan sonra çağrılır.
   * Ham token controller'da DB kontrolü için gereklidir.
   */
  async validate(request: Request, payload: JwtPayload): Promise<{ refreshToken: string } & JwtPayload> {
    // Ham refresh token'ı çıkar
    const refreshToken =
      request.cookies?.refreshToken ??
      request.headers.authorization?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token bulunamadı');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      refreshToken,
    };
  }
}
