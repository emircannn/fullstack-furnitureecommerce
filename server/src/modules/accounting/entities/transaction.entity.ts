// ============================================================
// Belenay Mobilya - Muhasebe İşlemi Entity
// Gelir ve gider işlemlerini kaydeder.
// Personel maaşı için çalışan ilişkisi opsiyoneldir.
// Para birimi: Kırgız Somu (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionCategory } from '../enums/transaction-category.enum';
import { Employee } from './employee.entity';

@Entity('transactions')
export class Transaction {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- İşlem Tipi ve Kategorisi ----
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  // ---- Finansal Bilgiler (KGS) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // ---- İşlem Tarihi ----
  @Column({ type: 'date' })
  date!: Date;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // ---- İlişkiler (Personel maaşı için opsiyonel) ----
  @Column({ type: 'varchar', length: 36, nullable: true })
  employeeId!: string | null;

  @ManyToOne(() => Employee, (employee: Employee) => employee.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'employeeId' })
  employee!: Employee | null;
}
