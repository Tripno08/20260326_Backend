import { Module } from '@nestjs/common';
import { IntegrationMonitorService } from './integration-monitor.service';
import { MonitoringController } from './monitoring.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule],
  controllers: [MonitoringController],
  providers: [IntegrationMonitorService],
  exports: [IntegrationMonitorService],
})
export class MonitoringModule {} 