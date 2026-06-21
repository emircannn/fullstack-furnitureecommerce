// ============================================================
// Belenay Mobilya - Sistem Ayarları Entity
// Anahtar-değer formatında site geneli ayarları saklar.
// key birincil anahtardır (VARCHAR).
// ============================================================

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  // ---- Birincil Anahtar (Ayar Adı) ----
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string;

  // ---- Ayar Değeri ----
  @Column({ type: 'text' })
  value!: string;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
