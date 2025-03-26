import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { app } from './setup';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { CargoUsuario } from '@prisma/client';

describe('InsightsController (e2e)', () => {
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

  describe('POST /insights/previsoes', () => {
    it('should create a new prediction when authenticated as admin', () => {
      const createPrevisaoDto = {
        estudanteId,
        tipoPrevisao: 'RISCO_ACADEMICO',
        probabilidade: 0.75,
        recomendacoes: 'Recomendações para melhorar o desempenho acadêmico',
      };

      return request(app.getHttpServer())
        .post('/insights/previsoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createPrevisaoDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.estudanteId).toBe(estudanteId);
          expect(res.body.tipoPrevisao).toBe(createPrevisaoDto.tipoPrevisao);
          expect(res.body.probabilidade).toBe(createPrevisaoDto.probabilidade);
          expect(res.body.recomendacoes).toBe(createPrevisaoDto.recomendacoes);
        });
    });

    it('should not create prediction without authentication', () => {
      const createPrevisaoDto = {
        estudanteId,
        tipoPrevisao: 'RISCO_ACADEMICO',
        probabilidade: 0.75,
        recomendacoes: 'Recomendações para melhorar o desempenho acadêmico',
      };

      return request(app.getHttpServer())
        .post('/insights/previsoes')
        .send(createPrevisaoDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createPrevisaoDto = {
        estudanteId: '',
        tipoPrevisao: '',
        probabilidade: null,
        recomendacoes: '',
      };

      return request(app.getHttpServer())
        .post('/insights/previsoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createPrevisaoDto)
        .expect(400);
    });
  });

  describe('GET /insights/previsoes', () => {
    beforeEach(async () => {
      // Criar algumas previsões de teste
      const previsoes = [
        {
          estudanteId,
          tipoPrevisao: 'RISCO_ACADEMICO',
          probabilidade: 0.75,
          recomendacoes: 'Primeira recomendação',
        },
        {
          estudanteId,
          tipoPrevisao: 'SUCESSO_INTERVENCAO',
          probabilidade: 0.85,
          recomendacoes: 'Segunda recomendação',
        },
      ];

      for (const previsao of previsoes) {
        await request(app.getHttpServer())
          .post('/insights/previsoes')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(previsao)
          .expect(201);
      }
    });

    it('should list all predictions when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/insights/previsoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('estudanteId');
          expect(res.body[0]).toHaveProperty('tipoPrevisao');
          expect(res.body[0]).toHaveProperty('probabilidade');
          expect(res.body[0]).toHaveProperty('recomendacoes');
        });
    });

    it('should not list predictions without authentication', () => {
      return request(app.getHttpServer())
        .get('/insights/previsoes')
        .expect(401);
    });

    it('should filter predictions by student', () => {
      return request(app.getHttpServer())
        .get('/insights/previsoes')
        .query({ estudanteId })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(p => p.estudanteId === estudanteId)).toBe(true);
        });
    });

    it('should filter predictions by type', () => {
      return request(app.getHttpServer())
        .get('/insights/previsoes')
        .query({ tipoPrevisao: 'RISCO_ACADEMICO' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(p => p.tipoPrevisao === 'RISCO_ACADEMICO')).toBe(true);
        });
    });
  });

  describe('GET /insights/previsoes/:id', () => {
    let previsaoId: string;

    beforeEach(async () => {
      const createPrevisaoDto = {
        estudanteId,
        tipoPrevisao: 'RISCO_ACADEMICO',
        probabilidade: 0.75,
        recomendacoes: 'Recomendações para melhorar o desempenho acadêmico',
      };

      const response = await request(app.getHttpServer())
        .post('/insights/previsoes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createPrevisaoDto)
        .expect(201);

      previsaoId = response.body.id;
    });

    it('should get prediction by id when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/insights/previsoes/${previsaoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', previsaoId);
          expect(res.body.estudanteId).toBe(estudanteId);
          expect(res.body.tipoPrevisao).toBe('RISCO_ACADEMICO');
          expect(res.body.probabilidade).toBe(0.75);
          expect(res.body.recomendacoes).toBe('Recomendações para melhorar o desempenho acadêmico');
        });
    });

    it('should return 404 for non-existent prediction', () => {
      return request(app.getHttpServer())
        .get('/insights/previsoes/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should not get prediction without authentication', () => {
      return request(app.getHttpServer())
        .get(`/insights/previsoes/${previsaoId}`)
        .expect(401);
    });
  });

  describe('POST /insights/historico', () => {
    it('should create a new historical data entry when authenticated as admin', () => {
      const createHistoricoDto = {
        estudanteId,
        tipoMedicao: 'DESEMPENHO_ACADEMICO',
        valorNumerico: 85.5,
        valorTexto: 'Bom desempenho',
        data: new Date().toISOString(),
        fonte: 'AVALIACAO_SEMESTRAL',
      };

      return request(app.getHttpServer())
        .post('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createHistoricoDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.estudanteId).toBe(estudanteId);
          expect(res.body.tipoMedicao).toBe(createHistoricoDto.tipoMedicao);
          expect(res.body.valorNumerico).toBe(createHistoricoDto.valorNumerico);
          expect(res.body.valorTexto).toBe(createHistoricoDto.valorTexto);
          expect(res.body.fonte).toBe(createHistoricoDto.fonte);
        });
    });

    it('should not create historical data without authentication', () => {
      const createHistoricoDto = {
        estudanteId,
        tipoMedicao: 'DESEMPENHO_ACADEMICO',
        valorNumerico: 85.5,
        valorTexto: 'Bom desempenho',
        data: new Date().toISOString(),
        fonte: 'AVALIACAO_SEMESTRAL',
      };

      return request(app.getHttpServer())
        .post('/insights/historico')
        .send(createHistoricoDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      const createHistoricoDto = {
        estudanteId: '',
        tipoMedicao: '',
        valorNumerico: null,
        valorTexto: '',
        data: null,
        fonte: '',
      };

      return request(app.getHttpServer())
        .post('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createHistoricoDto)
        .expect(400);
    });
  });

  describe('GET /insights/historico', () => {
    beforeEach(async () => {
      // Criar alguns registros históricos de teste
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

    it('should list all historical data when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get('/insights/historico')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('estudanteId');
          expect(res.body[0]).toHaveProperty('tipoMedicao');
          expect(res.body[0]).toHaveProperty('valorNumerico');
          expect(res.body[0]).toHaveProperty('valorTexto');
          expect(res.body[0]).toHaveProperty('data');
          expect(res.body[0]).toHaveProperty('fonte');
        });
    });

    it('should not list historical data without authentication', () => {
      return request(app.getHttpServer())
        .get('/insights/historico')
        .expect(401);
    });

    it('should filter historical data by student', () => {
      return request(app.getHttpServer())
        .get('/insights/historico')
        .query({ estudanteId })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(h => h.estudanteId === estudanteId)).toBe(true);
        });
    });

    it('should filter historical data by measurement type', () => {
      return request(app.getHttpServer())
        .get('/insights/historico')
        .query({ tipoMedicao: 'DESEMPENHO_ACADEMICO' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every(h => h.tipoMedicao === 'DESEMPENHO_ACADEMICO')).toBe(true);
        });
    });
  });

  describe('GET /insights/analise/:estudanteId', () => {
    beforeEach(async () => {
      // Criar dados históricos para análise
      const historicos = [
        {
          estudanteId,
          tipoMedicao: 'DESEMPENHO_ACADEMICO',
          valorNumerico: 85.5,
          valorTexto: 'Bom desempenho',
          data: new Date().toISOString(),
          fonte: 'AVALIACAO_SEMESTRAL',
        },
        {
          estudanteId,
          tipoMedicao: 'COMPORTAMENTO',
          valorNumerico: 90.0,
          valorTexto: 'Comportamento adequado',
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

    it('should generate insights analysis when authenticated as admin', () => {
      return request(app.getHttpServer())
        .get(`/insights/analise/${estudanteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('estudanteId', estudanteId);
          expect(res.body).toHaveProperty('tendencias');
          expect(res.body).toHaveProperty('padroes');
          expect(res.body).toHaveProperty('recomendacoes');
          expect(Array.isArray(res.body.tendencias)).toBe(true);
          expect(Array.isArray(res.body.padroes)).toBe(true);
          expect(Array.isArray(res.body.recomendacoes)).toBe(true);
        });
    });

    it('should not generate insights analysis without authentication', () => {
      return request(app.getHttpServer())
        .get(`/insights/analise/${estudanteId}`)
        .expect(401);
    });

    it('should return 404 for non-existent student', () => {
      return request(app.getHttpServer())
        .get('/insights/analise/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 