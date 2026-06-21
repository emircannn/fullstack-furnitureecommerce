// ============================================================
// Belenay Mobilya - Sipariş Durumu Enum
// ============================================================

export enum OrderStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Onay bekliyor
  APPROVED = 'APPROVED',                 // Onaylandı
  PREPARING = 'PREPARING',               // Hazırlanıyor
  SHIPPED = 'SHIPPED',                   // Kargoya verildi
  COMPLETED = 'COMPLETED',               // Tamamlandı
  CANCELLED = 'CANCELLED',               // İptal edildi
}
