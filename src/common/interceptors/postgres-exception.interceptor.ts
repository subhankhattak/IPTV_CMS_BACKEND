import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import { QueryFailedError } from 'typeorm';
import { ResponseDto } from '../dtos/response';

@Injectable()
export class PostgresExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof QueryFailedError) {
          const pgError = error.driverError;
          const httpError = this.mapPostgresError(pgError);
          return throwError(() => httpError);
        }

        // Forward other errors untouched (or optionally wrap them too)
        return throwError(() => error);
      }),
    );
  }

  private mapPostgresError(error: any): HttpException {
    const code = error.code;
    let message = 'Database error';
    let status = HttpStatus.BAD_REQUEST;

    switch (code) {
      case '23505': // Unique violation
        message = 'Unique constraint violated. Duplicate value exists.';
        status = HttpStatus.CONFLICT;
        break;
      case '23503': // Foreign key violation
        message = 'Foreign key constraint violated.';
        status = HttpStatus.BAD_REQUEST;
        break;
      case '23502': // Not null violation
        message = 'Missing required field (not null violation).';
        status = HttpStatus.BAD_REQUEST;
        break;
      case '22P02': // Invalid text representation
        message = 'Invalid input syntax (e.g., invalid UUID format).';
        status = HttpStatus.BAD_REQUEST;
        break;
      default:
        message = error.detail || 'Unhandled database error';
        status = HttpStatus.BAD_REQUEST;
        break;
    }

    // ✅ Return error wrapped in your API response format
    const errorResponse = new ResponseDto<any>(message);

    return new HttpException(errorResponse, status);
  }
}
