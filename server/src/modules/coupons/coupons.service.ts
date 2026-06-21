import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponType } from './enums/coupon-type.enum';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly repository: Repository<Coupon>,
  ) {}

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({ where: { id } } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
  }

  /**
   * Kupon kodunu doğrula ve indirim bilgisini döndür.
   * @param code - Kupon kodu
   * @param orderTotal - Sipariş ara toplamı (KGS)
   */
  async validateByCode(code: string, orderTotal: number) {
    const coupon = await this.repository.findOne({ where: { code: code.toUpperCase() } } as any);

    if (!coupon) {
      throw new BadRequestException('Geçersiz kupon kodu');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Bu kupon artık aktif değil');
    }

    // Süre kontrolü
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Bu kuponun süresi dolmuş');
    }

    // Kullanım limiti kontrolü
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Bu kuponun kullanım limiti dolmuş');
    }

    // Minimum sipariş tutarı kontrolü
    if (coupon.minOrder !== null && orderTotal < coupon.minOrder) {
      throw new BadRequestException(
        `Bu kupon için minimum sipariş tutarı ${coupon.minOrder.toLocaleString()} KGS olmalıdır`,
      );
    }

    // İndirim hesaplama
    let discountAmount: number;
    if (coupon.type === CouponType.PERCENT) {
      discountAmount = Math.round(orderTotal * (coupon.value / 100));
    } else {
      discountAmount = Math.min(coupon.value, orderTotal);
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    };
  }

  /**
   * Kupon kullanım sayacını artır (sipariş tamamlandığında çağrılır)
   */
  async incrementUsage(code: string) {
    const coupon = await this.repository.findOne({ where: { code: code.toUpperCase() } } as any);
    if (coupon) {
      coupon.usedCount += 1;
      await this.repository.save(coupon);
    }
  }

  async create(createDto: any) {
    const entity = this.repository.create(createDto as any);
    return this.repository.save(entity);
  }

  async update(id: any, updateDto: any) {
    await this.repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: any) {
    const entity = await this.findOne(id);
    return this.repository.remove(entity);
  }
}
