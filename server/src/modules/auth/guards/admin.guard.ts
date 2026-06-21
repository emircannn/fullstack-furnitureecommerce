// ============================================================
// Belenay Mobilya - Admin Guard
// Sadece ADMIN rolüne sahip kullanıcıların erişebileceği
// endpoint'leri korur. JwtAuthGuard'dan sonra çalışır.
// Kullanım: @UseGuards(JwtAuthGuard, AdminGuard)
// ============================================================

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Request'teki kullanıcının ADMIN rolüne sahip olup olmadığını kontrol eder.
   * JwtAuthGuard zaten kullanıcıyı request'e eklemiş olmalıdır.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    // Kullanıcı yoksa kimlik doğrulama hatası
    if (!user) {
      throw new UnauthorizedException('Bu işlem için giriş yapmanız gerekmektedir');
    }

    // Admin rolü kontrolü
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Bu işlem için yönetici yetkisine sahip olmanız gerekmektedir',
      );
    }

    return true;
  }
}
