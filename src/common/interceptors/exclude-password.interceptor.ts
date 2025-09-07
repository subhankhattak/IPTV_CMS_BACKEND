import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.removePassword(data);
      })
    );
  }

  private removePassword(data: any): any {
    if (!data) return data;

    // Handle ResponseDto structure
    if (data.data !== undefined && data.success !== undefined) {
      // This is a ResponseDto, remove password from the data field
      data.data = this.removePasswordFromObject(data.data);
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.removePasswordFromObject(item));
    }

    // Handle single objects
    return this.removePasswordFromObject(data);
  }

  private removePasswordFromObject(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.removePasswordFromObject(item));
    }

    // Handle objects
    const result = { ...obj };

    // Remove password fields
    delete result.password;
    delete result.pwd;
    delete result.pass;
    delete result.passwd;

    // Recursively remove passwords from nested objects
    for (const key in result) {
      if (result[key] && typeof result[key] === "object") {
        result[key] = this.removePasswordFromObject(result[key]);
      }
    }

    return result;
  }
}
