import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from './redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request, user);
    const cachedValue = await this.redisService.get(cacheKey);

    if (cachedValue) {
      response.setHeader('X-Cache', 'HIT');
      return of(JSON.parse(cachedValue));
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (data) => {
        const endTime = Date.now();
        response.setHeader('X-Response-Time', endTime - startTime);
        response.setHeader('X-Cache', 'MISS');

        try {
          await this.redisService.set(cacheKey, JSON.stringify(data), 3600); // 1 hora de TTL
        } catch (error) {
          console.error('Cache error:', error);
          response.setHeader('X-Cache', 'ERROR');
        }
      }),
    );
  }

  private generateCacheKey(request: any, user: any): string {
    const { method, url, query } = request;
    const queryString = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    return `${method}:${url}:${queryString}:${user.id}`;
  }
} 