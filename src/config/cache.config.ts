import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';

export const cacheConfig: CacheModuleOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  ttl: 60 * 60 * 24, // 24 hours
  max: 100, // maximum number of items in cache
};

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60, // time to live in seconds
      limit: 10, // number of requests per TTL
    },
  ],
};

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number): number => Math.min(times * 50, 2000),
}; 