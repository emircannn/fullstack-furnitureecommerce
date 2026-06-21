import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialPage } from './entities/special-page.entity';
import { SpecialPagesService } from './special-pages.service';
import { SpecialPagesController } from './special-pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialPage])],
  controllers: [SpecialPagesController],
  providers: [SpecialPagesService],
  exports: [SpecialPagesService],
})
export class SpecialPagesModule {}
