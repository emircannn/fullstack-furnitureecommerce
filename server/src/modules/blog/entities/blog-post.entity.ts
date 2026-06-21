// ============================================================
// Belenay Mobilya - Blog Yazısı Entity
// Üçdilli (TR/RU/KY) blog içeriği yönetir.
// SEO slug ve yayın zamanı desteklenir.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog_posts')
export class BlogPost {
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

  // ---- Üçdilli İçerik ----
  @Column({ type: 'longtext' })
  content_tr!: string;

  @Column({ type: 'longtext' })
  content_ru!: string;

  @Column({ type: 'longtext' })
  content_ky!: string;

  // ---- Üçdilli Özet ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt_tr!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt_ru!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt_ky!: string | null;

  // ---- Görsel ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  // ---- Yayın Bilgileri ----
  @Column({ type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt!: Date | null;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
