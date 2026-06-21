// ============================================================
// Belenay Mobilya - Redis Yapılandırması
// Oturum önbelleği, rate limiting ve geçici veri depolama
// için kullanılan Redis bağlantı ayarları.
// ============================================================

import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // Redis sunucu adresi
  host: process.env.REDIS_HOST ?? 'localhost',
  // Redis port numarası
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  // Varsayılan TTL süresi (saniye)
  defaultTtl: 60 * 60, // 1 saat
  // Önbellek anahtar öneki
  keyPrefix: 'belenay:',
}));
