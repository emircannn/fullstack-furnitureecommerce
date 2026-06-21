import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'İletişim mesajı gönder' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm mesajları listele' })
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mesajı sil' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
