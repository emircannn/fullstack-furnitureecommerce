import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly repository: Repository<Review>,
  ) {}

  async findAll(filters?: { productId?: string; isApproved?: boolean }) {
    const where: any = {};
    if (filters?.productId) {
      where.productId = filters.productId;
    }
    if (filters?.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
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
    // Check if user has a completed order containing this product
    const orderRepo = this.repository.manager.getRepository(Order);
    const purchasedOrder = await orderRepo.createQueryBuilder('order')
      .innerJoin('order.orderItems', 'item')
      .where('order.userId = :userId', { userId: createDto.userId })
      .andWhere('item.productId = :productId', { productId: createDto.productId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getOne();

    if (!purchasedOrder) {
      throw new BadRequestException('Bu ürünü değerlendirmek için önce satın almalı ve teslim almalısınız.');
    }

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
