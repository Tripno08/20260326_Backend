import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { CacheManagerOptions } from '@nestjs/cache-manager';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheManagerOptions => {
        return {
          isGlobal: true,
          ttl: configService.get('CACHE_TTL', 300),
          max: configService.get('CACHE_MAX_ITEMS', 100),
          store: 'redis',
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
          password: configService.get('REDIS_PASSWORD', ''),
        } as CacheManagerOptions;
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {} 