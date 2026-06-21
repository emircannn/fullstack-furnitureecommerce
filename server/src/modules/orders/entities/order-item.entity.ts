// ============================================================
// Belenay Mobilya - Sipariş Kalemi Entity
// Sipariş içindeki her bir ürün satırını temsil eder.
// Ürün bilgileri anlık görüntü olarak saklanır (silinse bile kayıt kalır).
// Para birimi: Kırgız Somu (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Miktar ve Fiyat ----
  @Column({ type: 'int' })
  qty!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  price!: number;

  // ---- Ürün Anlık Görüntüsü (Ürün silinse de kayıt kalır) ----
  @Column({ type: 'varchar', length: 255 })
  productName_tr!: string;

  @Column({ type: 'varchar', length: 255 })
  productName_ru!: string;

  @Column({ type: 'varchar', length: 255 })
  productName_ky!: string;

  // ---- İlişkiler ----
  @Column({ type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, (order: Order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'varchar', length: 36, nullable: true })
  productId!: string | null;

  @ManyToOne(() => Product, (product: Product) => product.orderItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product | null;
}
