import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly repository: Repository<Setting>,
  ) {}

  async findAll() {
    return this.repository.find();
  }

  async findOne(key: string) {
    const entity = await this.repository.findOne({ where: { key } });
    if (!entity) throw new NotFoundException('Ayar bulunamadı');
    return entity;
  }

  async create(createDto: any) {
    const entity = this.repository.create(createDto as any);
    return this.repository.save(entity);
  }

  async update(key: string, updateDto: any) {
    await this.repository.update({ key }, updateDto);
    return this.findOne(key);
  }

  async remove(key: string) {
    const entity = await this.findOne(key);
    return this.repository.remove(entity);
  }
}
