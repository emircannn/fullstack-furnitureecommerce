// ============================================================
// Belenay Mobilya - @Roles() Decorator
// Endpoint veya controller için gerekli rolleri belirtir.
// RolesGuard ile birlikte kullanılır.
// Kullanım: @Roles(Role.ADMIN) veya @Roles(Role.ADMIN, Role.CUSTOMER)
// ============================================================

import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Metadata anahtarı (RolesGuard ile paylaşılır)
export const ROLES_KEY = 'roles';

/**
 * Endpoint için gerekli rolleri belirtir.
 * RolesGuard bu metadata'yı okur ve kullanıcının rolünü karşılaştırır.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * deleteProduct() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
