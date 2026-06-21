// ============================================================
// Belenay Mobilya - Giriş (Login) DTO
// Kullanıcının e-posta ve şifre ile giriş yapması için
// gerekli veri yapısını ve doğrulama kurallarını tanımlar.
// ============================================================

import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  // Giriş yapılacak e-posta adresi
  @ApiProperty({
    description: 'Kullanıcı e-posta adresi',
    example: 'ahmet@example.com',
  })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @MaxLength(255, { message: 'E-posta adresi çok uzun' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  // Kullanıcı şifresi
  @ApiProperty({
    description: 'Kullanıcı şifresi',
    example: 'Belenay2024!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @IsString({ message: 'Şifre metin olmalıdır' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(128, { message: 'Şifre çok uzun' })
  password: string;
}
