import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CargoUsuario } from '../../shared/enums/cargo-usuario.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Segurança')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('active-sessions')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Listar sessões ativas' })
  @ApiResponse({ status: 200, description: 'Lista de sessões ativas' })
  @ApiResponse({ status: 403, description: 'Acesso não autorizado' })
  getActiveSessions() {
    return this.securityService.getActiveSessions();
  }

  @Post('revoke-session')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Revogar uma sessão' })
  @ApiResponse({ status: 200, description: 'Sessão revogada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso não autorizado' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  revokeSession(@Body('sessionId') sessionId: string) {
    return this.securityService.revokeSession(sessionId);
  }

  @Get('audit-logs')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Obter logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Logs de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso não autorizado' })
  getAuditLogs() {
    return this.securityService.getAuditLogs();
  }
} 