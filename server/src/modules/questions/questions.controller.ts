import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele veya filtrele' })
  findAll(
    @Query('productId') productId?: string,
    @Query('isAnswered') isAnswered?: string,
  ) {
    const filterAnswered = isAnswered === 'true' ? true : isAnswered === 'false' ? false : undefined;
    return this.service.findAll({ productId, isAnswered: filterAnswered });
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
