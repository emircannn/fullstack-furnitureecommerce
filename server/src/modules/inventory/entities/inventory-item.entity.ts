// ============================================================
// Belenay Mobilya - Envanter Kalemi Entity
// Hammadde ve malzeme stoğunu yönetir.
// Miktar ondalıklı olabilir (örn: 2.5 metre kumaş).
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';

@Entity('inventory_items')
export class InventoryItem {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Malzeme Bilgileri ----
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  // ---- Stok Miktarı (ondalıklı olabilir: metre, kg vb.) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  qty!: number;

  // ---- Birim (adet, metre, kg, litre vb.) ----
  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
