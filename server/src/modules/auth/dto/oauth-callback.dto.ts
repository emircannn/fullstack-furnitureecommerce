// ============================================================
// Belenay Mobilya - OAuth Callback DTO
// Google ve Apple gibi OAuth sağlayıcılarından dönen
// kullanıcı bilgilerini taşıyan veri yapısı.
// ============================================================

import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider } from '../enums/provider.enum';

export class OAuthCallbackDto {
  // OAuth sağlayıcısı (google, apple vb.)
  @ApiProperty({
    description: 'OAuth kimlik doğrulama sağlayıcısı',
    enum: Provider,
    example: Provider.GOOGLE,
  })
  @IsNotEmpty({ message: 'Sağlayıcı boş olamaz' })
  @IsEnum(Provider, { message: 'Geçerli bir OAuth sağlayıcısı belirtiniz' })
  provider: Provider;

  // Sağlayıcıdan gelen benzersiz kullanıcı kimliği
  @ApiProperty({
    description: 'OAuth sağlayıcısındaki kullanıcı ID',
    example: '117400929123456789',
  })
  @IsNotEmpty({ message: 'Sağlayıcı kullanıcı ID boş olamaz' })
  @IsString({ message: 'Sağlayıcı kullanıcı ID metin olmalıdır' })
  providerId: string;

  // Kullanıcının e-posta adresi
  @ApiProperty({
    description: 'OAuth profilinden alınan e-posta adresi',
    example: 'ahmet@gmail.com',
  })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi olmalıdır' })
  email: string;

  // Kullanıcının tam adı
  @ApiProperty({
    description: 'OAuth profilinden alınan kullanıcı adı',
    example: 'Ahmet Yılmaz',
  })
  @IsNotEmpty({ message: 'Kullanıcı adı boş olamaz' })
  @IsString({ message: 'Kullanıcı adı metin olmalıdır' })
  name: string;

  // Profil resmi URL (isteğe bağlı)
  @ApiPropertyOptional({
    description: 'OAuth profilinden alınan avatar URL',
    example: 'https://lh3.googleusercontent.com/...',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir URL olmalıdır' })
  avatar?: string;
}
