// ============================================================
// Belenay Mobilya - Logging Interceptor
// Her HTTP isteği için method, URL, durum kodu ve süre
// bilgilerini loglar. Yavaş istekleri (>500ms) uyarı ile işaretler.
// ============================================================

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';

// Yavaş istek eşiği (milisaniye)
const SLOW_REQUEST_THRESHOLD_MS = 500;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // HTTP isteği ve yanıt nesnelerini al
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // İstek bilgilerini al
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') ?? '';
    const ip = request.ip ?? 'unknown';

    // İstek başlangıç zamanı
    const startTime = Date.now();

    return next.handle().pipe(
      // Başarılı yanıt logu
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Yavaş istek uyarısı
        if (duration > SLOW_REQUEST_THRESHOLD_MS) {
          this.logger.warn(
            `⚠️ YAVAŞ İSTEK: ${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`,
          );
        } else {
          this.logger.log(
            `${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`,
          );
        }
      }),

      // Hata logu (exception filter devreye girmeden önce)
      catchError((error: Error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `❌ HATA: ${method} ${url} - ${duration}ms - IP: ${ip} - ${error.message}`,
          error.stack,
        );
        return throwError(() => error);
      }),
    );
  }
}
