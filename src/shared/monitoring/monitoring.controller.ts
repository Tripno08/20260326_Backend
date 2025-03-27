import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Monitoramento')
@Controller('monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar status da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação funcionando corretamente' })
  health() {
    return this.monitoringService.health();
  }

  @Get('stats')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Estatísticas do sistema' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso não autorizado' })
  getStats() {
    return this.monitoringService.getStats();
  }

  @Get('errors')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Últimos erros registrados' })
  @ApiResponse({ status: 200, description: 'Erros obtidos com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso não autorizado' })
  getErrors() {
    return this.monitoringService.getErrors();
  }
} 