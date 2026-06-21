// ============================================================
// Belenay Mobilya - Ortak TypeScript Tip Tanımlamaları
// Hem client hem de server tarafında kullanılan tipler burada
// tanımlanır. Değişiklikler her iki paketi de etkiler.
// ============================================================

// ---- Genel API Yanıt Tipi ----
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
}

// ---- Sayfalandırılmış Yanıt Tipi ----
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  statusCode: number;
  pagination: {
    total: number;       // Toplam kayıt sayısı
    page: number;        // Mevcut sayfa
    limit: number;       // Sayfa başına kayıt
    totalPages: number;  // Toplam sayfa sayısı
    hasNext: boolean;    // Sonraki sayfa var mı
    hasPrev: boolean;    // Önceki sayfa var mı
  };
}

// ---- Kullanıcı Rolleri ----
export enum Role {
  SUPER_ADMIN = 'super_admin', // Tam yetkili yönetici
  ADMIN = 'admin',             // Standart yönetici
  MANAGER = 'manager',         // Sipariş/stok yöneticisi
  USER = 'user',               // Standart müşteri
  GUEST = 'guest',             // Misafir kullanıcı
}

// ---- Sipariş Durumları ----
export enum OrderStatus {
  PENDING = 'pending',             // Beklemede
  CONFIRMED = 'confirmed',         // Onaylandı
  PROCESSING = 'processing',       // Hazırlanıyor
  SHIPPED = 'shipped',             // Kargoya verildi
  DELIVERED = 'delivered',         // Teslim edildi
  CANCELLED = 'cancelled',         // İptal edildi
  REFUNDED = 'refunded',           // İade edildi
  RETURNED = 'returned',           // Iade alındı
}

// ---- Ödeme Yöntemleri ----
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',     // Kredi kartı
  BANK_TRANSFER = 'bank_transfer', // Banka havalesi
  CASH_ON_DELIVERY = 'cash_on_delivery', // Kapıda ödeme
}

// ---- Ödeme Durumları ----
export enum PaymentStatus {
  PENDING = 'pending',     // Beklemede
  PAID = 'paid',           // Ödendi
  FAILED = 'failed',       // Başarısız
  REFUNDED = 'refunded',   // İade edildi
}

// ---- Ürün Durumları ----
export enum ProductStatus {
  ACTIVE = 'active',           // Aktif (satışta)
  INACTIVE = 'inactive',       // Pasif (satışta değil)
  OUT_OF_STOCK = 'out_of_stock', // Stokta yok
  DISCONTINUED = 'discontinued', // Üretimi durdu
}

// ---- Dil Kodları ----
export enum Locale {
  TR = 'tr', // Türkçe
  RU = 'ru', // Rusça
  KY = 'ky', // Kırgızca
}

// ---- Temel Kullanıcı Tipi ----
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Temel Ürün Tipi ----
export interface BaseProduct {
  id: string;
  slug: string;
  name: Record<Locale, string>;    // Çok dilli ürün adı
  description: Record<Locale, string>; // Çok dilli açıklama
  price: number;
  discountPrice: number | null;
  status: ProductStatus;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---- Temel Kategori Tipi ----
export interface BaseCategory {
  id: string;
  slug: string;
  name: Record<Locale, string>;    // Çok dilli kategori adı
  parentId: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

// ---- Sepet Kalemi Tipi ----
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  name: string;
  image: string;
}

// ---- Adres Tipi ----
export interface Address {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  zipCode?: string;
  addressLine: string;
  isDefault: boolean;
}

// ---- Sayfalandırma Sorgusu ----
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

// ---- Token Çifti ----
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ---- Tip Yardımcıları ----
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;

// ---- Blog Yazısı Durumları ----
export enum BlogStatus {
  DRAFT = 'draft',         // Taslak
  PUBLISHED = 'published', // Yayında
  ARCHIVED = 'archived',   // Arşivlendi
}

// ---- Bildirim Tipleri ----
export enum NotificationType {
  ORDER_UPDATE = 'order_update',   // Sipariş güncelleme
  PROMOTION = 'promotion',         // Kampanya bildirimi
  SYSTEM = 'system',               // Sistem bildirimi
  REVIEW = 'review',               // Yorum bildirimi
}
