import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    // Challenge target simulation endpoints should bypass the platform ApiResponse envelope
    if (req?.url?.includes('/targets') || res?.headersSent) {
      return next.handle().pipe(
        map((data) => {
          if (res?.headersSent) {
            return undefined;
          }
          return data;
        }),
      );
    }

    const statusCode = res?.statusCode || 200;
    return next.handle().pipe(
      map((data) => {
        if (res?.headersSent) return data;
        return {
          success: true,
          statusCode,
          data,
        };
      }),
    );
  }
}
