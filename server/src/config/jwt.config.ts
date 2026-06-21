// ============================================================
// Belenay Mobilya - JWT Yapılandırması
// Access Token ve Refresh Token için ayrı secret ve
// geçerlilik süreleri tanımlanır.
// ============================================================

import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  // ---- Access Token Ayarları ----
  access: {
    // Gizli anahtar
    secret: process.env.JWT_ACCESS_SECRET ?? 'belenay_access_secret_key_2024',
    // Geçerlilik süresi
    expiresIn: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  },
  // ---- Refresh Token Ayarları ----
  refresh: {
    // Gizli anahtar
    secret: process.env.JWT_REFRESH_SECRET ?? 'belenay_refresh_secret_key_2024',
    // Geçerlilik süresi
    expiresIn: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
}));
