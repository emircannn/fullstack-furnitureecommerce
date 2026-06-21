// ============================================================
// Belenay Mobilya - JWT Payload Arayüzü
// Access token ve refresh token içindeki veri yapısını tanımlar.
// ============================================================

import { Role } from '../enums/role.enum';

export interface JwtPayload {
  // Kullanıcının veritabanındaki benzersiz kimliği (subject)
  sub: string;
  // Kullanıcının e-posta adresi
  email: string;
  // Kullanıcının sistem rolü
  role: Role;
  // JWT Token ID - blacklist kontrolü için (isteğe bağlı)
  jti?: string;
  // Token oluşturulma zamanı (Unix timestamp)
  iat?: number;
  // Token son geçerlilik zamanı (Unix timestamp)
  exp?: number;
}
