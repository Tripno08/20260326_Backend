import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('MonitoringController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados
    await prisma.previsaoEstudante.deleteMany();
    await prisma.historicoDados.deleteMany();
    await prisma.estudante.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();

    // Criar um usuário admin para os testes
    const adminDto = {
      email: 'admin@example.com',
      senha: 'Admin@123',
      nome: 'Admin User',
      cargo: CargoUsuario.ADMIN,
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(adminDto)
      .expect(201);

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        senha: 'Admin@123',
      })
      .expect(200);

    adminToken = adminLoginResponse.body.access_token;
  });

  describe('Health Check Tests', () => {
    it('should return healthy status when all services are up', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('redis');
      expect(response.body.services).toHaveProperty('api');
      expect(response.body.services.database).toHaveProperty('status', 'up');
      expect(response.body.services.redis).toHaveProperty('status', 'up');
      expect(response.body.services.api).toHaveProperty('status', 'up');
    });

    it('should return detailed health information', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services.database).toHaveProperty('status');
      expect(response.body.services.database).toHaveProperty('latency');
      expect(response.body.services.database).toHaveProperty('connections');
      expect(response.body.services.redis).toHaveProperty('status');
      expect(response.body.services.redis).toHaveProperty('memory');
      expect(response.body.services.redis).toHaveProperty('connections');
      expect(response.body.services.api).toHaveProperty('status');
      expect(response.body.services.api).toHaveProperty('uptime');
      expect(response.body.services.api).toHaveProperty('requests');
    });
  });

  describe('Metrics Tests', () => {
    it('should collect and expose API metrics', async () => {
      // Realizar algumas requisições para gerar métricas
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('http_requests_total');
      expect(response.body).toHaveProperty('http_request_duration_seconds');
      expect(response.body).toHaveProperty('http_requests_in_progress');
      expect(response.body.http_requests_total).toHaveProperty('GET');
      expect(response.body.http_requests_total.GET).toBeGreaterThanOrEqual(2);
    });

    it('should track error rates', async () => {
      // Realizar uma requisição inválida
      await request(app.getHttpServer())
        .get('/students/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('http_requests_total');
      expect(response.body.http_requests_total).toHaveProperty('GET');
      expect(response.body.http_requests_total.GET).toHaveProperty('404');
      expect(response.body.http_requests_total.GET['404']).toBe(1);
    });
  });

  describe('Performance Monitoring Tests', () => {
    it('should track response times', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const metrics = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(metrics.body).toHaveProperty('http_request_duration_seconds');
      expect(metrics.body.http_request_duration_seconds).toHaveProperty('GET');
      expect(metrics.body.http_request_duration_seconds.GET).toHaveProperty('sum');
      expect(metrics.body.http_request_duration_seconds.GET.sum).toBeGreaterThan(0);
    });

    it('should track database query performance', async () => {
      // Realizar uma consulta complexa
      await request(app.getHttpServer())
        .get('/insights/analise/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      const metrics = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(metrics.body).toHaveProperty('database_query_duration_seconds');
      expect(metrics.body.database_query_duration_seconds).toHaveProperty('sum');
      expect(metrics.body.database_query_duration_seconds).toHaveProperty('count');
    });
  });

  describe('Resource Usage Tests', () => {
    it('should monitor memory usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('process_memory_usage_bytes');
      expect(response.body.process_memory_usage_bytes).toHaveProperty('heapUsed');
      expect(response.body.process_memory_usage_bytes).toHaveProperty('heapTotal');
      expect(response.body.process_memory_usage_bytes).toHaveProperty('external');
      expect(response.body.process_memory_usage_bytes.heapUsed).toBeGreaterThan(0);
      expect(response.body.process_memory_usage_bytes.heapTotal).toBeGreaterThan(0);
    });

    it('should monitor CPU usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('process_cpu_seconds_total');
      expect(response.body.process_cpu_seconds_total).toBeGreaterThan(0);
    });
  });

  describe('Alert Tests', () => {
    it('should trigger alerts for high error rates', async () => {
      // Simular múltiplos erros
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .get('/students/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      }

      const alerts = await request(app.getHttpServer())
        .get('/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(alerts.body).toHaveProperty('active');
      expect(Array.isArray(alerts.body.active)).toBe(true);
      expect(alerts.body.active.some(alert => 
        alert.type === 'HIGH_ERROR_RATE' && 
        alert.severity === 'WARNING'
      )).toBe(true);
    });

    it('should trigger alerts for high response times', async () => {
      // Simular operação lenta
      await request(app.getHttpServer())
        .get('/insights/analise/123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      const alerts = await request(app.getHttpServer())
        .get('/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(alerts.body).toHaveProperty('active');
      expect(Array.isArray(alerts.body.active)).toBe(true);
      expect(alerts.body.active.some(alert => 
        alert.type === 'HIGH_RESPONSE_TIME' && 
        alert.severity === 'WARNING'
      )).toBe(true);
    });
  });
}); 