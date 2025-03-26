import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number;
  key?: string;
}

export const Cache = (options: CacheOptions = {}) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const redisService = this.redisService as RedisService;
      const request = args[0] as ExecutionContext;
      const user = request.user;

      const cacheKey = options.key || `${target.constructor.name}:${propertyKey}:${user.id}`;
      const cachedValue = await redisService.get(cacheKey);

      if (cachedValue) {
        return JSON.parse(cachedValue);
      }

      const result = await originalMethod.apply(this, args);
      await redisService.set(cacheKey, JSON.stringify(result), options.ttl);

      return result;
    };

    return descriptor;
  };
};

export const InvalidateCache = (keyPattern: string) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const redisService = this.redisService as RedisService;
      const result = await originalMethod.apply(this, args);
      
      // Invalidate all keys matching the pattern
      const keys = await redisService.client.keys(keyPattern);
      if (keys.length > 0) {
        await redisService.client.del(...keys);
      }

      return result;
    };

    return descriptor;
  };
}; 