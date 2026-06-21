// ============================================================
// Belenay Mobilya - JWT Auth Guard
// Korumalı endpoint'lere erişimde JWT access token doğrular.
// @Public() decorator'ı ile işaretlenen endpoint'leri atlar.
// Kullanım: @UseGuards(JwtAuthGuard) veya global olarak
// ============================================================

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Endpoint'in @Public() ile işaretlenip işaretlenmediğini kontrol eder.
   * İşaretliyse kimlik doğrulamayı atlar.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // @Public() decorator'ı var mı kontrol et
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Herkese açık endpoint ise doğrulama gerekmez
    if (isPublic) {
      return true;
    }

    // JWT doğrulamasını çalıştır
    return super.canActivate(context);
  }

  /**
   * JWT doğrulama başarısız olduğunda hata mesajı özelleştirilir.
   */
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: { message?: string } | null,
  ): TUser {
    // Hata varsa veya kullanıcı bulunamadıysa
    if (err || !user) {
      // Token süresi dolmuş
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('Oturum süresi dolmuş, lütfen tekrar giriş yapınız');
      }
      // Token geçersiz
      if (info?.message === 'invalid token') {
        throw new UnauthorizedException('Geçersiz token, lütfen tekrar giriş yapınız');
      }
      // Token bulunamadı
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Kimlik doğrulama token\'ı bulunamadı');
      }
      throw err ?? new UnauthorizedException('Yetkisiz erişim');
    }
    return user;
  }
}
