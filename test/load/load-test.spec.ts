import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('Load Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    config = moduleFixture.get<ConfigService>(ConfigService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Performance Tests', () => {
    it('should handle 100 concurrent users', async () => {
      const numUsers = 100;
      const requests = Array(numUsers).fill(null).map(() => 
        request(app.getHttpServer())
          .get('/api/v1/students')
          .expect(200)
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / numUsers;

      expect(avgTime).toBeLessThan(300); // Tempo médio deve ser menor que 300ms
    });

    it('should handle 1000 requests per minute', async () => {
      const numRequests = 1000;
      const requests = Array(numRequests).fill(null).map(() => 
        request(app.getHttpServer())
          .get('/api/v1/students')
          .expect(200)
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const requestsPerSecond = numRequests / (totalTime / 1000);

      expect(requestsPerSecond).toBeGreaterThan(16); // Deve processar mais de 16 req/s
    });

    it('should handle large payloads', async () => {
      const largeData = {
        name: 'Test Student',
        email: 'test@example.com',
        institutionId: '123',
        grade: '5º ano',
        // Adicionar mais campos para simular payload grande
        ...Array(100).fill(null).reduce((acc, _, i) => ({
          ...acc,
          [`field${i}`]: `value${i}`
        }), {})
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .send(largeData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should handle database stress', async () => {
      const numOperations = 100;
      const operations = Array(numOperations).fill(null).map((_, i) => 
        prisma.student.create({
          data: {
            name: `Test Student ${i}`,
            email: `test${i}@example.com`,
            institutionId: '123',
            grade: '5º ano'
          }
        })
      );

      const startTime = Date.now();
      await Promise.all(operations);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / numOperations;

      expect(avgTime).toBeLessThan(100); // Tempo médio deve ser menor que 100ms
    });

    it('should handle cache performance', async () => {
      // Primeira requisição (sem cache)
      const startTime = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200);
      const firstRequestTime = Date.now() - startTime;

      // Segunda requisição (com cache)
      const cacheStartTime = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/students')
        .expect(200);
      const cachedRequestTime = Date.now() - cacheStartTime;

      // Requisição com cache deve ser significativamente mais rápida
      expect(cachedRequestTime).toBeLessThan(firstRequestTime * 0.5);
    });

    it('should handle concurrent writes', async () => {
      const numWrites = 50;
      const writes = Array(numWrites).fill(null).map((_, i) => 
        request(app.getHttpServer())
          .post('/api/v1/students')
          .send({
            name: `Concurrent Student ${i}`,
            email: `concurrent${i}@example.com`,
            institutionId: '123',
            grade: '5º ano'
          })
          .expect(201)
      );

      const startTime = Date.now();
      await Promise.all(writes);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTime = totalTime / numWrites;

      expect(avgTime).toBeLessThan(200); // Tempo médio deve ser menor que 200ms
    });
  });
}); 