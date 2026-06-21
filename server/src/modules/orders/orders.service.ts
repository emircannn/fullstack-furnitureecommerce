import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './enums/order-status.enum';
import { Order } from './entities/order.entity';
import { CouponsService } from '../coupons/coupons.service';
import { Product } from '../products/entities/product.entity';
import { Transaction } from '../accounting/entities/transaction.entity';
import { Setting } from '../settings/entities/setting.entity';
import { TransactionType } from '../accounting/enums/transaction-type.enum';
import { TransactionCategory } from '../accounting/enums/transaction-category.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly couponsService: CouponsService,
  ) {}

  async findAll() {
    return this.repository.find({ relations: ['orderItems', 'user'], order: { createdAt: 'DESC' } });
  }

  /**
   * Belirli kullanıcının siparişlerini getir
   */
  async findByUser(userId: string) {
    return this.repository.find({
      where: { userId },
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['orderItems', 'user']
    } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
  }

  async create(orderData: any, receiptFile?: any) {
    // items is passed as part of orderData
    const items = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items;

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;

    // If coupon is supplied, validate it securely on the backend
    if (orderData.couponCode) {
      try {
        const validation = await this.couponsService.validateByCode(orderData.couponCode, subtotal);
        if (validation && validation.valid) {
          discountAmount = validation.discountAmount;
          // Increment the coupon usage
          await this.couponsService.incrementUsage(orderData.couponCode);
        }
      } catch (err) {
        console.warn('Backend coupon validation failed:', err);
        throw err;
      }
    }

    const limitSetting = await this.settingRepository.findOne({ where: { key: 'min_free_shipping_limit' } });
    const minFreeShippingLimit = limitSetting ? parseFloat(limitSetting.value) : 100000;

    const shipping = subtotal === 0 || subtotal > minFreeShippingLimit ? 0 : 2500;
    const computedTotal = subtotal - discountAmount + shipping;

    const order = this.repository.create({
      userId: orderData.userId,
      address: orderData.address,
      phone: orderData.phone,
      addressLink: orderData.addressLink || null,
      totalAmount: computedTotal,
      receiptPath: receiptFile ? `/uploads/receipts/${receiptFile.filename}` : null,
      status: OrderStatus.PENDING_APPROVAL,
      couponCode: orderData.couponCode || null,
      discountAmount: discountAmount || 0,
    });

    const savedOrder = await this.repository.save(order);

    const orderItemRepository = this.repository.manager.getRepository(OrderItem);
    const orderItems = items.map((item: any) => {
      return orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        qty: item.quantity,
        price: item.price,
        productName_tr: item.name_tr || item.name,
        productName_ru: item.name_ru || item.name,
        productName_ky: item.name_ky || item.name,
      });
    });

    await orderItemRepository.save(orderItems);

    // Decrement stockQty for each product in the order
    const productRepository = this.repository.manager.getRepository(Product);
    for (const item of items) {
      if (item.productId) {
        const product = await productRepository.findOne({ where: { id: item.productId } });
        if (product) {
          product.stockQty = Math.max(0, product.stockQty - item.quantity);
          await productRepository.save(product);
        }
      }
    }

    // Insert dynamic sale income record in accounting
    const transaction = this.transactionRepository.create({
      type: TransactionType.INCOME,
      category: TransactionCategory.INCOME,
      amount: savedOrder.totalAmount,
      description: `Sipariş Geliri - Sipariş No: ${savedOrder.id.substring(0, 8)}`,
      date: new Date(),
    });
    await this.transactionRepository.save(transaction);

    return this.findOne(savedOrder.id);
  }

  async update(id: any, updateDto: any) {
    const currentOrder = await this.repository.findOne({
      where: { id },
      relations: ['orderItems'],
    } as any);

    if (!currentOrder) throw new NotFoundException('Sipariş bulunamadı');

    // If order status is being changed to CANCELLED, and it wasn't CANCELLED before, restore stock
    if (updateDto.status === OrderStatus.CANCELLED && currentOrder.status !== OrderStatus.CANCELLED) {
      const productRepository = this.repository.manager.getRepository(Product);
      for (const item of currentOrder.orderItems) {
        if (item.productId) {
          const product = await productRepository.findOne({ where: { id: item.productId } });
          if (product) {
            product.stockQty += item.qty;
            await productRepository.save(product);
          }
        }
      }

      // Also delete the accounting transaction for this order
      const descPattern = `Sipariş Geliri - Sipariş No: ${id.substring(0, 8)}`;
      await this.transactionRepository.delete({ description: descPattern });
    }

    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: any) {
    const entity = await this.findOne(id);
    const descPattern = `Sipariş Geliri - Sipariş No: ${entity.id.substring(0, 8)}`;
    await this.transactionRepository.delete({ description: descPattern });
    return this.repository.remove(entity);
  }
}

