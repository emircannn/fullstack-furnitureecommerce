// ============================================================
// Belenay Mobilya — ProductsService (Redis Cache eklenmiş)
// findAll ve findBySlug için cache-aside stratejisi.
// Yazma işlemlerinde ilgili cache anahtarları temizlenir.
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductImage } from './entities/product-image.entity';
import { Discount } from '../discounts/entities/discount.entity';
import { CacheService } from '../redis/cache.service';
import { slugify } from '../../common/utils/slugify';

// Cache key fabrikası
const KEYS = {
  all: () => 'products:all',
  byId: (id: string | number) => `products:id:${id}`,
  bySlug: (slug: string) => `products:slug:${slug}`,
  filtered: (filters: object) => `products:filtered:${JSON.stringify(filters)}`,
} as const;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private readonly cache: CacheService,
  ) {}

  async findAll(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'rating';
    onlyInStock?: boolean;
    ids?: string;
  }) {
    // Filtreli sorgular kısa süre, filtresiz (ana liste) daha uzun cache'lenir
    const hasFilters = filters && Object.keys(filters).some((k) => (filters as any)[k] !== undefined);
    const cacheKey = hasFilters ? KEYS.filtered(filters!) : KEYS.all();
    const ttl = hasFilters ? CacheService.TTL.SHORT : CacheService.TTL.MEDIUM;

    return this.cache.getOrSet(cacheKey, async () => {
      const queryBuilder = this.repository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'category')
        .leftJoinAndSelect('product.images', 'image');

      if (filters?.ids) {
        const productIds = filters.ids.split(',');
        queryBuilder.andWhere('product.id IN (:...productIds)', { productIds });
      }

      if (filters?.category) {
        const categorySlugs = filters.category.split(',');
        const allCategorySlugs = new Set<string>(categorySlugs);

        for (const slug of categorySlugs) {
          const parentCategory = await this.categoryRepository.findOne({
            where: { slug },
            relations: ['children'],
          });
          if (parentCategory && parentCategory.children) {
            parentCategory.children.forEach((child) => allCategorySlugs.add(child.slug));
          }
        }

        queryBuilder.andWhere('category.slug IN (:...categorySlugs)', {
          categorySlugs: Array.from(allCategorySlugs),
        });
      }
      if (filters?.minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', {
          minPrice: filters.minPrice,
        });
      }
      if (filters?.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', {
          maxPrice: filters.maxPrice,
        });
      }
      if (filters?.search) {
        queryBuilder.andWhere(
          '(product.name_tr LIKE :search OR product.name_ru LIKE :search OR product.name_ky LIKE :search OR product.description_tr LIKE :search)',
          { search: `%${filters.search}%` },
        );
      }
      if (filters?.onlyInStock) {
        queryBuilder.andWhere('product.stockQty > 0');
      }

      if (filters?.sortBy === 'price-asc') {
        queryBuilder.orderBy('product.price', 'ASC');
      } else if (filters?.sortBy === 'price-desc') {
        queryBuilder.orderBy('product.price', 'DESC');
      } else if (filters?.sortBy === 'rating') {
        queryBuilder.orderBy('product.averageRating', 'DESC');
      } else {
        queryBuilder.orderBy('product.createdAt', 'DESC');
      }

      return queryBuilder.getMany();
    }, ttl);
  }

  async findOne(id: any) {
    return this.cache.getOrSet(
      KEYS.byId(id),
      async () => {
        const entity = await this.repository.findOne({
          where: { id },
          relations: ['categories', 'images'],
        } as any);
        if (!entity) throw new NotFoundException('Kayıt bulunamadı');
        return entity;
      },
      CacheService.TTL.MEDIUM,
    );
  }

  async findBySlug(slug: string) {
    return this.cache.getOrSet(
      KEYS.bySlug(slug),
      async () => {
        const entity = await this.repository.findOne({
          where: { slug },
          relations: ['categories', 'images'],
        });
        if (!entity) throw new NotFoundException('Ürün bulunamadı');
        return entity;
      },
      CacheService.TTL.MEDIUM,
    );
  }

  async create(createDto: any) {
    const { categoryIds, images, ...productData } = createDto;

    // generate slug if not present
    if (!productData.slug) {
      const name = productData.name_ru || productData.name_tr || 'product';
      productData.slug = slugify(name) + '-' + Date.now();
    }

    // Check active discounts and calculate discount price
    const now = new Date();
    const activeDiscounts = await this.discountRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
    const validDiscounts = activeDiscounts.filter((d) => {
      const startOk = !d.startDate || new Date(d.startDate) <= now;
      const endOk = !d.endDate || new Date(d.endDate) >= now;
      return startOk && endOk;
    });

    let finalDiscountPrice = null;
    let finalDiscountStart = null;
    let finalDiscountEnd = null;
    let finalIsDiscountPermanent = false;

    for (const campaign of validDiscounts) {
      let isTargeted = false;
      if (campaign.targetType === 'ALL') {
        isTargeted = true;
      } else if (campaign.targetType === 'CATEGORY' && categoryIds && categoryIds.length > 0) {
        const descendantCategoryIds = await this.getCategoryDescendantsForDiscount(campaign.targetIds);
        if (categoryIds.some((catId: string) => descendantCategoryIds.includes(catId))) {
          isTargeted = true;
        }
      }

      if (isTargeted) {
        let discountPrice = 0;
        if (campaign.type === 'PERCENT') {
          discountPrice = Math.round(productData.price - (productData.price * campaign.value) / 100);
        } else {
          discountPrice = Math.round(productData.price - campaign.value);
        }
        if (discountPrice < 0) discountPrice = 0;
        if (discountPrice < productData.price) {
          finalDiscountPrice = discountPrice;
          finalDiscountStart = campaign.startDate;
          finalDiscountEnd = campaign.endDate;
          finalIsDiscountPermanent = !campaign.startDate && !campaign.endDate;
        }
      }
    }

    if (finalDiscountPrice !== null) {
      productData.discountPrice = finalDiscountPrice;
      productData.discountStart = finalDiscountStart;
      productData.discountEnd = finalDiscountEnd;
      productData.isDiscountPermanent = finalIsDiscountPermanent;
    }

    const entity = this.repository.create(productData as any) as unknown as Product;

    if (categoryIds && categoryIds.length > 0) {
      entity.categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      });
    } else {
      entity.categories = [];
    }

    if (images && images.length > 0) {
      entity.images = images.map((img: any, idx: number) => {
        const image = new ProductImage();
        image.path = img.path;
        image.isPrimary = img.isPrimary ?? (idx === 0);
        image.order = img.order ?? idx;
        return image;
      });
    } else {
      entity.images = [];
    }

    const saved: Product = await this.repository.save(entity);
    await this.cache.invalidatePattern('products:*');
    return saved;
  }

  private async getCategoryDescendantsForDiscount(categoryIds: string[]): Promise<string[]> {
    const allCategories = await this.categoryRepository.find({ relations: ['parent'] });
    const descendants = new Set<string>(categoryIds);

    let added = true;
    while (added) {
      added = false;
      for (const cat of allCategories) {
        if (cat.parent && descendants.has(cat.parent.id) && !descendants.has(cat.id)) {
          descendants.add(cat.id);
          added = true;
        }
      }
    }
    return Array.from(descendants);
  }

  async update(id: any, updateDto: any) {
    const { categoryIds, images, ...productData } = updateDto;

    const product = await this.repository.findOne({
      where: { id },
      relations: ['categories', 'images'],
    } as any);

    if (!product) {
      throw new NotFoundException('Kayıt bulunamadı');
    }

    this.repository.merge(product, productData);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        product.categories = await this.categoryRepository.find({
          where: { id: In(categoryIds) },
        });
      } else {
        product.categories = [];
      }
    }

    if (images !== undefined) {
      if (product.images && product.images.length > 0) {
        await this.productImageRepository.remove(product.images);
      }
      product.images = images.map((img: any, idx: number) => {
        const image = new ProductImage();
        image.path = img.path;
        image.isPrimary = img.isPrimary ?? (idx === 0);
        image.order = img.order ?? idx;
        return image;
      });
    }

    const saved = await this.repository.save(product);

    await this.cache.del(KEYS.byId(id));
    await this.cache.del(KEYS.bySlug(saved.slug));
    await this.cache.invalidatePattern('products:all');
    await this.cache.invalidatePattern('products:filtered:*');

    return saved;
  }

  async bulkUpdatePrice(dto: {
    categoryIds?: string[];
    type: 'percentage' | 'fixed';
    action: 'increase' | 'decrease';
    value: number;
  }) {
    const queryBuilder = this.repository.createQueryBuilder('product');
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      queryBuilder
        .innerJoin('product.categories', 'category')
        .where('category.id IN (:...categoryIds)', { categoryIds: dto.categoryIds });
    }
    const products = await queryBuilder.getMany();

    for (const product of products) {
      const originalPrice = Number(product.price);
      let newPrice = originalPrice;

      if (dto.type === 'percentage') {
        const diff = (originalPrice * dto.value) / 100;
        newPrice = dto.action === 'increase' ? originalPrice + diff : originalPrice - diff;
      } else {
        newPrice = dto.action === 'increase' ? originalPrice + dto.value : originalPrice - dto.value;
      }

      if (newPrice < 0) newPrice = 0;
      product.price = parseFloat(newPrice.toFixed(2));

      if (product.discountPrice) {
        const originalDiscount = Number(product.discountPrice);
        let newDiscount = originalDiscount;
        if (dto.type === 'percentage') {
          const diff = (originalDiscount * dto.value) / 100;
          newDiscount = dto.action === 'increase' ? originalDiscount + diff : originalDiscount - diff;
        } else {
          newDiscount = dto.action === 'increase' ? originalDiscount + dto.value : originalDiscount - dto.value;
        }
        if (newDiscount < 0) newDiscount = 0;
        product.discountPrice = parseFloat(newDiscount.toFixed(2));
      }
    }

    await this.repository.save(products);

    // Invalidate all products caches
    await this.cache.invalidatePattern('products:*');

    return { count: products.length };
  }

  async remove(id: any) {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['categories', 'images'],
    } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    await this.repository.remove(entity);
    // Cache temizle
    await this.cache.del(KEYS.byId(id));
    await this.cache.del(KEYS.bySlug(entity.slug));
    await this.cache.invalidatePattern('products:all');
    await this.cache.invalidatePattern('products:filtered:*');
    return entity;
  }
}
