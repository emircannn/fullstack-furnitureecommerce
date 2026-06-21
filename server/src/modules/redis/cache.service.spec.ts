// ============================================================
// Belenay Mobilya — CacheService Unit Testleri
// get/set/del/invalidatePattern/getOrSet/ping metodlarını test eder.
// Redis istemcisi mock'lanır.
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

// ─── Redis Mock ───────────────────────────────────────────────────────────────
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  scan: jest.fn(),
  ping: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    jest.clearAllMocks();
  });

  // ─── get() ───────────────────────────────────────────────────────────────────
  describe('get()', () => {
    it('cache hit: JSON parse edilmiş değeri döndürür', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ id: 1, name: 'Test' }));
      const result = await service.get<{ id: number; name: string }>('test:key');
      expect(result).toEqual({ id: 1, name: 'Test' });
      expect(mockRedis.get).toHaveBeenCalledWith('test:key');
    });

    it('cache miss: null döndürür', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await service.get('test:key');
      expect(result).toBeNull();
    });

    it('Redis hatası olduğunda null döndürür (graceful degradation)', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection error'));
      const result = await service.get('test:key');
      expect(result).toBeNull();
    });
  });

  // ─── set() ───────────────────────────────────────────────────────────────────
  describe('set()', () => {
    it('değeri JSON olarak serialize edip setex ile kaydeder', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      await service.set('test:key', { id: 1 }, 300);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        300,
        JSON.stringify({ id: 1 }),
      );
    });

    it('varsayılan TTL ile çalışır (MEDIUM = 300s)', async () => {
      mockRedis.setex.mockResolvedValue('OK');
      await service.set('test:key', 'data');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        CacheService.TTL.MEDIUM,
        JSON.stringify('data'),
      );
    });

    it('Redis hatası olduğunda exception fırlatmaz', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));
      await expect(service.set('test:key', 'data')).resolves.not.toThrow();
    });
  });

  // ─── del() ───────────────────────────────────────────────────────────────────
  describe('del()', () => {
    it('belirtilen key i siler', async () => {
      mockRedis.del.mockResolvedValue(1);
      await service.del('test:key');
      expect(mockRedis.del).toHaveBeenCalledWith('test:key');
    });

    it('Redis hatası olduğunda exception fırlatmaz', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));
      await expect(service.del('test:key')).resolves.not.toThrow();
    });
  });

  // ─── invalidatePattern() ──────────────────────────────────────────────────────
  describe('invalidatePattern()', () => {
    it('pattern ile eşleşen keyleri SCAN ile bulup siler', async () => {
      // İlk scan: cursor 0 → cursor '10', 2 key
      // İkinci scan: cursor '10' → cursor '0', 1 key (bitti)
      mockRedis.scan
        .mockResolvedValueOnce(['10', ['products:1', 'products:2']])
        .mockResolvedValueOnce(['0', ['products:3']]);
      mockRedis.del.mockResolvedValue(3);

      const count = await service.invalidatePattern('products:*');
      expect(count).toBe(3);
      expect(mockRedis.del).toHaveBeenCalledWith('products:1', 'products:2', 'products:3');
    });

    it('eşleşen key bulunamazsa 0 döndürür', async () => {
      mockRedis.scan.mockResolvedValue(['0', []]);
      const count = await service.invalidatePattern('nonexistent:*');
      expect(count).toBe(0);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  // ─── getOrSet() ───────────────────────────────────────────────────────────────
  describe('getOrSet()', () => {
    it('cache hit: fetcher çağrılmaz', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ id: 1 }));
      const fetcher = jest.fn();
      const result = await service.getOrSet('test:key', fetcher, 300);
      expect(result).toEqual({ id: 1 });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('cache miss: fetcher çağrılır ve sonuç cache e yazılır', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');
      const fetcher = jest.fn().mockResolvedValue({ id: 2, name: 'Fresh' });

      const result = await service.getOrSet('test:key', fetcher, 300);
      expect(result).toEqual({ id: 2, name: 'Fresh' });
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:key',
        300,
        JSON.stringify({ id: 2, name: 'Fresh' }),
      );
    });

    it('fetcher exception fırlatırsa exception propagate edilir', async () => {
      mockRedis.get.mockResolvedValue(null);
      const fetcher = jest.fn().mockRejectedValue(new Error('DB error'));
      await expect(service.getOrSet('test:key', fetcher)).rejects.toThrow('DB error');
    });
  });

  // ─── ping() ──────────────────────────────────────────────────────────────────
  describe('ping()', () => {
    it('Redis bağlantısı sağlıklıysa true döndürür', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      const result = await service.ping();
      expect(result).toBe(true);
    });

    it('Redis bağlantısı yoksa false döndürür', async () => {
      mockRedis.ping.mockRejectedValue(new Error('ECONNREFUSED'));
      const result = await service.ping();
      expect(result).toBe(false);
    });
  });

  // ─── TTL Sabitleri ────────────────────────────────────────────────────────────
  describe('TTL sabitleri', () => {
    it('doğru değerlere sahip', () => {
      expect(CacheService.TTL.SHORT).toBe(60);
      expect(CacheService.TTL.MEDIUM).toBe(300);
      expect(CacheService.TTL.LONG).toBe(3600);
      expect(CacheService.TTL.VERY_LONG).toBe(86400);
    });
  });
});
