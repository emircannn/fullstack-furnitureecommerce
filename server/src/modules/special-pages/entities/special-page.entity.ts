// ============================================================
// Belenay Mobilya - Özel Sayfa Entity
// Koleksiyonlar, kampanyalar gibi özel içerik sayfalarını yönetir.
// Üçdilli başlık ve SEO slug desteği mevcuttur.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpecialPageProduct } from './special-page-product.entity';

@Entity('special_pages')
export class SpecialPage {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Üçdilli Başlık ----
  @Column({ type: 'varchar', length: 255 })
  title_tr!: string;

  @Column({ type: 'varchar', length: 255 })
  title_ru!: string;

  @Column({ type: 'varchar', length: 255 })
  title_ky!: string;

  // ---- SEO Slug ----
  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  // ---- Banner Görseli ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  bannerImage!: string | null;

  // ---- Aktiflik Durumu ----
  @Column({ type: 'boolean', default: false })
  isActive!: boolean;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ---- İlişkiler ----
  @OneToMany(
    () => SpecialPageProduct,
    (spp: SpecialPageProduct) => spp.specialPage,
    { cascade: true },
  )
  specialPageProducts!: SpecialPageProduct[];
}
