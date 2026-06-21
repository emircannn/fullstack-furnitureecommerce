import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product', 'product.images'],
    });
  }

  async create(userId: string, productId: string): Promise<Favorite> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      return existing;
    }

    const favorite = this.favoriteRepository.create({
      userId,
      productId,
    });

    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (!favorite) {
      throw new NotFoundException('Beğeni kaydı bulunamadı');
    }

    await this.favoriteRepository.remove(favorite);
  }
}
