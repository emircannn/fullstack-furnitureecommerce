// ============================================================
// Belenay Mobilya - Kimlik Doğrulama Sağlayıcı Enum'u
// Kullanıcının hangi platform üzerinden giriş yaptığını belirtir.
// LOCAL: Email/şifre ile, GOOGLE: Google OAuth2, APPLE: Apple Sign-In
// ============================================================

export enum Provider {
  // Yerel email ve şifre ile kimlik doğrulama
  LOCAL = 'local',
  // Google OAuth2 ile kimlik doğrulama
  GOOGLE = 'google',
  // Apple Sign-In ile kimlik doğrulama
  APPLE = 'apple',
}
