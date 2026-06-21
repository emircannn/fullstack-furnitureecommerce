import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Discount } from './entities/discount.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CacheService } from '../redis/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DiscountsService implements OnModuleInit {
  constructor(
    @InjectRepository(Discount)
    private readonly repository: Repository<Discount>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cache: CacheService,
  ) {}

  // Sync discounts on startup
  async onModuleInit() {
    console.log('[DiscountsService] Initializing discounts sync...');
    try {
      await this.syncDiscounts();
      console.log('[DiscountsService] Initial discounts sync completed.');
    } catch (err: any) {
      console.error('[DiscountsService] Initial discounts sync failed:', err.message);
    }
  }

  // Daily cron job at midnight to clear expired discounts and apply new ones
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyDiscountSync() {
    console.log('[Cron] Running daily discounts sync...');
    try {
      await this.syncDiscounts();
      console.log('[Cron] Daily discounts sync completed.');
    } catch (err: any) {
      console.error('[Cron] Daily discounts sync failed:', err.message);
    }
  }

  /**
   * Recalculates and applies active discount campaigns to products.
   * If multiple campaigns target the same product, the newest campaign (by creation date) takes precedence.
   */
  async syncDiscounts() {
    const now = new Date();

    // 1. Reset all products discount properties safely using query builder
    await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        discountPrice: null,
        discountStart: null,
        discountEnd: null,
        isDiscountPermanent: false,
      })
      .execute();

    // 2. Load all active discounts sorted by creation date ascending (so newer ones overwrite older ones)
    const activeDiscounts = await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });

    // Filter by dates in memory
    const validDiscounts = activeDiscounts.filter((d) => {
      const startOk = !d.startDate || new Date(d.startDate) <= now;
      const endOk = !d.endDate || new Date(d.endDate) >= now;
      return startOk && endOk;
    });

    for (const campaign of validDiscounts) {
      let targetProducts: Product[] = [];

      if (campaign.targetType === 'ALL') {
        targetProducts = await this.productRepository.find();
      } else if (campaign.targetType === 'PRODUCT') {
        if (campaign.targetIds && campaign.targetIds.length > 0) {
          targetProducts = await this.productRepository.find({
            where: { id: In(campaign.targetIds) },
          });
        }
      } else if (campaign.targetType === 'CATEGORY') {
        if (campaign.targetIds && campaign.targetIds.length > 0) {
          // Fetch targeted categories and all of their subcategories recursively
          const descendantCategoryIds = await this.getCategoryDescendants(campaign.targetIds);
          if (descendantCategoryIds.length > 0) {
            targetProducts = await this.productRepository
              .createQueryBuilder('product')
              .innerJoin('product.categories', 'category', 'category.id IN (:...catIds)', {
                catIds: descendantCategoryIds,
              })
              .getMany();
          }
        }
      }

      // Update targeted products
      for (const product of targetProducts) {
        let discountPrice = 0;
        if (campaign.type === 'PERCENT') {
          discountPrice = Math.round(product.price - (product.price * campaign.value) / 100);
        } else {
          // FIXED discount type
          discountPrice = Math.round(product.price - campaign.value);
        }

        // Constraints: ensure discountPrice is valid
        if (discountPrice < 0) discountPrice = 0;
        if (discountPrice < product.price) {
          await this.productRepository.update(product.id, {
            discountPrice,
            discountStart: campaign.startDate,
            discountEnd: campaign.endDate,
            isDiscountPermanent: !campaign.startDate && !campaign.endDate,
          });
        }
      }
    }

    // 3. Clear products cache
    await this.cache.invalidatePattern('products:*');
  }

  // Helper to fetch descendants of categories recursively in-memory
  private async getCategoryDescendants(categoryIds: string[]): Promise<string[]> {
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

  // --- CRUD Operations ---

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({ where: { id } } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
  }

  async create(createDto: any) {
    const entity = this.repository.create(createDto as any);
    const saved = await this.repository.save(entity);
    await this.syncDiscounts();
    return saved;
  }

  async update(id: any, updateDto: any) {
    await this.repository.update(id, updateDto);
    const updated = await this.findOne(id);
    await this.syncDiscounts();
    return updated;
  }

  async remove(id: any) {
    const entity = await this.findOne(id);
    const removed = await this.repository.remove(entity);
    await this.syncDiscounts();
    return removed;
  }
}
