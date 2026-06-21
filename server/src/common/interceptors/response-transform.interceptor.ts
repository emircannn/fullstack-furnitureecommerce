// ============================================================
// Belenay Mobilya - Response Transform Interceptor
// Tüm başarılı API yanıtlarını standart formata sarar.
// Çıktı formatı:
// {
//   "success": true,
//   "data": { ...gerçek veri... },
//   "message": "OK",
//   "timestamp": "2024-01-01T00:00:00.000Z"
// }
// ============================================================

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

// ---- Standart API yanıt yapısı ----
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // HTTP yanıt nesnesini al
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Zaten dönüştürülmüş bir yanıt varsa tekrar sarmama
        // (ör: doğrudan Response ile işlenen endpoint'ler)
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<T>;
        }

        // Standart API yanıt formatı
        return {
          // İşlem başarılı mı
          success: true,
          // Gerçek veri
          data: data ?? null,
          // Durum mesajı
          message: 'OK',
          // HTTP durum kodu
          statusCode: response.statusCode,
          // İsteğin işlendiği zaman
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
