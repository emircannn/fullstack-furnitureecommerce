// ============================================================
// Belenay Mobilya - Ürün Yorumu Entity
// Müşterilerin ürünlere bıraktığı yorumları yönetir.
// Yorumlar admin onayından sonra yayınlanır.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('reviews')
export class Review {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Yorum İçeriği ----
  @Column({ type: 'tinyint', unsigned: true })
  rating!: number; // 1-5 arası puan

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  // ---- Onay Durumu ----
  @Column({ type: 'boolean', default: false })
  isApproved!: boolean;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // ---- İlişkiler ----
  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user: User) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product: Product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 36, nullable: true })
  orderId!: string | null;

  @ManyToOne(() => Order, (_order: Order) => null, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'orderId' })
  order!: Order | null;
}
