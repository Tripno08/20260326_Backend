import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IntegrationMonitorService } from './integration-monitor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MonitoringController {
  constructor(private readonly monitoringService: IntegrationMonitorService) {}

  @Get('integrations')
  async getIntegrationsStatus() {
    return this.monitoringService.monitorAllIntegrations();
  }

  @Get('integrations/:id')
  async getIntegrationStatus(@Param('id') id: string) {
    return this.monitoringService.checkIntegrationHealth(id);
  }

  @Get('integrations/:id/metrics')
  async getIntegrationMetrics(@Param('id') id: string) {
    return this.monitoringService.getIntegrationMetrics(id);
  }
} 