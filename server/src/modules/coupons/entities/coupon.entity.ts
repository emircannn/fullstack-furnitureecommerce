// ============================================================
// Belenay Mobilya - Kupon Entity
// İndirim kuponlarını yönetir.
// PERCENT: Yüzde indirim | FIXED: Sabit tutar (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { CouponType } from '../enums/coupon-type.enum';

@Entity('coupons')
export class Coupon {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Kupon Kodu ----
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  // ---- İndirim Tipi ve Değeri ----
  @Column({
    type: 'enum',
    enum: CouponType,
  })
  type!: CouponType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  value!: number;

  // ---- Minimum Sipariş Tutarı (KGS) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: DecimalTransformer,
  })
  minOrder!: number | null;

  // ---- Kullanım Limiti ----
  @Column({ type: 'int', nullable: true })
  usageLimit!: number | null;

  @Column({ type: 'int', default: 0 })
  usedCount!: number;

  // ---- Geçerlilik Süresi ----
  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;

  // ---- Aktiflik Durumu ----
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
