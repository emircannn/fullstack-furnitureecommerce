// ============================================================
// Belenay Mobilya - Ürün Sorusu Entity
// Müşterilerin ürünler hakkında sorularını ve
// admin cevaplarını yönetir.
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

@Entity('questions')
export class Question {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Soru ve Cevap ----
  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text', nullable: true })
  answer!: string | null;

  @Column({ type: 'boolean', default: false })
  isAnswered!: boolean;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // ---- İlişkiler ----
  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user: User) => user.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product: Product) => product.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
