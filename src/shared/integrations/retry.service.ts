import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMonitorService } from '../monitoring/integration-monitor.service';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly defaultConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  };

  constructor(
    private readonly config: ConfigService,
    private readonly monitorService: IntegrationMonitorService,
  ) {}

  async withRetry<T>(
    operation: () => Promise<T>,
    integrationId: string,
    customConfig?: Partial<RetryConfig>,
  ): Promise<T> {
    const config = { ...this.defaultConfig, ...customConfig };
    let lastError: Error;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        await this.monitorService.logIntegrationAttempt(integrationId, true);
        return result;
      } catch (error) {
        lastError = error;
        await this.monitorService.logIntegrationAttempt(integrationId, false, error);

        if (attempt === config.maxAttempts) {
          this.logger.error(
            `Todas as tentativas falharam para integração ${integrationId}: ${error.message}`,
          );
          throw error;
        }

        this.logger.warn(
          `Tentativa ${attempt}/${config.maxAttempts} falhou para integração ${integrationId}. Tentando novamente em ${delay}ms.`,
        );

        await this.delay(delay);
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 