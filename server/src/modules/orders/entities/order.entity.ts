// ============================================================
// Belenay Mobilya - Sipariş Entity
// Müşteri siparişlerini ve durumlarını yönetir.
// Para birimi: Kırgız Somu (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { OrderStatus } from '../enums/order-status.enum';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Sipariş Durumu ----
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_APPROVAL,
  })
  status!: OrderStatus;

  // ---- Finansal Bilgiler (KGS) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalAmount!: number;

  // ---- Teslimat Bilgileri ----
  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  addressLink!: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  // ---- Makbuz ve Admin Notu ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptPath!: string | null;

  @Column({ type: 'text', nullable: true })
  adminNote!: string | null;

  // ---- Kupon Bilgileri ----
  @Column({ type: 'varchar', length: 50, nullable: true })
  couponCode!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  discountAmount!: number;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ---- İlişkiler ----
  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user: User) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, { cascade: true })
  orderItems!: OrderItem[];
}
