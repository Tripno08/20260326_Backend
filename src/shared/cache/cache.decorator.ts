import { createParamDecorator, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

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
      const context = args[0] as ExecutionContext;
      
      // Gerar chave de cache baseada no método e parâmetros
      const cacheKey = options.key || 
                       generateCacheKey(context, target.constructor.name, propertyKey);
                       
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

function generateCacheKey(context: ExecutionContext, className: string, methodName: string): string {
  try {
    // Tentar extrair informações do request (se disponível)
    const request = context.switchToHttp().getRequest();
    let keyParts = [`${className}:${methodName}`];
    
    // Adicionar ID do usuário se estiver autenticado
    if (request && request.user && request.user.sub) {
      keyParts.push(`user:${request.user.sub}`);
    }
    
    // Adicionar parâmetros do request
    if (request) {
      // Parâmetros da URL
      if (request.params && Object.keys(request.params).length > 0) {
        keyParts.push(`params:${JSON.stringify(request.params)}`);
      }
      
      // Query parameters
      if (request.query && Object.keys(request.query).length > 0) {
        keyParts.push(`query:${JSON.stringify(request.query)}`);
      }
    }
    
    return keyParts.join(':');
  } catch (error) {
    // Em caso de erro, retornar uma chave simples
    return `${className}:${methodName}:${Date.now()}`;
  }
}

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
      const keys = await redisService.keys(keyPattern);
      if (keys.length > 0) {
        await redisService.del(...keys);
      }

      return result;
    };

    return descriptor;
  };
};

@Injectable()
export class CacheDecorator {
  constructor(private readonly redisService: RedisService) {}

  async get(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisService.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.redisService.del(key);
  }

  async clear(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
} 