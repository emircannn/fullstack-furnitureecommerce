// ============================================================
// Belenay Mobilya - Kayıt (Register) DTO
// Yeni kullanıcı kaydı sırasında beklenen veri yapısını
// ve doğrulama kurallarını tanımlar.
// ============================================================

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Cinsiyet seçenekleri
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class RegisterDto {
  // Kullanıcının tam adı (zorunlu)
  @ApiProperty({
    description: 'Kullanıcının tam adı',
    example: 'Ahmet Yılmaz',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Ad soyad boş olamaz' })
  @IsString({ message: 'Ad soyad metin olmalıdır' })
  @MinLength(2, { message: 'Ad soyad en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'Ad soyad en fazla 100 karakter olabilir' })
  @Transform(({ value }) => value?.trim())
  name: string;

  // E-posta adresi (zorunlu, benzersiz)
  @ApiProperty({
    description: 'Kullanıcı e-posta adresi',
    example: 'ahmet@example.com',
  })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @MaxLength(255, { message: 'E-posta adresi en fazla 255 karakter olabilir' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  // Şifre (zorunlu, minimum 8 karakter)
  @ApiProperty({
    description: 'Kullanıcı şifresi (en az 8 karakter, büyük harf, küçük harf ve rakam içermeli)',
    example: 'Belenay2024!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @IsString({ message: 'Şifre metin olmalıdır' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @MaxLength(128, { message: 'Şifre en fazla 128 karakter olabilir' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;

  // Telefon numarası (isteğe bağlı)
  @ApiPropertyOptional({
    description: 'Kullanıcı telefon numarası',
    example: '+905551234567',
  })
  @IsOptional()
  @IsString({ message: 'Telefon numarası metin olmalıdır' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Geçerli bir telefon numarası giriniz (E.164 formatı)',
  })
  phone?: string;

  // Cinsiyet (isteğe bağlı)
  @ApiPropertyOptional({
    description: 'Kullanıcı cinsiyeti',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Geçerli bir cinsiyet seçiniz (male, female, other)' })
  gender?: Gender;
}
