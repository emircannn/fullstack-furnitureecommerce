import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post(':type')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Sunucuya görsel yükleme' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.params.type;
          const allowedTypes = ['blogs', 'products', 'dektons', 'sliders', 'banners', 'categories', 'inventory'];
          
          if (!allowedTypes.includes(type)) {
            return cb(new BadRequestException('Geçersiz yükleme tipi'), '');
          }
          
          const uploadPath = `./uploads/${type}`;
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif|pdf)$/)) {
          return cb(new BadRequestException('Sadece görsel veya PDF dosyaları yüklenebilir'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Param('type') type: string) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenemedi veya geçersiz dosya');
    }
    
    // ServeStaticModule /uploads path'ini dinlediği için /uploads/{type}/{filename} döneriz
    return {
      url: `/uploads/${type}/${file.filename}`,
    };
  }
}
