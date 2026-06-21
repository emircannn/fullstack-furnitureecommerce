import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HomepageDesignService } from './homepage-design.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('HomepageDesign')
@Controller('homepage-design')
export class HomepageDesignController {
  constructor(private readonly service: HomepageDesignService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele' })
  findAll() {
    return this.service.findAll();
  }

  @Get('slider')
  @ApiOperation({ summary: 'Aktif sliderları getir' })
  findSliders() {
    return this.service.findAllSliders();
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
