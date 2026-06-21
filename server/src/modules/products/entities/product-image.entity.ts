// ============================================================
// Belenay Mobilya - Ürün Görseli Entity
// Bir ürüne ait birden fazla görseli yönetir.
// isPrimary alanı ana görseli belirtir.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Görsel Bilgileri ----
  @Column({ type: 'varchar', length: 500 })
  path!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'boolean', default: false })
  isPrimary!: boolean;

  // ---- İlişki ----
  @Column({ type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product: Product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
