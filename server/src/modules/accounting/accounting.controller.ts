import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Accounting')
@Controller('accounting')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AccountingController {
  constructor(private readonly service: AccountingService) {}

  // ==========================================
  // EMPLOYEE ENDPOINTS
  // ==========================================

  @Get('employees')
  @ApiOperation({ summary: 'Tüm çalışanları listele' })
  findAllEmployees() {
    return this.service.findAllEmployees();
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Tek çalışan getir' })
  findOneEmployee(@Param('id') id: string) {
    return this.service.findOneEmployee(id);
  }

  @Post('employees')
  @ApiOperation({ summary: 'Yeni çalışan ekle' })
  createEmployee(@Body() dto: any) {
    return this.service.createEmployee(dto);
  }

  @Patch('employees/:id')
  @ApiOperation({ summary: 'Çalışan güncelle' })
  updateEmployee(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'Çalışan sil' })
  removeEmployee(@Param('id') id: string) {
    return this.service.removeEmployee(id);
  }

  // ==========================================
  // TRANSACTION ENDPOINTS
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele' })
  findAll(@Query() query: { startDate?: string; endDate?: string; employeeId?: string }) {
    return this.service.findAll(query);
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
