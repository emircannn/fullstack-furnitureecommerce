// ============================================================
// Belenay Mobilya - İndirim Kampanyası Entity
// Ürün, kategori veya tüm ürünler üzerinde
// otomatik indirim kampanyalarını yönetir.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { DiscountType } from '../enums/discount-type.enum';
import { DiscountTargetType } from '../enums/discount-target-type.enum';

@Entity('discounts')
export class Discount {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Kampanya Adı ----
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  // ---- İndirim Tipi ve Değeri ----
  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  type!: DiscountType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  value!: number;

  // ---- Hedef Tipi ----
  @Column({
    type: 'enum',
    enum: DiscountTargetType,
  })
  targetType!: DiscountTargetType;

  // ---- Hedef ID'leri (ürün veya kategori ID'leri) ----
  @Column({ type: 'json', nullable: true })
  targetIds!: string[] | null;

  // ---- Geçerlilik Tarihleri ----
  @Column({ type: 'datetime', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endDate!: Date | null;

  // ---- Aktiflik Durumu ----
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
