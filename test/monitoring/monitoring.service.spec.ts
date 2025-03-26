import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationMonitorService } from '../../src/shared/monitoring/integration-monitor.service';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MonitoringModule } from '../../src/shared/monitoring/monitoring.module';

describe('IntegrationMonitorService', () => {
  let service: IntegrationMonitorService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MonitoringModule],
    }).compile();

    service = module.get<IntegrationMonitorService>(IntegrationMonitorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logIntegrationAttempt', () => {
    it('should log successful integration attempt', async () => {
      const integrationId = 'test-integration';
      await service.logIntegrationAttempt(integrationId, true);

      const status = await service.getIntegrationStatus(integrationId);
      expect(status.successCount).toBe(1);
      expect(status.failureCount).toBe(0);
    });

    it('should log failed integration attempt with error', async () => {
      const integrationId = 'test-integration';
      const error = new Error('Test error');
      await service.logIntegrationAttempt(integrationId, false, error);

      const status = await service.getIntegrationStatus(integrationId);
      expect(status.successCount).toBe(0);
      expect(status.failureCount).toBe(1);
      expect(status.lastError).toBeDefined();
    });
  });

  describe('getIntegrationStatus', () => {
    it('should calculate correct success rate', async () => {
      const integrationId = 'test-integration';
      
      // Log 4 attempts: 3 successful, 1 failed
      await service.logIntegrationAttempt(integrationId, true);
      await service.logIntegrationAttempt(integrationId, true);
      await service.logIntegrationAttempt(integrationId, true);
      await service.logIntegrationAttempt(integrationId, false, new Error('Test error'));

      const status = await service.getIntegrationStatus(integrationId);
      expect(status.successRate).toBe(75);
    });
  });

  describe('getIntegrationMetrics', () => {
    it('should group metrics by day', async () => {
      const integrationId = 'test-integration';
      
      // Log attempts for different days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.integrationLog.create({
        data: {
          integrationId,
          success: true,
          timestamp: today,
        },
      });

      await prisma.integrationLog.create({
        data: {
          integrationId,
          success: false,
          error: 'Test error',
          timestamp: yesterday,
        },
      });

      const metrics = await service.getIntegrationMetrics(integrationId);
      expect(Object.keys(metrics.dailyMetrics).length).toBe(2);
    });
  });

  describe('checkIntegrationHealth', () => {
    it('should return healthy status for high success rate', async () => {
      const integrationId = 'test-integration';
      
      // Log 10 successful attempts
      for (let i = 0; i < 10; i++) {
        await service.logIntegrationAttempt(integrationId, true);
      }

      const health = await service.checkIntegrationHealth(integrationId);
      expect(health.status).toBe('healthy');
    });

    it('should return degraded status for moderate success rate', async () => {
      const integrationId = 'test-integration';
      
      // Log 8 successful and 2 failed attempts
      for (let i = 0; i < 8; i++) {
        await service.logIntegrationAttempt(integrationId, true);
      }
      for (let i = 0; i < 2; i++) {
        await service.logIntegrationAttempt(integrationId, false, new Error('Test error'));
      }

      const health = await service.checkIntegrationHealth(integrationId);
      expect(health.status).toBe('degraded');
    });

    it('should return unhealthy status for low success rate', async () => {
      const integrationId = 'test-integration';
      
      // Log 5 successful and 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await service.logIntegrationAttempt(integrationId, true);
      }
      for (let i = 0; i < 5; i++) {
        await service.logIntegrationAttempt(integrationId, false, new Error('Test error'));
      }

      const health = await service.checkIntegrationHealth(integrationId);
      expect(health.status).toBe('unhealthy');
    });
  });

  describe('monitorAllIntegrations', () => {
    it('should monitor all active integrations', async () => {
      // Create test integrations
      const integration1 = await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration 1',
          ativo: true,
        },
      });

      const integration2 = await prisma.integracaoPlataforma.create({
        data: {
          nome: 'Test Integration 2',
          ativo: true,
        },
      });

      // Log some attempts for each integration
      await service.logIntegrationAttempt(integration1.id, true);
      await service.logIntegrationAttempt(integration2.id, false, new Error('Test error'));

      const summary = await service.monitorAllIntegrations();
      expect(summary.totalIntegrations).toBe(2);
      expect(summary.healthy).toBe(1);
      expect(summary.degraded + summary.unhealthy).toBe(1);
    });
  });
}); 