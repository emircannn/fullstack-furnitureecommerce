// ============================================================
// Belenay Mobilya - Kategori Entity
// Hiyerarşik kategori yapısı için TypeORM Closure Table kullanır.
// Üçdilli (TR/RU/KY) ad desteği mevcuttur.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Tree,
  TreeParent,
  TreeChildren,
  ManyToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
@Tree('closure-table')
export class Category {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Üçdilli İsim Alanları ----
  @Column({ type: 'varchar', length: 150 })
  name_tr!: string;

  @Column({ type: 'varchar', length: 150 })
  name_ru!: string;

  @Column({ type: 'varchar', length: 150 })
  name_ky!: string;

  // ---- SEO ve Görünüm ----
  @Column({ type: 'varchar', length: 200, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  @Column({ type: 'boolean', default: false })
  showInHeader!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number;

  // ---- Zaman Damgası ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  // ---- Ağaç İlişkileri ----
  @TreeParent({ onDelete: 'SET NULL' })
  parent!: Category | null;

  @TreeChildren()
  children!: Category[];

  // ---- Ürün İlişkisi ----
  @ManyToMany(() => Product, (product: Product) => product.categories)
  products!: Product[];
}
