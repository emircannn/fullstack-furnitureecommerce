import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(3, { message: 'Ad Soyad en az 3 karakter olmalıdır' })
  name!: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(10, { message: 'Mesaj en az 10 karakter olmalıdır' })
  message!: string;
}
