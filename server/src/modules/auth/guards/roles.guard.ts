// ============================================================
// Belenay Mobilya - Roles Guard
// @Roles() decorator'ı ile belirtilen rollere sahip
// kullanıcıların endpoint'e erişmesine izin verir.
// Kullanım: @Roles(Role.ADMIN, Role.CUSTOMER) + @UseGuards(JwtAuthGuard, RolesGuard)
// ============================================================

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Endpoint için gerekli rolleri kontrol eder.
   * Hiç rol belirtilmemişse erişime izin verir.
   */
  canActivate(context: ExecutionContext): boolean {
    // Endpoint veya controller'da tanımlı gerekli rolleri al
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rol kısıtlaması yoksa erişime izin ver
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    // Kullanıcı yoksa kimlik doğrulama hatası
    if (!user) {
      throw new UnauthorizedException('Bu işlem için giriş yapmanız gerekmektedir');
    }

    // Kullanıcının rolü gerekli roller arasında mı?
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Bu işlem için ${requiredRoles.join(' veya ')} rolüne ihtiyacınız var`,
      );
    }

    return true;
  }
}
