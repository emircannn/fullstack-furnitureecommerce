// ============================================================
// Belenay Mobilya - Kullanıcı Rol Enum'u
// Sisteme giriş yapan kullanıcıların rollerini tanımlar.
// CUSTOMER: Normal alışveriş yapan müşteri
// ADMIN: Yönetici paneline erişimi olan personel
// ============================================================

export enum Role {
  // Normal müşteri rolü - alışveriş yapabilir
  CUSTOMER = 'customer',
  // Yönetici rolü - tüm panel işlemlerine erişebilir
  ADMIN = 'admin',
}
