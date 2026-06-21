import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.repository.create(dto);
    return this.repository.save(message);
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: string): Promise<ContactMessage> {
    const message = await this.repository.findOne({ where: { id } } as any);
    if (!message) throw new NotFoundException('Mesaj bulunamadı');
    return this.repository.remove(message);
  }
}
