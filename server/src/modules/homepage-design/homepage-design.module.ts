import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomepageSection } from './entities/homepage-section.entity';
import { Slider } from './entities/slider.entity';
import { HomepageDesignService } from './homepage-design.service';
import { HomepageDesignController } from './homepage-design.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HomepageSection, Slider])],
  controllers: [HomepageDesignController],
  providers: [HomepageDesignService],
  exports: [HomepageDesignService],
})
export class HomepageDesignModule {}
