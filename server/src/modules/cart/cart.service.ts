import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(userId: string): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { userId },
      relations: ['product', 'product.images'],
      order: { createdAt: 'ASC' },
    });
  }

  async addItem(userId: string, productId: string, quantity = 1): Promise<CartItem> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    let item = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.cartItemRepository.create({
        userId,
        productId,
        quantity,
      });
    }

    return this.cartItemRepository.save(item);
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      await this.removeItem(userId, productId);
      return null;
    }

    const item = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Sepette ürün bulunamadı');
    }

    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const item = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });

    if (!item) {
      throw new NotFoundException('Sepette ürün bulunamadı');
    }

    await this.cartItemRepository.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }

  async syncCart(userId: string, localItems: Array<{ productId: string; quantity: number }>): Promise<CartItem[]> {
    for (const localItem of localItems) {
      const product = await this.productRepository.findOne({ where: { id: localItem.productId } });
      if (!product) continue;

      const existing = await this.cartItemRepository.findOne({
        where: { userId, productId: localItem.productId },
      });

      if (existing) {
        // Merge quantities, but cap at stock or just sum
        existing.quantity = Math.max(existing.quantity, localItem.quantity);
        await this.cartItemRepository.save(existing);
      } else {
        const newItem = this.cartItemRepository.create({
          userId,
          productId: localItem.productId,
          quantity: localItem.quantity,
        });
        await this.cartItemRepository.save(newItem);
      }
    }

    return this.findAll(userId);
  }
}
