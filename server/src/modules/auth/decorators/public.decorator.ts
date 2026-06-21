// ============================================================
// Belenay Mobilya - @Public() Decorator
// JWT doğrulamasından muaf tutulacak endpoint'leri işaretler.
// JwtAuthGuard bu metadata'yı okur ve doğrulamayı atlar.
// Kullanım: @Public() + controller veya method üzerine ekle
// ============================================================

import { SetMetadata } from '@nestjs/common';

// Metadata anahtarı (JwtAuthGuard ile paylaşılır)
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Endpoint'i kimlik doğrulamadan muaf tutar.
 * Global JwtAuthGuard aktif olsa bile bu endpoint herkese açıktır.
 *
 * @example
 * @Public()
 * @Get('products')
 * getProducts() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
