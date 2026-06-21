// ============================================================
// Belenay Mobilya - Refresh Token DTO
// Access token yenilemek için kullanılan refresh token
// veri yapısını tanımlar. Token HttpOnly cookie'den de
// alınabilir; bu DTO doğrudan body'den gönderim için kullanılır.
// ============================================================

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  // Yenileme token'ı
  @ApiProperty({
    description: 'Geçerli bir refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token boş olamaz' })
  @IsString({ message: 'Refresh token metin olmalıdır' })
  refreshToken: string;
}
