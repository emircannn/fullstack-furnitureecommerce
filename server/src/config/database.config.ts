// ============================================================
// Belenay Mobilya - Veritabanı Yapılandırması
// MySQL bağlantı ayarları ortam değişkenlerinden okunur.
// TypeORM DataSource ve NestJS ConfigModule için kullanılır.
// ============================================================

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // MySQL sunucu adresi
  host: process.env.DB_HOST ?? 'localhost',
  // MySQL port numarası
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  // Veritabanı adı
  name: process.env.DB_NAME ?? 'belenaymebel',
  // Kullanıcı adı
  username: process.env.DB_USER ?? 'root',
  // Şifre
  password: process.env.DB_PASSWORD ?? '',
}));
