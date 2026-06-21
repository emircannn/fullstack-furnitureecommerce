// ============================================================
// Belenay Mobilya — CacheService
// Redis üzerinde get/set/del/invalidatePattern işlemleri için
// merkezi bir servis. JSON serialize/deserialize yapar.
// ============================================================

import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // Varsayılan TTL değerleri (saniye)
  static readonly TTL = {
    SHORT: 60,         // 1 dakika — sıklıkla değişen veri
    MEDIUM: 300,       // 5 dakika — kategori, ürün listesi
    LONG: 3600,        // 1 saat — slider, ayarlar, statik içerik
    VERY_LONG: 86400,  // 24 saat — blog yazıları
  } as const;

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  /**
   * Cache'den veri al. Bulunamazsa null döner.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache GET hatası [${key}]: ${err}`);
      return null;
    }
  }

  /**
   * Cache'e veri yaz. ttl saniye cinsinden.
   */
  async set(key: string, value: unknown, ttl: number = CacheService.TTL.MEDIUM): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache SET hatası [${key}]: ${err}`);
    }
  }

  /**
   * Belirtilen key'i sil.
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Cache DEL hatası [${key}]: ${err}`);
    }
  }

  /**
   * Pattern ile eşleşen tüm key'leri sil. (örn: "products:*")
   * Dikkat: KEYS komutu production'da büyük veri setlerinde yavaş çalışır.
   * SCAN kullanılarak güvenli hale getirilmiştir.
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys: string[] = [];
      let cursor = '0';

      do {
        const [nextCursor, foundKeys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Cache invalidate: ${keys.length} key silindi (${pattern})`);
      }
      return keys.length;
    } catch (err) {
      this.logger.warn(`Cache invalidatePattern hatası [${pattern}]: ${err}`);
      return 0;
    }
  }

  /**
   * Cache-aside pattern: Yoksa DB'den getir, cache'e yaz.
   * @param key Cache anahtarı
   * @param fetcher Veriyi DB'den çeken async fonksiyon
   * @param ttl Saniye cinsinden yaşam süresi
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CacheService.TTL.MEDIUM,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  /**
   * Redis bağlantısı sağlıklı mı kontrol eder.
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
