import { Module } from '@nestjs/common';
import { RetryService } from './retry.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { ConfigModule } from '@nestjs/config';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [ConfigModule, MonitoringModule],
  providers: [RetryService, CircuitBreakerService],
  exports: [RetryService, CircuitBreakerService],
})
export class IntegrationsModule {} 