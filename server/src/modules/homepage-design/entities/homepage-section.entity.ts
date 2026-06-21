// ============================================================
// Belenay Mobilya - Ana Sayfa Bölümü Entity
// Ana sayfanın dinamik düzenini yönetir.
// config alanı JSON formatında bölüme özel ayarları saklar.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HomepageSectionType } from '../enums/homepage-section-type.enum';

@Entity('homepage_sections')
export class HomepageSection {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Bölüm Tipi ----
  @Column({
    type: 'enum',
    enum: HomepageSectionType,
  })
  type!: HomepageSectionType;

  // ---- Sıralama ----
  @Column({ type: 'int', default: 0 })
  order!: number;

  // ---- Bölüm Yapılandırması (JSON) ----
  // Slider için: { sliderId } | Banner için: { image, link, title_tr... }
  // Product List için: { categoryId, limit, title_tr... }
  @Column({ type: 'json' })
  config!: Record<string, unknown>;

  // ---- Aktiflik Durumu ----
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
