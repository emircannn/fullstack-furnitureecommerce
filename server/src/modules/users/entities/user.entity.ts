// ============================================================
// Belenay Mobilya - Kullanıcı Entity
// Müşteri ve admin hesaplarını yönetir.
// Sosyal giriş (Google/Apple) ve yerel giriş desteklenir.
// ============================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Gender } from '../enums/gender.enum';
import { AuthProvider } from '../enums/auth-provider.enum';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Question } from '../../questions/entities/question.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity('users')
export class User {
  // ---- Birincil Anahtar ----
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ---- Temel Bilgiler ----
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender!: Gender | null;

  // ---- Kimlik Doğrulama ----
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider!: AuthProvider;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerId!: string | null;

  // ---- Yetki ve Durum ----
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 5, default: 'ru' })
  language!: string;

  // ---- Zaman Damgaları ----
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  // ---- İlişkiler ----
  @OneToMany(() => Order, (order: Order) => order.user)
  orders!: Order[];

  @OneToMany(() => Review, (review: Review) => review.user)
  reviews!: Review[];

  @OneToMany(() => Question, (question: Question) => question.user)
  questions!: Question[];

  @OneToMany(() => Favorite, (favorite: Favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => RefreshToken, (token: RefreshToken) => token.user)
  refreshTokens!: RefreshToken[];
}
