// ============================================================
// Belenay Mobilya - Redis Modülü
// ioredis tabanlı Redis bağlantısını global provider olarak
// sunar. Auth, cache ve throttling için kullanılır.
// REDIS_CLIENT token'ı ile inject edilebilir.
// ============================================================

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

/**
 * Redis istemcisi factory'si.
 * ConfigService üzerinden host ve port alır.
 */
const redisClientFactory = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService): Redis => {
    const client = new Redis({
      // Redis sunucu adresi
      host: configService.get<string>('redis.host') ?? 'localhost',
      // Redis port numarası
      port: configService.get<number>('redis.port') ?? 6379,
      // Bağlantı hatalarında yeniden deneme stratejisi
      retryStrategy: (times: number) => {
        if (times > 5) {
          // 5 denemeden sonra yeniden denemeyi bırak
          return null;
        }
        // Her denemede 2 saniye bekle
        return 2000;
      },
      // Bağlantı zaman aşımı
      connectTimeout: 10000,
      // Komut zaman aşımı
      commandTimeout: 5000,
      // Lazy connect - ilk komutta bağlan
      lazyConnect: true,
    });

    // Bağlantı hatalarını sadece bir kez uyarı olarak logla (konsol kirliliğini önlemek için)
    let errorLogged = false;
    client.on('error', (error: Error) => {
      if (!errorLogged) {
        console.warn('Redis bağlantı hatası: Redis sunucusu aktif değil (In-memory fallback kullanılacak):', error.message);
        errorLogged = true;
      }
    });

    client.on('connect', () => {
      console.log('Redis bağlantısı kuruldu');
    });

    return client;
  },
  inject: [ConfigService],
};

@Global() // Tüm modüllerde inject edilebilir
@Module({
  providers: [redisClientFactory, CacheService],
  exports: ['REDIS_CLIENT', CacheService],
})
export class RedisModule {}
