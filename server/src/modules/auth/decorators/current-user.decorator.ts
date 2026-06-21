// ============================================================
// Belenay Mobilya - @CurrentUser() Decorator
// Controller metodlarında JWT'den doğrulanmış kullanıcı
// bilgilerine kolayca erişmek için kullanılır.
// Kullanım: async getMe(@CurrentUser() user: JwtPayload)
// ============================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Request nesnesindeki doğrulanmış kullanıcıyı döndürür.
 * JwtAuthGuard ile birlikte kullanılmalıdır.
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    // Belirli bir alan isteniyorsa sadece onu döndür
    // Örnek: @CurrentUser('sub') sadece userId döndürür
    if (data) {
      return user?.[data];
    }

    // Tüm kullanıcı nesnesini döndür
    return user;
  },
);
