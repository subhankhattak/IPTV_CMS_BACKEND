import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  BadGatewayException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError(error => {
        // ✅ Case 1: If already an HttpException (BadRequest, Unauthorized, etc) → Let it pass through
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // ✅ Case 2: Axios Error (external API failures)
        if (this.isAxiosError(error)) {
          console.log(error);
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status || 502;
          const message =
            (axiosError.response?.data as any)?.message ||
            axiosError.response?.statusText ||
            axiosError.message ||
            'External API Error';

          return throwError(
            () =>
              new BadGatewayException({
                statusCode: status,
                message: message,
                error: 'Upstream API Error',
              }),
          );
        }

        // ✅ Case 3: Unknown unhandled errors → Convert to InternalServerError
        return throwError(
          () =>
            new InternalServerErrorException({
              statusCode: 500,
              message: 'Unexpected internal server error',
              error: error?.message || 'Unknown Error',
            }),
        );
      }),
    );
  }

  private isAxiosError(error: any): boolean {
    return error?.isAxiosError === true;
  }
}
