import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class TestService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getTestInfo() {
    return {
      status: 'ok',
      message: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
    };
  }

  async getCachedValue(key: string) {
    return this.cacheManager.get(key);
  }

  async setCachedValue(key: string, value: any, ttl?: number) {
    if (ttl) {
      return this.cacheManager.set(key, value, ttl);
    }
    return this.cacheManager.set(key, value);
  }
} 