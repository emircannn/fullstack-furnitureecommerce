import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomepageSection } from './entities/homepage-section.entity';
import { Slider } from './entities/slider.entity';

@Injectable()
export class HomepageDesignService {
  constructor(
    @InjectRepository(HomepageSection)
    private readonly repository: Repository<HomepageSection>,
    @InjectRepository(Slider)
    private readonly sliderRepository: Repository<Slider>,
  ) {}

  async findAllSliders() {
    return this.sliderRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

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
