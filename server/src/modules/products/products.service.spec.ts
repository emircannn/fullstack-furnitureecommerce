// ============================================================
// Belenay Mobilya — ProductsService Unit Testleri
// findAll, findBySlug, create, update, remove metodlarını test eder.
// Repository ve CacheService mock'lanır.
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CacheService } from '../redis/cache.service';

// ─── Mock Verileri ────────────────────────────────────────────────────────────
const mockProduct = {
  id: '1',
  slug: 'test-urun',
  price: 5000,
  stockQty: 10,
  categories: [],
  images: [],
  createdAt: new Date('2026-01-01'),
};

const mockProduct2 = {
  id: '2',
  slug: 'test-urun-2',
  price: 8000,
  stockQty: 0,
  categories: [],
  images: [],
  createdAt: new Date('2026-01-02'),
};

// ─── Repository Mock ──────────────────────────────────────────────────────────
const mockRepository = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// ─── CacheService Mock ────────────────────────────────────────────────────────
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  invalidatePattern: jest.fn(),
  getOrSet: jest.fn(),
};

// ─── QueryBuilder Mock ────────────────────────────────────────────────────────
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  // ─── findAll() ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('cache miss: DB den veri çeker ve cache e yazar', async () => {
      // getOrSet fetcher çağrıldığında QueryBuilder kullanır
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct, mockProduct2]);

      // getOrSet gerçekçi simülasyon: fetcher i çağır
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('kategori filtresi uygulanır', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );

      await service.findAll({ category: 'salon' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.slug = :categorySlug',
        { categorySlug: 'salon' },
      );
    });

    it('fiyat filtresi uygulanır', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );

      await service.findAll({ minPrice: 1000, maxPrice: 10000 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price >= :minPrice',
        { minPrice: 1000 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.price <= :maxPrice',
        { maxPrice: 10000 },
      );
    });

    it('fiyat artan sıralaması uygulanır', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );

      await service.findAll({ sortBy: 'price-asc' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('product.price', 'ASC');
    });
  });

  // ─── findOne() ────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('var olan ürünü döndürür', async () => {
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('1');
      expect(result).toEqual(mockProduct);
    });

    it('ürün bulunamazsa NotFoundException fırlatır', async () => {
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findBySlug() ─────────────────────────────────────────────────────────────
  describe('findBySlug()', () => {
    it('slug ile ürün döndürür', async () => {
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('test-urun');
      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-urun' },
        relations: ['categories', 'images'],
      });
    });

    it('slug bulunamazsa NotFoundException fırlatır', async () => {
      mockCacheService.getOrSet.mockImplementation(
        (_key: string, fetcher: () => Promise<any>) => fetcher(),
      );
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('yok-urun')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create() ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('ürün oluşturur ve cache i temizler', async () => {
      const createDto = { slug: 'yeni-urun', price: 3000 };
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: '3', ...createDto });
      mockCacheService.invalidatePattern.mockResolvedValue(1);

      const result = await service.create(createDto);
      expect(result).toMatchObject({ id: '3', slug: 'yeni-urun' });
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('products:*');
    });
  });

  // ─── update() ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('ürünü günceller ve ilgili cache keyleri temizler', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue({ ...mockProduct, price: 9999 });
      mockCacheService.del.mockResolvedValue(undefined);
      mockCacheService.invalidatePattern.mockResolvedValue(1);

      const result = await service.update('1', { price: 9999 });
      expect(result?.price).toBe(9999);
      expect(mockCacheService.del).toHaveBeenCalledWith('products:id:1');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('products:all');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('products:filtered:*');
    });

    it('ürün bulunamazsa NotFoundException fırlatır', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOne.mockResolvedValue(null);
      mockCacheService.del.mockResolvedValue(undefined);
      mockCacheService.invalidatePattern.mockResolvedValue(0);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove() ────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('ürünü siler ve cache i temizler', async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.remove.mockResolvedValue(mockProduct);
      mockCacheService.del.mockResolvedValue(undefined);
      mockCacheService.invalidatePattern.mockResolvedValue(1);

      const result = await service.remove('1');
      expect(result).toEqual(mockProduct);
      expect(mockCacheService.del).toHaveBeenCalledWith('products:id:1');
      expect(mockCacheService.del).toHaveBeenCalledWith('products:slug:test-urun');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('products:all');
    });

    it('ürün bulunamazsa NotFoundException fırlatır', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
