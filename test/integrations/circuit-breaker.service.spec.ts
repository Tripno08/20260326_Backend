import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from '../../src/shared/integrations/circuit-breaker.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationMonitorService } from '../../src/shared/monitoring/integration-monitor.service';
import { IntegrationsModule } from '../../src/shared/integrations/integrations.module';
import { MonitoringModule } from '../../src/shared/monitoring/monitoring.module';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let monitorService: IntegrationMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IntegrationsModule, MonitoringModule],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    monitorService = module.get<IntegrationMonitorService>(IntegrationMonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should execute successfully when circuit is closed', async () => {
      const operation = async () => 'success';
      const result = await service.execute(operation, 'test-integration');
      expect(result).toBe('success');
    });

    it('should open circuit after consecutive failures', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      // Execute until circuit opens
      for (let i = 0; i < 5; i++) {
        await expect(
          service.execute(operation, 'test-integration'),
        ).rejects.toThrow('Always fails');
      }

      const status = await service.getCircuitStatus('test-integration');
      expect(status.state).toBe('OPEN');
    });

    it('should half-open circuit after reset timeout', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      // Execute until circuit opens
      for (let i = 0; i < 5; i++) {
        await expect(
          service.execute(operation, 'test-integration'),
        ).rejects.toThrow('Always fails');
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 60000));

      const status = await service.getCircuitStatus('test-integration');
      expect(status.state).toBe('HALF_OPEN');
    });

    it('should close circuit after successful execution in half-open state', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts <= 5) {
          throw new Error('Fails initially');
        }
        return 'success';
      };

      // Execute until circuit opens
      for (let i = 0; i < 5; i++) {
        await expect(
          service.execute(operation, 'test-integration'),
        ).rejects.toThrow('Fails initially');
      }

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Execute successfully
      const result = await service.execute(operation, 'test-integration');
      expect(result).toBe('success');

      const status = await service.getCircuitStatus('test-integration');
      expect(status.state).toBe('CLOSED');
    });

    it('should use custom circuit breaker configuration', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      const customConfig = {
        failureThreshold: 3,
        resetTimeout: 30000,
        halfOpenTimeout: 5000,
      };

      // Execute until circuit opens with custom config
      for (let i = 0; i < 3; i++) {
        await expect(
          service.execute(operation, 'test-integration', customConfig),
        ).rejects.toThrow('Always fails');
      }

      const status = await service.getCircuitStatus('test-integration');
      expect(status.state).toBe('OPEN');
    });

    it('should log successful executions', async () => {
      const operation = async () => 'success';
      await service.execute(operation, 'test-integration');

      const status = await monitorService.getIntegrationStatus('test-integration');
      expect(status.successCount).toBe(1);
      expect(status.failureCount).toBe(0);
    });

    it('should log failed executions', async () => {
      const operation = async () => {
        throw new Error('Test error');
      };

      await expect(
        service.execute(operation, 'test-integration'),
      ).rejects.toThrow('Test error');

      const status = await monitorService.getIntegrationStatus('test-integration');
      expect(status.successCount).toBe(0);
      expect(status.failureCount).toBe(1);
    });
  });

  describe('resetCircuit', () => {
    it('should reset circuit state', async () => {
      const operation = async () => {
        throw new Error('Always fails');
      };

      // Execute until circuit opens
      for (let i = 0; i < 5; i++) {
        await expect(
          service.execute(operation, 'test-integration'),
        ).rejects.toThrow('Always fails');
      }

      await service.resetCircuit('test-integration');

      const status = await service.getCircuitStatus('test-integration');
      expect(status.state).toBe('CLOSED');
      expect(status.failureCount).toBe(0);
    });
  });
}); 