// ============================================================
// Belenay Mobilya - Slider Entity
// Ana sayfa slider öğelerini yönetir.
// Üçdilli başlık, alt başlık ve buton metni desteklenir.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sliders')
export class Slider {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Görsel ----
  @Column({ type: 'varchar', length: 500 })
  image!: string;

  // ---- Üçdilli Başlık ----
  @Column({ type: 'varchar', length: 255, nullable: true })
  title_tr!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title_ru!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title_ky!: string | null;

  // ---- Üçdilli Alt Başlık ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle_tr!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle_ru!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subtitle_ky!: string | null;

  // ---- Üçdilli Buton Metni ----
  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonText_tr!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonText_ru!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  buttonText_ky!: string | null;

  // ---- Buton Bağlantısı ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  buttonLink!: string | null;

  // ---- Renk Ayarları ----
  @Column({ type: 'varchar', length: 20, default: '#e75f0d' })
  buttonColor!: string;

  @Column({ type: 'varchar', length: 20, default: '#ffffff' })
  textColor!: string;

  // ---- Sıralama ve Aktiflik ----
  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
