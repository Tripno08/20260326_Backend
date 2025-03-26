import { Test, TestingModule } from '@nestjs/testing';
import { RetryService } from '../../src/shared/integrations/retry.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationMonitorService } from '../../src/shared/monitoring/integration-monitor.service';
import { IntegrationsModule } from '../../src/shared/integrations/integrations.module';
import { MonitoringModule } from '../../src/shared/monitoring/monitoring.module';

describe('RetryService', () => {
  let service: RetryService;
  let monitorService: IntegrationMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IntegrationsModule, MonitoringModule],
    }).compile();

    service = module.get<RetryService>(RetryService);
    monitorService = module.get<IntegrationMonitorService>(IntegrationMonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = async () => 'success';
      const result = await service.withRetry(operation, 'test-integration');
      expect(result).toBe('success');
    });

    it('should retry on failure and succeed', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts === 1) {
          throw new Error('First attempt failed');
        }
        return 'success';
      };

      const result = await service.withRetry(operation, 'test-integration');
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should fail after max attempts', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      await expect(
        service.withRetry(operation, 'test-integration'),
      ).rejects.toThrow('Always fails');
    });

    it('should use custom retry configuration', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        throw new Error('Fails');
      };

      const customConfig = {
        maxAttempts: 5,
        initialDelay: 100,
        maxDelay: 1000,
        backoffFactor: 1.5,
      };

      await expect(
        service.withRetry(operation, 'test-integration', customConfig),
      ).rejects.toThrow('Fails');
      expect(attempts).toBe(5);
    });

    it('should log successful attempts', async () => {
      const operation = async () => 'success';
      await service.withRetry(operation, 'test-integration');

      const status = await monitorService.getIntegrationStatus('test-integration');
      expect(status.successCount).toBe(1);
      expect(status.failureCount).toBe(0);
    });

    it('should log failed attempts', async () => {
      const operation = async () => {
        throw new Error('Test error');
      };

      await expect(
        service.withRetry(operation, 'test-integration'),
      ).rejects.toThrow('Test error');

      const status = await monitorService.getIntegrationStatus('test-integration');
      expect(status.successCount).toBe(0);
      expect(status.failureCount).toBe(3); // Default maxAttempts
    });
  });
}); 