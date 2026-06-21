import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly repository: Repository<Question>,
  ) {}

  async findAll(filters?: { productId?: string; isAnswered?: boolean }) {
    const where: any = {};
    if (filters?.productId) {
      where.productId = filters.productId;
    }
    if (filters?.isAnswered !== undefined) {
      where.isAnswered = filters.isAnswered;
    }
    return this.repository.find({
      where,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({ where: { id }, relations: ['user', 'product'] } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
  }

  async create(createDto: any) {
    const entity = this.repository.create(createDto as any);
    return this.repository.save(entity);
  }

  async update(id: any, updateDto: any) {
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: any) {
    const entity = await this.findOne(id);
    return this.repository.remove(entity);
  }
}
