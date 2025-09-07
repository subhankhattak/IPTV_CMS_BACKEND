import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  constructor(
    /**
     * Inject ConfigService
     */
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse();
        const statusCode = response.statusCode;

        const message = data.message;
        delete data?.message;

        // If the data is already in the format { data: ... }, keep it as is.
        // Otherwise, wrap the data in a { data: ... } object.
        if (data.data && data.data.errors && Array.isArray(data.data.errors)) {
          if (data.data.errors[0].message.includes('AUTH_GUARD')) {
            const messages = data.data.errors[0].message;
            throw new UnauthorizedException(messages.trim());
          }
          const messages = data.data.errors[0].message.split(',');
          messages.shift(); // remove index 0
          throw new BadRequestException(messages.join(' ').trim());
        }
        return {
          statusCode,
          apiVersion: this.configService.get('appConfig.apiVersion'),
          message,
          data: data.data,
        };
      }),
    );
  }
}
