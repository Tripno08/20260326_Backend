import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenTimeout: number;
}

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minuto
    halfOpenTimeout: 30000, // 30 segundos
  };
  private circuits: Map<string, CircuitState> = new Map();

  constructor(private readonly config: ConfigService) {}

  async execute<T>(
    operation: () => Promise<T>,
    integrationId: string,
    customConfig?: Partial<CircuitBreakerConfig>,
  ): Promise<T> {
    const config = { ...this.defaultConfig, ...customConfig };
    const circuit = this.getOrCreateCircuit(integrationId);

    if (this.isCircuitOpen(circuit, config)) {
      throw new Error(`Circuit breaker está aberto para integração ${integrationId}`);
    }

    try {
      const result = await operation();
      this.handleSuccess(circuit);
      return result;
    } catch (error) {
      this.handleFailure(circuit, config);
      throw error;
    }
  }

  private getOrCreateCircuit(integrationId: string): CircuitState {
    if (!this.circuits.has(integrationId)) {
      this.circuits.set(integrationId, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
      });
    }
    return this.circuits.get(integrationId);
  }

  private isCircuitOpen(circuit: CircuitState, config: CircuitBreakerConfig): boolean {
    if (circuit.state === 'CLOSED') {
      return false;
    }

    const now = Date.now();
    const timeSinceLastFailure = now - circuit.lastFailureTime;

    if (circuit.state === 'OPEN' && timeSinceLastFailure >= config.resetTimeout) {
      circuit.state = 'HALF_OPEN';
      this.logger.log(`Circuit breaker entrou em estado HALF_OPEN para integração`);
      return false;
    }

    if (circuit.state === 'HALF_OPEN' && timeSinceLastFailure >= config.halfOpenTimeout) {
      circuit.state = 'OPEN';
      this.logger.warn(`Circuit breaker voltou para estado OPEN para integração`);
      return true;
    }

    return circuit.state === 'OPEN';
  }

  private handleSuccess(circuit: CircuitState): void {
    if (circuit.state === 'HALF_OPEN') {
      circuit.state = 'CLOSED';
      circuit.failures = 0;
      this.logger.log(`Circuit breaker fechado com sucesso`);
    }
  }

  private handleFailure(circuit: CircuitState, config: CircuitBreakerConfig): void {
    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failures >= config.failureThreshold) {
      circuit.state = 'OPEN';
      this.logger.error(`Circuit breaker aberto devido a múltiplas falhas`);
    }
  }

  getCircuitStatus(integrationId: string): CircuitState {
    return this.circuits.get(integrationId) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
    };
  }

  resetCircuit(integrationId: string): void {
    this.circuits.delete(integrationId);
    this.logger.log(`Circuit breaker resetado para integração ${integrationId}`);
  }
} 