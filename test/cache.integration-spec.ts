import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';
import { RedisService } from '../src/shared/redis/redis.service';

describe('CacheController (e2e)', () => {
  let prisma: PrismaService;
  let redis: RedisService;
  let adminToken: string;
  let estudanteId: string;

  beforeAll(async () => {
    prisma = app.get<PrismaService>(PrismaService);
    redis = app.get<RedisService>(RedisService);
  });

  beforeEach(async () => {
    // Limpar o banco de dados e cache
    await prisma.previsaoEstudante.deleteMany();
    await prisma.historicoDados.deleteMany();
    await prisma.estudante.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.credenciais.deleteMany();
    await redis.flushAll();

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

    // Criar um estudante para os testes
    const estudanteDto = {
      nome: 'Estudante Test',
      serie: '1º Ano',
      dataNascimento: '2010-01-01',
      usuarioId: adminLoginResponse.body.id,
    };

    const estudanteResponse = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(estudanteDto)
      .expect(201);

    estudanteId = estudanteResponse.body.id;
  });

  describe('Cache Operations Tests', () => {
    it('should cache student data', async () => {
      // Primeira requisição (sem cache)
      const firstResponse = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const firstResponseTime = firstResponse.headers['x-response-time'];

      // Segunda requisição (com cache)
      const secondResponse = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const secondResponseTime = secondResponse.headers['x-response-time'];

      // Verificar se a segunda requisição foi mais rápida
      expect(parseInt(secondResponseTime)).toBeLessThan(parseInt(firstResponseTime));
      expect(secondResponse.body).toEqual(firstResponse.body);
      expect(secondResponse.headers['x-cache']).toBe('HIT');
    });

    it('should invalidate cache when student is updated', async () => {
      // Primeira requisição (sem cache)
      const firstResponse = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Atualizar estudante
      await request(app.getHttpServer())
        .put(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Estudante Atualizado',
        })
        .expect(200);

      // Segunda requisição (deve ser sem cache devido à invalidação)
      const secondResponse = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(secondResponse.headers['x-cache']).toBe('MISS');
      expect(secondResponse.body.nome).toBe('Estudante Atualizado');
    });

    it('should cache list of students with pagination', async () => {
      // Criar mais estudantes para teste
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            nome: `Estudante ${i}`,
            serie: '1º Ano',
            dataNascimento: '2010-01-01',
            usuarioId: adminToken,
          })
          .expect(201);
      }

      // Primeira requisição (sem cache)
      const firstResponse = await request(app.getHttpServer())
        .get('/students')
        .query({ page: 1, limit: 3 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const firstResponseTime = firstResponse.headers['x-response-time'];

      // Segunda requisição (com cache)
      const secondResponse = await request(app.getHttpServer())
        .get('/students')
        .query({ page: 1, limit: 3 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const secondResponseTime = secondResponse.headers['x-response-time'];

      expect(parseInt(secondResponseTime)).toBeLessThan(parseInt(firstResponseTime));
      expect(secondResponse.headers['x-cache']).toBe('HIT');
      expect(secondResponse.body).toEqual(firstResponse.body);
    });

    it('should cache insights analysis with TTL', async () => {
      // Criar dados históricos para análise
      await request(app.getHttpServer())
        .post('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          estudanteId,
          tipoMedicao: 'DESEMPENHO_ACADEMICO',
          valorNumerico: 85.5,
          valorTexto: 'Teste de desempenho',
          data: new Date().toISOString(),
          fonte: 'AVALIACAO_SEMESTRAL',
        })
        .expect(201);

      // Primeira requisição (sem cache)
      const firstResponse = await request(app.getHttpServer())
        .get(`/insights/analise/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar TTL no cache
      const ttl = await redis.ttl(`insights:analise:${estudanteId}`);
      expect(ttl).toBeLessThanOrEqual(3600); // TTL máximo de 1 hora
      expect(ttl).toBeGreaterThan(0);

      // Segunda requisição (com cache)
      const secondResponse = await request(app.getHttpServer())
        .get(`/insights/analise/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(secondResponse.headers['x-cache']).toBe('HIT');
      expect(secondResponse.body).toEqual(firstResponse.body);
    });

    it('should handle cache errors gracefully', async () => {
      // Simular erro no Redis
      await redis.disconnect();

      // Requisição deve funcionar mesmo sem cache
      const response = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.headers['x-cache']).toBe('ERROR');
    });

    it('should use different cache keys for different users', async () => {
      // Criar outro usuário
      const user2Dto = {
        email: 'user2@example.com',
        senha: 'Test@123',
        nome: 'User 2',
        cargo: CargoUsuario.PROFESSOR,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(user2Dto)
        .expect(201);

      const user2LoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user2@example.com',
          senha: 'Test@123',
        })
        .expect(200);

      const user2Token = user2LoginResponse.body.access_token;

      // Requisição com admin
      const adminResponse = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Requisição com user2
      const user2Response = await request(app.getHttpServer())
        .get(`/students/${estudanteId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      // Verificar se os caches são diferentes
      const adminCacheKey = `students:${estudanteId}:${adminToken}`;
      const user2CacheKey = `students:${estudanteId}:${user2Token}`;

      const adminCache = await redis.get(adminCacheKey);
      const user2Cache = await redis.get(user2CacheKey);

      expect(adminCache).toBeDefined();
      expect(user2Cache).toBeDefined();
      expect(adminCache).not.toEqual(user2Cache);
    });
  });
}); 