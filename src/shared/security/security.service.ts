import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async getActiveSessions() {
    try {
      // Obtém todas as chaves de sessão do Redis
      const sessionKeys = await this.redis.keys('auth:session:*');
      
      // Para cada chave, recupera os detalhes da sessão
      const sessions = await Promise.all(
        sessionKeys.map(async (key) => {
          const sessionData = await this.redis.get(key);
          if (!sessionData) return null;
          
          try {
            // Tenta fazer parse dos dados da sessão
            const session = JSON.parse(sessionData);
            const userId = key.split(':')[2];
            
            // Adicionando dados do usuário se disponível
            let userData = null;
            if (userId) {
              userData = await this.prisma.usuario.findUnique({
                where: { id: userId },
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  cargo: true,
                },
              });
            }
            
            return {
              sessionId: key,
              userId,
              createdAt: session.createdAt || new Date().toISOString(),
              lastActivity: session.lastActivity || new Date().toISOString(),
              expiresAt: session.expiresAt,
              ipAddress: session.ipAddress || 'unknown',
              userAgent: session.userAgent || 'unknown',
              user: userData,
            };
          } catch (error) {
            return {
              sessionId: key,
              error: 'Erro ao processar dados da sessão',
            };
          }
        }),
      );
      
      // Filtra sessões nulas
      return sessions.filter(Boolean);
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async revokeSession(sessionId: string) {
    // Verifica se a sessão existe
    const exists = await this.redis.exists(sessionId);
    
    if (!exists) {
      throw new NotFoundException('Sessão não encontrada');
    }
    
    // Remove a sessão
    await this.redis.del(sessionId);
    
    return {
      success: true,
      message: 'Sessão revogada com sucesso',
      sessionId,
    };
  }

  async getAuditLogs() {
    try {
      // Em uma implementação real, isso buscaria logs de auditoria
      // do banco de dados ou outro serviço de armazenamento
      const logs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: 'user-id-1',
          action: 'LOGIN',
          resource: 'auth',
          ipAddress: '192.168.1.1',
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          userId: 'user-id-2',
          action: 'UPDATE',
          resource: 'estudantes',
          ipAddress: '192.168.1.2',
        },
      ];
      
      return logs;
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
} 