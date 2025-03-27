import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';

export interface RateLimitOptions {
  points: number;
  duration: number;
  errorMessage?: string;
  window?: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!limit) return true;

    const request = context.switchToHttp().getRequest();
    const key = `ratelimit:${request.ip}:${context.getClass().name}:${context.getHandler().name}`;

    const current = await this.redisService.incr(key);

    // Define window for the key if it doesn't exist
    if (current === 1) {
      await this.redisService.expire(key, limit.window);
    }

    if (current > limit.points) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: limit.errorMessage || 'Rate limit exceeded',
          retryAfter: await this.redisService.ttl(key),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
} 