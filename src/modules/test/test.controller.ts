import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface TestResponse {
  timestamp: string;
  message: string;
}

@ApiTags('test')
@Controller('test')
@UseGuards(ThrottlerGuard)
export class TestController {
  @Get('cache')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Teste de cache' })
  @ApiResponse({ status: 200, description: 'Retorna dados com cache' })
  async testCache(): Promise<TestResponse> {
    // Simula uma operação demorada
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      timestamp: new Date().toISOString(),
      message: 'Este endpoint está com cache ativado',
    };
  }

  @Get('rate-limit')
  @ApiOperation({ summary: 'Teste de rate limiting' })
  @ApiResponse({ status: 200, description: 'Retorna dados com rate limiting' })
  async testRateLimit(): Promise<TestResponse> {
    return {
      timestamp: new Date().toISOString(),
      message: 'Este endpoint está com rate limiting ativado',
    };
  }
} 