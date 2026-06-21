import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının sepetindeki ürünleri getir' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.service.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Sepete ürün ekle' })
  addItem(
    @CurrentUser('sub') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity?: number,
  ) {
    return this.service.addItem(userId, productId, quantity || 1);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Sepetteki ürün miktarını güncelle' })
  updateQuantity(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.service.updateQuantity(userId, productId, quantity);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Sepetten ürün çıkar' })
  async removeItem(@CurrentUser('sub') userId: string, @Param('productId') productId: string) {
    await this.service.removeItem(userId, productId);
    return { success: true, message: 'Ürün sepetten çıkarıldı' };
  }

  @Delete()
  @ApiOperation({ summary: 'Sepeti tamamen temizle' })
  async clearCart(@CurrentUser('sub') userId: string) {
    await this.service.clearCart(userId);
    return { success: true, message: 'Sepet temizlendi' };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Local sepeti database ile eşitle' })
  syncCart(
    @CurrentUser('sub') userId: string,
    @Body('items') items: Array<{ productId: string; quantity: number }>,
  ) {
    return this.service.syncCart(userId, items || []);
  }
}
