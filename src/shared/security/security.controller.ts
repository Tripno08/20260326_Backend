import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SecurityTestService } from './security-test.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CargoUsuario } from '@prisma/client';

@ApiTags('Security')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(private readonly securityService: SecurityTestService) {}

  @Get('report')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Gera um relatório de segurança do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Retorna um relatório detalhado de segurança',
    schema: {
      type: 'object',
      properties: {
        vulnerabilities: {
          type: 'object',
          properties: {
            sqlInjection: { type: 'boolean' },
            xss: { type: 'boolean' },
            csrf: { type: 'boolean' },
            rateLimit: { type: 'boolean' },
            fileUpload: { type: 'boolean' },
            authentication: { type: 'boolean' },
          },
        },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getSecurityReport() {
    return this.securityService.getSecurityReport();
  }

  @Post('test/password')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa a força de uma senha' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de força da senha',
    schema: {
      type: 'object',
      properties: {
        isStrong: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async testPasswordStrength(@Body('password') password: string) {
    return this.securityService.testPasswordStrength(password);
  }

  @Post('test/sql-injection')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa vulnerabilidade de SQL Injection' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de SQL Injection',
    schema: {
      type: 'object',
      properties: {
        isVulnerable: { type: 'boolean' },
      },
    },
  })
  async testSqlInjection(@Body('query') query: string) {
    const isVulnerable = await this.securityService.testSqlInjectionVulnerability(query);
    return { isVulnerable };
  }

  @Post('test/xss')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa vulnerabilidade de XSS' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de XSS',
    schema: {
      type: 'object',
      properties: {
        isVulnerable: { type: 'boolean' },
      },
    },
  })
  async testXss(@Body('input') input: string) {
    const isVulnerable = await this.securityService.testXssVulnerability(input);
    return { isVulnerable };
  }

  @Post('test/csrf')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa vulnerabilidade de CSRF' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de CSRF',
    schema: {
      type: 'object',
      properties: {
        isVulnerable: { type: 'boolean' },
      },
    },
  })
  async testCsrf(@Body('token') token: string) {
    const isVulnerable = await this.securityService.testCsrfVulnerability(token);
    return { isVulnerable };
  }

  @Post('test/file-upload')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa vulnerabilidade de upload de arquivos' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de upload de arquivos',
    schema: {
      type: 'object',
      properties: {
        isVulnerable: { type: 'boolean' },
      },
    },
  })
  async testFileUpload(@Body('filename') filename: string) {
    const isVulnerable = await this.securityService.testFileUploadVulnerability(filename);
    return { isVulnerable };
  }

  @Post('test/authentication')
  @Roles(CargoUsuario.ADMIN)
  @ApiOperation({ summary: 'Testa vulnerabilidade de autenticação' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o resultado do teste de autenticação',
    schema: {
      type: 'object',
      properties: {
        isVulnerable: { type: 'boolean' },
      },
    },
  })
  async testAuthentication(@Body('token') token: string) {
    const isVulnerable = await this.securityService.testAuthenticationVulnerability(token);
    return { isVulnerable };
  }
} 