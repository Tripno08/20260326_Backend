import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async health() {
    try {
      // Verificar conexão com banco de dados
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Verificar conexão com Redis
      const redisHealth = await this.redis.ping();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          redis: redisHealth === 'PONG' ? 'up' : 'down',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async getStats() {
    try {
      // Contagem de usuários
      const usuariosCount = await this.prisma.usuario.count();
      
      // Contagem de estudantes
      const estudantesCount = await this.prisma.estudante.count();
      
      // Contagem de instituições
      const instituicoesCount = await this.prisma.instituicao.count();
      
      // Contagem de avaliações
      const avaliacoesCount = await this.prisma.avaliacao.count();
      
      // Contagem de intervenções
      const intervencoesCount = await this.prisma.intervencao.count();
      
      return {
        timestamp: new Date().toISOString(),
        counts: {
          usuarios: usuariosCount,
          estudantes: estudantesCount,
          instituicoes: instituicoesCount,
          avaliacoes: avaliacoesCount,
          intervencoes: intervencoesCount,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async getErrors() {
    try {
      // Simular obtenção de logs de erro 
      // Na implementação real, pode-se obter de um serviço de log
      const recentErrors = [
        {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Exemplo de erro',
          service: 'api',
        },
      ];
      
      return {
        timestamp: new Date().toISOString(),
        errors: recentErrors,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
} 