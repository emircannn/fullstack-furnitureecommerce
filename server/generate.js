const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'categories', entity: 'Category', entityFile: 'category.entity' },
  { name: 'products', entity: 'Product', entityFile: 'product.entity' },
  { name: 'orders', entity: 'Order', entityFile: 'order.entity' },
  { name: 'reviews', entity: 'Review', entityFile: 'review.entity' },
  { name: 'questions', entity: 'Question', entityFile: 'question.entity' },
  { name: 'blog', entity: 'BlogPost', entityFile: 'blog-post.entity' },
  { name: 'inventory', entity: 'InventoryItem', entityFile: 'inventory-item.entity' },
  { name: 'coupons', entity: 'Coupon', entityFile: 'coupon.entity' },
  { name: 'discounts', entity: 'Discount', entityFile: 'discount.entity' },
  { name: 'accounting', entity: 'Transaction', entityFile: 'transaction.entity' },
  { name: 'settings', entity: 'Setting', entityFile: 'setting.entity' },
  { name: 'homepage-design', entity: 'HomepageSection', entityFile: 'homepage-section.entity' },
  { name: 'special-pages', entity: 'SpecialPage', entityFile: 'special-page.entity' }
];

const basePath = path.join(__dirname, 'src', 'modules');

modules.forEach((mod) => {
  const modPath = path.join(basePath, mod.name);
  if (!fs.existsSync(modPath)) {
    fs.mkdirSync(modPath, { recursive: true });
  }

  const moduleNameClass = mod.name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Module';
  const serviceNameClass = mod.name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Service';
  const controllerNameClass = mod.name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Controller';

  // module
  const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${mod.entity} } from './entities/${mod.entityFile}';
import { ${serviceNameClass} } from './${mod.name}.service';
import { ${controllerNameClass} } from './${mod.name}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${mod.entity}])],
  controllers: [${controllerNameClass}],
  providers: [${serviceNameClass}],
  exports: [${serviceNameClass}],
})
export class ${moduleNameClass} {}
`;

  // service
  const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${mod.entity} } from './entities/${mod.entityFile}';

@Injectable()
export class ${serviceNameClass} {
  constructor(
    @InjectRepository(${mod.entity})
    private readonly repository: Repository<${mod.entity}>,
  ) {}

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({ where: { id } } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
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
`;

  // controller
  const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${serviceNameClass} } from './${mod.name}.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('${moduleNameClass.replace('Module', '')}')
@Controller('${mod.name}')
export class ${controllerNameClass} {
  constructor(private readonly service: ${serviceNameClass}) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele' })
  findAll() {
    return this.service.findAll();
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
`;

  fs.writeFileSync(path.join(modPath, mod.name + '.module.ts'), moduleContent);
  fs.writeFileSync(path.join(modPath, mod.name + '.service.ts'), serviceContent);
  fs.writeFileSync(path.join(modPath, mod.name + '.controller.ts'), controllerContent);
  
  console.log('Generated ' + mod.name);
});
