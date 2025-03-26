import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const endpoint = request.path;
    const method = request.method;

    // Chave única para o rate limit
    const key = `rate_limit:${ip}:${method}:${endpoint}`;
    
    // Limites por endpoint
    const limits = {
      '/auth/login': { max: 5, window: 60 }, // 5 tentativas por minuto
      '/estudantes': { max: 100, window: 60 }, // 100 requisições por minuto
      '/avaliacoes': { max: 50, window: 60 }, // 50 requisições por minuto
      default: { max: 30, window: 60 }, // 30 requisições por minuto para outros endpoints
    };

    const limit = limits[endpoint] || limits.default;
    
    try {
      // Incrementar contador
      const current = await this.redisService.incr(key);
      
      // Se for a primeira requisição, definir TTL
      if (current === 1) {
        await this.redisService.expire(key, limit.window);
      }

      // Verificar se excedeu o limite
      if (current > limit.max) {
        throw new HttpException(
          {
            error: 'Too Many Requests',
            message: 'Você excedeu o limite de requisições permitido',
            retryAfter: await this.redisService.ttl(key),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Em caso de erro no Redis, permitir a requisição
      console.error('Erro no rate limiting:', error);
      return true;
    }
  }
} 