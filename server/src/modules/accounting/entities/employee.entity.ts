// ============================================================
// Belenay Mobilya - Personel Entity
// Çalışan bilgilerini ve maaş takibini yönetir.
// Para birimi: Kırgız Somu (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { Transaction } from './transaction.entity';

@Entity('employees')
export class Employee {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Personel Bilgileri ----
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  // ---- Maaş Bilgileri (KGS) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  monthlySalary!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  totalPaid!: number;

  // ---- Çalışma Durumu ----
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ---- İlişkiler ----
  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.employee)
  transactions!: Transaction[];
}
