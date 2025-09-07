import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate unique request ID
    const requestId = uuidv4();

    // Add request ID to request object for potential use in other parts of the application
    (request as any).requestId = requestId;

    // Log incoming request with route information
    this.logIncomingRequest(request, requestId);

    return next.handle().pipe(
      tap(() => {
        // Log response status code and URL
        const statusCode = response.statusCode;
        const statusMessage = this.getStatusMessage(statusCode);
        const responseUrl = request.originalUrl || request.url;
        this.logger.verbose(
          `📫 RESPONSE STATUS: ${statusCode} - ${statusMessage} | 🆔 Request ID: ${requestId}`,
        );
      }),
    );
  }

  private logIncomingRequest(request: Request, requestId: string): void {
    const route = `${request.method} ${request.url}`;
    const ip = this.getClientIp(request);
    const userAgent = request.get('User-Agent') || 'Unknown';
    const timestamp = new Date().toISOString();

    // Prettier, multi-line, indented log for better readability
    this.logger.verbose(
      `\n` +
        `🚀 INCOMING REQUEST:\n` +
        `  🆔 Request ID: ${requestId}\n` +
        `  📍 Route: ${route}\n` +
        `  📝 Method: ${request.method}\n` +
        `  🔗 URL: ${request.url}\n` +
        `  🌐 IP: ${ip}\n` +
        `  🖥️ User Agent: ${userAgent}\n` +
        `  ⏰ Timestamp: ${timestamp}\n` +
        `  ❓ Query: ${JSON.stringify(request.query)}\n` +
        `  📋 Params: ${JSON.stringify(request.params)}\n`,
    );
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    return (
      request.ip ||
      request.socket.remoteAddress ||
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
      (Array.isArray(realIp) ? realIp[0] : realIp) ||
      'Unknown'
    );
  }

  private getStatusMessage(statusCode: number): string {
    if (statusCode >= 500) {
      return '❌ Server Error';
    } else if (statusCode >= 400) {
      return '⚠️ Client Error';
    } else if (statusCode >= 300) {
      return '↪️ Redirection';
    } else if (statusCode >= 200) {
      return '✅ Success';
    } else {
      return '❔ Informational';
    }
  }
}
