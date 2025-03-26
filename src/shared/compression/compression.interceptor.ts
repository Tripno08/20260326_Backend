import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as compression from 'compression';

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private compressor = compression();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Observable(subscriber => {
      this.compressor(request, response, (err) => {
        if (err) {
          subscriber.error(err);
          return;
        }

        next.handle().pipe(
          map(data => {
            // Não comprime respostas menores que 1KB
            if (JSON.stringify(data).length < 1024) {
              return data;
            }
            return data;
          })
        ).subscribe({
          next: (data) => subscriber.next(data),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete()
        });
      });
    });
  }
} 