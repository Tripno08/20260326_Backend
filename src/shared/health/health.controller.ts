import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verifica a saúde do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o status de saúde do sistema',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'degraded', 'unhealthy'],
        },
        details: {
          type: 'object',
          properties: {
            database: { type: 'boolean' },
            redis: { type: 'boolean' },
            diskSpace: {
              type: 'object',
              properties: {
                free: { type: 'number' },
                total: { type: 'number' },
              },
            },
            memoryUsage: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                total: { type: 'number' },
              },
            },
            systemLoad: { type: 'array', items: { type: 'number' } },
            uptime: { type: 'number' },
          },
        },
      },
    },
  })
  async checkHealth() {
    return this.healthService.getHealthStatus();
  }
} 