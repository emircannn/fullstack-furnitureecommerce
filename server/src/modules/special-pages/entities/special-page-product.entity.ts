// ============================================================
// Belenay Mobilya - Özel Sayfa Ürünü Entity (Ara Tablo)
// Özel sayfalar ile ürünler arasındaki ilişkiyi yönetir.
// Sıralama (order) alanı ürünlerin sayfa içi sırasını belirler.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpecialPage } from './special-page.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('special_page_products')
export class SpecialPageProduct {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Sıralama ----
  @Column({ type: 'int', default: 0 })
  order!: number;

  // ---- İlişkiler ----
  @Column({ type: 'varchar', length: 36 })
  specialPageId!: string;

  @ManyToOne(() => SpecialPage, (page: SpecialPage) => page.specialPageProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specialPageId' })
  specialPage!: SpecialPage;

  @Column({ type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product: Product) => product.specialPageProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;
}
