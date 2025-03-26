import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('PerformanceController (e2e)', () => {
  let prisma: PrismaService;
  let adminToken: string;
  let professorToken: string;
  let professorId: string;
  let estudanteId: string;

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

    // Criar um usuário professor para os testes
    const professorDto = {
      email: 'professor@example.com',
      senha: 'Test@123',
      nome: 'Professor Test',
      cargo: CargoUsuario.PROFESSOR,
    };

    const professorResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(professorDto)
      .expect(201);

    professorId = professorResponse.body.id;

    const professorLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'professor@example.com',
        senha: 'Test@123',
      })
      .expect(200);

    professorToken = professorLoginResponse.body.access_token;

    // Criar um estudante para os testes
    const estudanteDto = {
      nome: 'Estudante Test',
      serie: '1º Ano',
      dataNascimento: '2010-01-01',
      usuarioId: professorId,
    };

    const estudanteResponse = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(estudanteDto)
      .expect(201);

    estudanteId = estudanteResponse.body.id;
  });

  describe('Cache Tests', () => {
    beforeEach(async () => {
      // Criar dados para teste de cache
      const historicos = [
        {
          estudanteId,
          tipoMedicao: 'DESEMPENHO_ACADEMICO',
          valorNumerico: 85.5,
          valorTexto: 'Primeiro registro',
          data: new Date().toISOString(),
          fonte: 'AVALIACAO_SEMESTRAL',
        },
        {
          estudanteId,
          tipoMedicao: 'COMPORTAMENTO',
          valorNumerico: 90.0,
          valorTexto: 'Segundo registro',
          data: new Date().toISOString(),
          fonte: 'OBSERVACAO_DIARIA',
        },
      ];

      for (const historico of historicos) {
        await request(app.getHttpServer())
          .post('/insights/historico')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(historico)
          .expect(201);
      }
    });

    it('should cache repeated requests to the same endpoint', async () => {
      const startTime = Date.now();
      
      // Primeira requisição
      const firstResponse = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const firstRequestTime = Date.now() - startTime;

      // Segunda requisição (deve ser mais rápida devido ao cache)
      const secondStartTime = Date.now();
      const secondResponse = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const secondRequestTime = Date.now() - secondStartTime;

      // Verificar se a segunda requisição foi mais rápida
      expect(secondRequestTime).toBeLessThan(firstRequestTime);
      expect(secondResponse.body).toEqual(firstResponse.body);
    });

    it('should invalidate cache when data is updated', async () => {
      // Primeira requisição
      const firstResponse = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Atualizar dados
      const updateDto = {
        estudanteId,
        tipoMedicao: 'DESEMPENHO_ACADEMICO',
        valorNumerico: 95.0,
        valorTexto: 'Registro atualizado',
        data: new Date().toISOString(),
        fonte: 'AVALIACAO_SEMESTRAL',
      };

      await request(app.getHttpServer())
        .post('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(201);

      // Segunda requisição (deve ter dados atualizados)
      const secondResponse = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(secondResponse.body.length).toBeGreaterThan(firstResponse.body.length);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should limit the number of requests per minute', async () => {
      const requests = Array(60).fill(null).map(() => 
        request(app.getHttpServer())
          .get('/insights/historico')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(requests);
      
      // Verificar se algumas requisições foram bloqueadas
      const blockedRequests = responses.filter(r => r.status === 429);
      expect(blockedRequests.length).toBeGreaterThan(0);
    });

    it('should return proper rate limit headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Compression Tests', () => {
    beforeEach(async () => {
      // Criar dados grandes para teste de compressão
      const historicos = Array(100).fill(null).map((_, index) => ({
        estudanteId,
        tipoMedicao: 'DESEMPENHO_ACADEMICO',
        valorNumerico: 85.5 + index,
        valorTexto: `Registro ${index} com texto longo para testar compressão...`,
        data: new Date().toISOString(),
        fonte: 'AVALIACAO_SEMESTRAL',
      }));

      for (const historico of historicos) {
        await request(app.getHttpServer())
          .post('/insights/historico')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(historico)
          .expect(201);
      }
    });

    it('should compress response when Accept-Encoding header is set', async () => {
      const response = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should not compress response when Accept-Encoding header is not set', async () => {
      const response = await request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-encoding']).toBeUndefined();
    });
  });

  describe('Query Optimization Tests', () => {
    beforeEach(async () => {
      // Criar dados para teste de otimização de consultas
      const historicos = Array(1000).fill(null).map((_, index) => ({
        estudanteId,
        tipoMedicao: index % 2 === 0 ? 'DESEMPENHO_ACADEMICO' : 'COMPORTAMENTO',
        valorNumerico: 85.5 + index,
        valorTexto: `Registro ${index}`,
        data: new Date(Date.now() - index * 86400000).toISOString(), // Dados distribuídos em dias
        fonte: 'AVALIACAO_SEMESTRAL',
      }));

      for (const historico of historicos) {
        await request(app.getHttpServer())
          .post('/insights/historico')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(historico)
          .expect(201);
      }
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/insights/historico')
        .query({ page: 1, limit: 50 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;
      
      expect(response.body.length).toBe(50);
      expect(queryTime).toBeLessThan(1000); // Deve responder em menos de 1 segundo
    });

    it('should handle filtering efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/insights/historico')
        .query({ 
          tipoMedicao: 'DESEMPENHO_ACADEMICO',
          dataInicio: new Date(Date.now() - 30 * 86400000).toISOString(), // Últimos 30 dias
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const queryTime = Date.now() - startTime;
      
      expect(response.body.every(h => h.tipoMedicao === 'DESEMPENHO_ACADEMICO')).toBe(true);
      expect(queryTime).toBeLessThan(1000); // Deve responder em menos de 1 segundo
    });
  });
}); 