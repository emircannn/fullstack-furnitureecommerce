// ============================================================
// Belenay Mobilya - Favori Entity
// Müşterilerin beğendikleri ürünleri listeler.
// Birleşik birincil anahtar: userId + productId
// ============================================================

import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('favorites')
export class Favorite {
  // ---- Birleşik Birincil Anahtar ----
  @PrimaryColumn({ type: 'varchar', length: 36 })
  userId!: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  productId!: string;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // ---- İlişkiler ----
  @ManyToOne(() => User, (user: User) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Product, (product: Product) => product.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
