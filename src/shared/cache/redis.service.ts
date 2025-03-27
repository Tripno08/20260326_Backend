import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private redisEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.redisEnabled = this.configService.get<string>('REDIS_ENABLED') === 'true';
    
    if (this.redisEnabled) {
      this.redisClient = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD', ''),
      });
    }
  }

  async onModuleInit() {
    if (this.redisEnabled) {
      try {
        await this.ping();
        console.log('Redis client connected');
      } catch (error) {
        console.error('Redis connection failed', error);
      }
    } else {
      console.log('Redis is disabled');
    }
  }

  async onModuleDestroy() {
    if (this.redisEnabled && this.redisClient) {
      await this.redisClient.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redisEnabled) return null;
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (!this.redisEnabled) return 'OK';
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  async del(key: string): Promise<number> {
    if (!this.redisEnabled) return 0;
    return this.redisClient.del(key);
  }

  async ping(): Promise<string> {
    if (!this.redisEnabled) return 'PONG';
    return this.redisClient.ping();
  }
} 