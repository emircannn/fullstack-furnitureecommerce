// ============================================================
// Belenay Mobilya - Throttler Behind Proxy Guard
// Uygulamanın bir proxy (nginx, Cloudflare) arkasında
// çalıştığı durumlarda gerçek istemci IP adresini doğru
// şekilde alır. X-Forwarded-For header'ını kullanır.
// ============================================================

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  /**
   * Proxy arkasındaki gerçek istemci IP'sini alır.
   * X-Forwarded-For header'ını kontrol eder.
   */
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    // Express request nesnesi olarak ele al
    const request = req as {
      ips?: string[];
      ip?: string;
      headers?: { 'x-forwarded-for'?: string; 'x-real-ip'?: string };
    };

    // 1. Express ile proxy güven ayarı yapıldıysa req.ips dizi olarak gelir
    if (request.ips && Array.isArray(request.ips) && request.ips.length > 0) {
      // En soldaki IP gerçek istemci IP'sidir
      return request.ips[0];
    }

    // 2. X-Forwarded-For header'ından al (virgülle ayrılmış liste)
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (forwardedFor) {
      // İlk IP adresi orijinal istemciye ait
      const firstIp = forwardedFor.split(',')[0].trim();
      return firstIp;
    }

    // 3. X-Real-IP header'ı (nginx gibi proxy'lerde)
    const realIp = request.headers?.['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // 4. Doğrudan bağlantı IP'si
    return request.ip ?? 'unknown';
  }
}
