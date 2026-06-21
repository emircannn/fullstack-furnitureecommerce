import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele' })
  findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price-asc' | 'price-desc' | 'rating',
    @Query('onlyInStock') onlyInStock?: string,
    @Query('ids') ids?: string,
  ) {
    return this.service.findAll({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      sortBy,
      onlyInStock: onlyInStock === 'true',
      ids,
    });
  }

  @Patch('bulk/price')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Toplu ürün fiyatı güncelle' })
  bulkUpdatePrice(
    @Body() dto: {
      categoryIds?: string[];
      type: 'percentage' | 'fixed';
      action: 'increase' | 'decrease';
      value: number;
    },
  ) {
    return this.service.bulkUpdatePrice(dto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Slug ile ürün getir' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek kayıt getir' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kayıt oluştur' })
  create(@Body() createDto: any) {
    return this.service.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kayıt güncelle' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kayıt sil' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
