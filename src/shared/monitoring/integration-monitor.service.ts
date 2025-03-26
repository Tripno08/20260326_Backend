import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IntegrationMonitorService {
  private readonly logger = new Logger(IntegrationMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async logIntegrationAttempt(integrationId: string, success: boolean, error?: any) {
    await this.prisma.integrationLog.create({
      data: {
        integrationId,
        success,
        error: error ? JSON.stringify(error) : null,
        timestamp: new Date(),
      },
    });

    if (!success) {
      this.logger.error(`Falha na integração ${integrationId}: ${error?.message || 'Erro desconhecido'}`);
    }
  }

  async getIntegrationStatus(integrationId: string) {
    const recentLogs = await this.prisma.integrationLog.findMany({
      where: {
        integrationId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    const successCount = recentLogs.filter(log => log.success).length;
    const failureCount = recentLogs.length - successCount;
    const successRate = recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 0;

    return {
      totalAttempts: recentLogs.length,
      successCount,
      failureCount,
      successRate,
      lastAttempt: recentLogs[0]?.timestamp,
      lastError: recentLogs[0]?.error,
    };
  }

  async getIntegrationMetrics(integrationId: string) {
    const logs = await this.prisma.integrationLog.findMany({
      where: {
        integrationId,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Agrupar por dia
    const dailyMetrics = logs.reduce((acc, log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          errors: [],
        };
      }
      acc[date].attempts++;
      if (log.success) {
        acc[date].successes++;
      } else {
        acc[date].failures++;
        acc[date].errors.push(log.error);
      }
      return acc;
    }, {});

    return {
      dailyMetrics,
      totalAttempts: logs.length,
      successRate: logs.length > 0 
        ? (logs.filter(log => log.success).length / logs.length) * 100 
        : 0,
    };
  }

  async checkIntegrationHealth(integrationId: string) {
    const status = await this.getIntegrationStatus(integrationId);
    const metrics = await this.getIntegrationMetrics(integrationId);

    const healthStatus = {
      status: status.successRate >= 95 ? 'healthy' : 
              status.successRate >= 80 ? 'degraded' : 'unhealthy',
      details: {
        currentStatus: status,
        metrics,
        recommendations: this.generateRecommendations(status, metrics),
      },
    };

    if (healthStatus.status !== 'healthy') {
      this.logger.warn(`Integração ${integrationId} está com status ${healthStatus.status}`);
    }

    return healthStatus;
  }

  private generateRecommendations(status: any, metrics: any) {
    const recommendations = [];

    if (status.successRate < 95) {
      recommendations.push({
        type: 'performance',
        message: 'Taxa de sucesso abaixo do esperado. Verificar logs de erro para identificar padrões.',
      });
    }

    if (status.failureCount > 0) {
      recommendations.push({
        type: 'reliability',
        message: 'Falhas detectadas. Implementar retry mechanism e circuit breaker.',
      });
    }

    if (metrics.totalAttempts < 100) {
      recommendations.push({
        type: 'monitoring',
        message: 'Volume de requisições baixo. Verificar se a integração está sendo utilizada corretamente.',
      });
    }

    return recommendations;
  }

  async monitorAllIntegrations() {
    const integrations = await this.prisma.integracaoPlataforma.findMany({
      where: { ativo: true },
    });

    const healthChecks = await Promise.all(
      integrations.map(integration => 
        this.checkIntegrationHealth(integration.id)
      )
    );

    const summary = {
      totalIntegrations: integrations.length,
      healthy: healthChecks.filter(h => h.status === 'healthy').length,
      degraded: healthChecks.filter(h => h.status === 'degraded').length,
      unhealthy: healthChecks.filter(h => h.status === 'unhealthy').length,
      details: healthChecks,
    };

    this.logger.log('Resumo do monitoramento de integrações:', summary);
    return summary;
  }
} 