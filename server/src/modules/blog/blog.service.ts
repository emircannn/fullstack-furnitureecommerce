// ============================================================
// Belenay Mobilya — BlogService (Redis Cache eklenmiş)
// Blog yazıları sıklıkla değişmediği için LONG TTL kullanılır.
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CacheService } from '../redis/cache.service';
import { slugify } from '../../common/utils/slugify';

const KEYS = {
  all: () => 'blog:all',
  byId: (id: string | number) => `blog:id:${id}`,
  bySlug: (slug: string) => `blog:slug:${slug}`,
} as const;

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repository: Repository<BlogPost>,
    private readonly cache: CacheService,
  ) {}

  async findAll() {
    return this.cache.getOrSet(
      KEYS.all(),
      () => this.repository.find({ order: { createdAt: 'DESC' } }),
      CacheService.TTL.LONG,
    );
  }

  async findOne(id: any) {
    return this.cache.getOrSet(
      KEYS.byId(id),
      async () => {
        const entity = await this.repository.findOne({ where: { id } } as any);
        if (!entity) throw new NotFoundException('Kayıt bulunamadı');
        return entity;
      },
      CacheService.TTL.LONG,
    );
  }

  async findBySlug(slug: string) {
    return this.cache.getOrSet(
      KEYS.bySlug(slug),
      async () => {
        const entity = await this.repository.findOne({ where: { slug } });
        if (!entity) throw new NotFoundException('Blog yazısı bulunamadı');
        return entity;
      },
      CacheService.TTL.LONG,
    );
  }

  async create(createDto: any) {
    if (!createDto.slug) {
      const title = createDto.title_ru || createDto.title_tr || 'blog';
      createDto.slug = slugify(title) + '-' + Date.now();
    }
    const entity = this.repository.create(createDto as any);
    const saved = await this.repository.save(entity);
    await this.cache.del(KEYS.all());
    return saved;
  }

  async update(id: any, updateDto: any) {
    await this.repository.update(id, updateDto);
    await this.cache.del(KEYS.byId(id));
    await this.cache.del(KEYS.all());
    const updated = await this.repository.findOne({ where: { id } } as any);
    if (!updated) throw new NotFoundException('Kayıt bulunamadı');
    await this.cache.del(KEYS.bySlug(updated.slug));
    return updated;
  }

  async remove(id: any) {
    const entity = await this.repository.findOne({ where: { id } } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    await this.repository.remove(entity);
    await this.cache.del(KEYS.byId(id));
    await this.cache.del(KEYS.bySlug(entity.slug));
    await this.cache.del(KEYS.all());
    return entity;
  }
}
