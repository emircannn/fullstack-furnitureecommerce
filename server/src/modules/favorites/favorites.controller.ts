import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının favori ürünlerini getir' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.service.findAll(userId);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Ürünü favorilere ekle' })
  create(@CurrentUser('sub') userId: string, @Param('productId') productId: string) {
    return this.service.create(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Ürünü favorilerden kaldır' })
  async remove(@CurrentUser('sub') userId: string, @Param('productId') productId: string) {
    await this.service.remove(userId, productId);
    return { success: true, message: 'Ürün favorilerden kaldırıldı' };
  }
}
