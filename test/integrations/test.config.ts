import { ConfigService } from '@nestjs/config';

export const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      'integration.retry.maxAttempts': 3,
      'integration.retry.initialDelay': 1000,
      'integration.retry.maxDelay': 10000,
      'integration.retry.backoffFactor': 2,
      'integration.circuitBreaker.failureThreshold': 5,
      'integration.circuitBreaker.resetTimeout': 60000,
      'integration.circuitBreaker.halfOpenTimeout': 30000,
      'integration.monitoring.enabled': true,
      'integration.monitoring.logLevel': 'info',
    };
    return config[key];
  }),
} as unknown as ConfigService; 