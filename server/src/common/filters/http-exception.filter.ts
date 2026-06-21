// ============================================================
// Belenay Mobilya - HTTP Exception Filter
// Tüm exception'ları yakalar ve standart hata formatında
// yanıt döndürür. Hem HttpException hem de bilinmeyen
// hatalar işlenir.
// Çıktı formatı:
// {
//   "success": false,
//   "error": "UNAUTHORIZED",
//   "message": "...",
//   "statusCode": 401,
//   "timestamp": "...",
//   "path": "/api/auth/login"
// }
// ============================================================

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

// ---- Standart hata yanıt yapısı ----
interface ErrorResponse {
  success: false;
  error: string;
  message: string | string[];
  statusCode: number;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof ThrottlerException) {
      // ---- Rate limit aşıldı ----
      statusCode = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Çok fazla istek gönderdiniz. Lütfen bir süre bekleyiniz.';
      error = 'TOO_MANY_REQUESTS';
    } else if (exception instanceof HttpException) {
      // ---- NestJS HTTP hataları ----
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as { message?: string | string[]; error?: string };
        message = resp.message ?? exception.message;
        error = resp.error ?? this.getErrorCode(statusCode);
      } else {
        message = exception.message;
      }

      error = error! ?? this.getErrorCode(statusCode);
    } else if (exception instanceof Error) {
      // ---- Bilinmeyen JavaScript hataları ----
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === 'production'
          ? 'Sunucu tarafında bir hata oluştu'
          : exception.message;
      error = 'INTERNAL_SERVER_ERROR';

      // Beklenmeyen hataları loglara yaz
      this.logger.error(
        `Beklenmeyen hata: ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      // ---- Tanımsız hata türleri ----
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Bilinmeyen bir hata oluştu';
      error = 'UNKNOWN_ERROR';
    }

    // Hata yanıtını oluştur
    const errorResponse: ErrorResponse = {
      success: false,
      error: error!,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 500 ve üzeri hataları logla
    if (statusCode >= 500) {
      this.logger.error(
        `[${statusCode}] ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${statusCode}] ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      );
    }

    // Yanıtı gönder
    response.status(statusCode).json(errorResponse);
  }

  /**
   * HTTP durum kodundan hata kodu üretir.
   */
  private getErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return errorCodes[statusCode] ?? 'ERROR';
  }
}
