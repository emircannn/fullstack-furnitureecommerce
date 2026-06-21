// ============================================================
// Belenay Mobilya - Ürün Entity
// Mobilya ürünlerinin tüm bilgilerini yönetir.
// Üçdilli (TR/RU/KY) içerik, indirim ve stok yönetimi desteklenir.
// Para birimi: Kırgız Somu (KGS)
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { DecimalTransformer } from '../../../common/transformers/decimal.transformer';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Question } from '../../questions/entities/question.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { SpecialPageProduct } from '../../special-pages/entities/special-page-product.entity';

@Entity('products')
export class Product {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Üçdilli Ürün Adı ----
  @Column({ type: 'varchar', length: 255 })
  name_tr!: string;

  @Column({ type: 'varchar', length: 255 })
  name_ru!: string;

  @Column({ type: 'varchar', length: 255 })
  name_ky!: string;

  // ---- SEO Slug ----
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  // ---- Kısa Açıklamalar ----
  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDesc_tr!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDesc_ru!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDesc_ky!: string | null;

  // ---- Uzun Açıklamalar ----
  @Column({ type: 'text', nullable: true })
  description_tr!: string | null;

  @Column({ type: 'text', nullable: true })
  description_ru!: string | null;

  @Column({ type: 'text', nullable: true })
  description_ky!: string | null;

  // ---- Fiyatlandırma (KGS - Kırgız Somu) ----
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: DecimalTransformer,
  })
  price!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: DecimalTransformer,
  })
  discountPrice!: number | null;

  // ---- İndirim Zamanlaması ----
  @Column({ type: 'datetime', nullable: true })
  discountStart!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  discountEnd!: Date | null;

  @Column({ type: 'boolean', default: false })
  isDiscountPermanent!: boolean;

  // ---- Stok Bilgileri ----
  @Column({ type: 'varchar', length: 100, unique: true })
  stockCode!: string;

  @Column({ type: 'int', default: 0 })
  stockQty!: number;

  // ---- Yayın Durumu ----
  @Column({ type: 'boolean', default: true })
  isPublished!: boolean;

  // ---- İstatistikler ----
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  averageRating!: number;

  @Column({ type: 'int', default: 0 })
  reviewCount!: number;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ---- İlişkiler ----
  @ManyToMany(() => Category, (category: Category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories!: Category[];

  @OneToMany(() => ProductImage, (image: ProductImage) => image.product, { cascade: true })
  images!: ProductImage[];

  @OneToMany(() => Review, (review: Review) => review.product)
  reviews!: Review[];

  @OneToMany(() => Question, (question: Question) => question.product)
  questions!: Question[];

  @OneToMany(() => OrderItem, (item: OrderItem) => item.product)
  orderItems!: OrderItem[];

  @OneToMany(() => Favorite, (favorite: Favorite) => favorite.product)
  favorites!: Favorite[];

  @OneToMany(() => SpecialPageProduct, (spp: SpecialPageProduct) => spp.product)
  specialPageProducts!: SpecialPageProduct[];
}
