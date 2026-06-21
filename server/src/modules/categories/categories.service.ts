// ============================================================
// Belenay Mobilya — CategoriesService (Redis Cache eklenmiş)
// findAll ve findBySlug için cache-aside stratejisi.
// Yazma işlemlerinde ilgili cache anahtarları temizlenir.
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CacheService } from '../redis/cache.service';
import { slugify } from '../../common/utils/slugify';

const KEYS = {
  all: () => 'categories:all',
  byId: (id: string | number) => `categories:id:${id}`,
  bySlug: (slug: string) => `categories:slug:${slug}`,
} as const;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
    private readonly cache: CacheService,
  ) {}

  async findAll() {
    return this.cache.getOrSet(
      KEYS.all(),
      () => this.repository.find({ relations: ['parent', 'children', 'products', 'children.products'] }),
      CacheService.TTL.MEDIUM,
    );
  }

  async findOne(id: any) {
    return this.cache.getOrSet(
      KEYS.byId(id),
      async () => {
        const entity = await this.repository.findOne({
          where: { id },
          relations: ['parent', 'children', 'products', 'children.products'],
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
          relations: ['parent', 'children', 'products', 'children.products'],
        });
        if (!entity) throw new NotFoundException('Kategori bulunamadı');
        return entity;
      },
      CacheService.TTL.MEDIUM,
    );
  }

  async create(createDto: any) {
    if (!createDto.slug) {
      const name = createDto.name_ru || createDto.name_tr || 'category';
      createDto.slug = slugify(name) + '-' + Date.now();
    }
    const entity = this.repository.create(createDto as any);
    const saved = await this.repository.save(entity);
    await this.cache.invalidatePattern('categories:*');
    return saved;
  }

  async update(id: any, updateDto: any) {
    await this.repository.update(id, updateDto);
    await this.cache.del(KEYS.byId(id));
    await this.cache.del(KEYS.all());
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    } as any);
    if (!updated) throw new NotFoundException('Kayıt bulunamadı');
    await this.cache.del(KEYS.bySlug(updated.slug));
    return updated;
  }

  async remove(id: any) {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    await this.repository.remove(entity);
    await this.cache.invalidatePattern('categories:*');
    return entity;
  }
}
